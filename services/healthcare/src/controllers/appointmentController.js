/**
 * Appointment Controller
 * Handles appointment booking and management
 */

const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const { sendResponse, sendPaginatedResponse } = require('../utils/helpers');
const { deleteCache } = require('../config/redis');
const { publishEvent } = require('../config/rabbitmq');
const logger = require('../utils/logger');

// Create appointment
const createAppointment = async (req, res, next) => {
    try {
        // Support both field naming conventions
        const doctorId = req.body.doctorId || req.body.doctor;
        const departmentId = req.body.departmentId;
        const appointmentDate = req.body.appointmentDate;
        const symptoms = req.body.symptoms;
        const consultationType = req.body.consultationType || req.body.type || 'in-person';

        // Normalize timeSlot - support both {start, end} and {startTime, endTime}
        let timeSlot = req.body.timeSlot || {};
        if (timeSlot.start && !timeSlot.startTime) {
            timeSlot = {
                startTime: timeSlot.start,
                endTime: timeSlot.end || timeSlot.start
            };
        }

        // Get or create patient (demo mode support)
        let patient;
        if (req.user && req.user.id) {
            patient = await Patient.findOne({ userId: req.user.id });
        }

        // Demo mode - create/find demo patient
        if (!patient) {
            patient = await Patient.findOne({ email: 'demo@healthcare.gov.in' });
            if (!patient) {
                patient = new Patient({
                    userId: 'demo-user-id',
                    name: 'Demo Patient',
                    email: 'demo@healthcare.gov.in',
                    phone: '9876543210',
                    gender: 'Other',
                    dateOfBirth: new Date('1990-01-01')
                });
                await patient.save();
                logger.info('Created demo patient for booking');
            }
        }

        // Validate doctor exists and is active
        const doctor = await Doctor.findById(doctorId);
        if (!doctor || !doctor.isActive) {
            return sendResponse(res, 404, false, null, null, {
                code: 'NOT_FOUND',
                message: 'Doctor not found or not available'
            });
        }

        // Validate department
        const department = departmentId
            ? await Department.findById(departmentId)
            : await Department.findById(doctor.department);

        if (!department) {
            return sendResponse(res, 404, false, null, null, {
                code: 'NOT_FOUND',
                message: 'Department not found'
            });
        }

        // Check for conflicting appointments
        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            appointmentDate: {
                $gte: new Date(appointmentDate),
                $lt: new Date(new Date(appointmentDate).setDate(new Date(appointmentDate).getDate() + 1))
            },
            'timeSlot.startTime': timeSlot.startTime,
            status: { $in: ['scheduled', 'confirmed'] }
        });

        if (existingAppointment) {
            return sendResponse(res, 409, false, null, null, {
                code: 'SLOT_UNAVAILABLE',
                message: 'This time slot is no longer available'
            });
        }

        // Create appointment
        const appointment = new Appointment({
            patient: patient._id,
            doctor: doctorId,
            department: department._id,
            appointmentDate: new Date(appointmentDate),
            timeSlot,
            symptoms,
            consultationType,
            fee: doctor.consultationFee
        });

        await appointment.save();

        // Invalidate cache for this doctor's slots
        const dateStr = new Date(appointmentDate).toISOString().split('T')[0];
        await deleteCache(`slots:${doctorId}:${dateStr}`);

        // Publish event (non-blocking)
        publishEvent('appointment.created', {
            appointmentId: appointment._id,
            appointmentNumber: appointment.appointmentNumber,
            patientId: patient._id,
            patientName: patient.name,
            doctorId: doctor._id,
            doctorName: doctor.name,
            departmentId: department._id,
            departmentName: department.name,
            appointmentDate: appointment.appointmentDate,
            timeSlot: appointment.timeSlot
        }).catch(err => logger.warn('Failed to publish event', err));

        // Populate and return
        await appointment.populate([
            { path: 'doctor', select: 'name specialization consultationFee' },
            { path: 'department', select: 'name location' }
        ]);

        logger.info(`Appointment created: ${appointment.appointmentNumber}`, {
            patientId: patient._id,
            doctorId,
            date: appointmentDate
        });

        return sendResponse(res, 201, true, appointment, 'Appointment booked successfully');
    } catch (error) {
        next(error);
    }
};

// Get appointment by ID
const getAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id)
            .populate('patient', 'name email phone')
            .populate('doctor', 'name specialization phone email')
            .populate('department', 'name location');

        if (!appointment) {
            return sendResponse(res, 404, false, null, null, {
                code: 'NOT_FOUND',
                message: 'Appointment not found'
            });
        }

        // Check authorization
        const patient = await Patient.findById(appointment.patient._id);
        if (patient.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'provider') {
            return sendResponse(res, 403, false, null, null, {
                code: 'FORBIDDEN',
                message: 'You do not have access to this appointment'
            });
        }

        return sendResponse(res, 200, true, appointment);
    } catch (error) {
        next(error);
    }
};

// List appointments (for current user or demo)
const listAppointments = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10, upcoming } = req.query;

        // Get patient for current user or demo patient
        let patient;
        if (req.user && req.user.id) {
            patient = await Patient.findOne({ userId: req.user.id });
        }

        // Demo mode - find demo patient
        if (!patient) {
            patient = await Patient.findOne({ email: 'demo@healthcare.gov.in' });
        }

        if (!patient) {
            return sendResponse(res, 200, true, [], 'No appointments found');
        }

        const filter = { patient: patient._id };

        if (status) {
            filter.status = status;
        }

        if (upcoming === 'true') {
            filter.appointmentDate = { $gte: new Date() };
            filter.status = { $in: ['scheduled', 'confirmed'] };
        }

        const appointments = await Appointment.find(filter)
            .populate('doctor', 'name specialization profileImage')
            .populate('department', 'name')
            .sort({ appointmentDate: upcoming === 'true' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Appointment.countDocuments(filter);

        return sendPaginatedResponse(res, appointments, page, limit, total);
    } catch (error) {
        next(error);
    }
};

// Update appointment
const updateAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { appointmentDate, timeSlot, symptoms, notes } = req.body;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return sendResponse(res, 404, false, null, null, {
                code: 'NOT_FOUND',
                message: 'Appointment not found'
            });
        }

        // Check authorization
        const patient = await Patient.findById(appointment.patient);
        if (patient.userId !== req.user.id && req.user.role !== 'admin') {
            return sendResponse(res, 403, false, null, null, {
                code: 'FORBIDDEN',
                message: 'You can only update your own appointments'
            });
        }

        // Can only update scheduled appointments
        if (appointment.status !== 'scheduled') {
            return sendResponse(res, 400, false, null, null, {
                code: 'INVALID_STATUS',
                message: 'Can only update scheduled appointments'
            });
        }

        // If changing time slot, check availability
        if (appointmentDate || timeSlot) {
            const newDate = appointmentDate || appointment.appointmentDate;
            const newSlot = timeSlot || appointment.timeSlot;

            const conflict = await Appointment.findOne({
                _id: { $ne: id },
                doctor: appointment.doctor,
                appointmentDate: {
                    $gte: new Date(newDate),
                    $lt: new Date(new Date(newDate).setDate(new Date(newDate).getDate() + 1))
                },
                'timeSlot.startTime': newSlot.startTime,
                status: { $in: ['scheduled', 'confirmed'] }
            });

            if (conflict) {
                return sendResponse(res, 409, false, null, null, {
                    code: 'SLOT_UNAVAILABLE',
                    message: 'This time slot is not available'
                });
            }

            if (appointmentDate) appointment.appointmentDate = new Date(appointmentDate);
            if (timeSlot) appointment.timeSlot = timeSlot;
        }

        if (symptoms) appointment.symptoms = symptoms;
        if (notes) appointment.notes = notes;

        await appointment.save();

        await appointment.populate([
            { path: 'doctor', select: 'name specialization' },
            { path: 'department', select: 'name' }
        ]);

        return sendResponse(res, 200, true, appointment, 'Appointment updated successfully');
    } catch (error) {
        next(error);
    }
};

// Cancel appointment
const cancelAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return sendResponse(res, 404, false, null, null, {
                code: 'NOT_FOUND',
                message: 'Appointment not found'
            });
        }

        // Check authorization - allow demo mode
        const patient = await Patient.findById(appointment.patient);
        const isDemoPatient = patient?.email === 'demo@healthcare.gov.in';
        const isOwner = req.user && patient?.userId === req.user.id;
        const isAdmin = req.user && req.user.role === 'admin';

        if (!isDemoPatient && !isOwner && !isAdmin) {
            return sendResponse(res, 403, false, null, null, {
                code: 'FORBIDDEN',
                message: 'You can only cancel your own appointments'
            });
        }

        // Can only cancel scheduled/confirmed appointments
        if (!['scheduled', 'confirmed'].includes(appointment.status)) {
            return sendResponse(res, 400, false, null, null, {
                code: 'INVALID_STATUS',
                message: 'This appointment cannot be cancelled'
            });
        }

        appointment.status = 'cancelled';
        appointment.cancelledAt = new Date();
        appointment.cancellationReason = reason || 'Cancelled by patient';

        await appointment.save();

        // Invalidate cache
        const dateStr = appointment.appointmentDate.toISOString().split('T')[0];
        await deleteCache(`slots:${appointment.doctor}:${dateStr}`);

        // Publish event (non-blocking)
        publishEvent('appointment.cancelled', {
            appointmentId: appointment._id,
            appointmentNumber: appointment.appointmentNumber,
            patientId: patient?._id,
            doctorId: appointment.doctor,
            reason: appointment.cancellationReason
        }).catch(err => logger.warn('Failed to publish event', err));

        logger.info(`Appointment cancelled: ${appointment.appointmentNumber}`);

        return sendResponse(res, 200, true, appointment, 'Appointment cancelled successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAppointment,
    getAppointment,
    listAppointments,
    updateAppointment,
    cancelAppointment
};
