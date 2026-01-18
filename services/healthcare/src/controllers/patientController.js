/**
 * Patient Controller
 * Handles patient-related HTTP requests
 */

const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const { sendResponse, sendPaginatedResponse } = require('../utils/helpers');
const { publishEvent } = require('../config/rabbitmq');
const logger = require('../utils/logger');

// Register new patient
const registerPatient = async (req, res, next) => {
    try {
        const { name, email, phone, dateOfBirth, gender, address } = req.body;

        // Use userId from JWT token
        const userId = req.user.id;

        // Check if patient already exists
        const existingPatient = await Patient.findOne({ userId });
        if (existingPatient) {
            return sendResponse(res, 409, false, null, null, {
                code: 'CONFLICT',
                message: 'Patient profile already exists'
            });
        }

        const patient = new Patient({
            userId,
            name,
            email: email || req.user.email,
            phone,
            dateOfBirth,
            gender,
            address
        });

        await patient.save();

        // Publish event
        await publishEvent('patient.registered', {
            patientId: patient._id,
            userId: patient.userId,
            name: patient.name,
            email: patient.email
        });

        logger.info(`Patient registered: ${patient.name}`, { patientId: patient._id });
        return sendResponse(res, 201, true, patient, 'Patient registered successfully');
    } catch (error) {
        next(error);
    }
};

// Get patient profile (own profile)
const getPatient = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check authorization - users can only see their own profile unless admin
        const patient = await Patient.findById(id);

        if (!patient) {
            return sendResponse(res, 404, false, null, null, {
                code: 'NOT_FOUND',
                message: 'Patient not found'
            });
        }

        if (patient.userId !== req.user.id && req.user.role !== 'admin') {
            return sendResponse(res, 403, false, null, null, {
                code: 'FORBIDDEN',
                message: 'You can only view your own profile'
            });
        }

        return sendResponse(res, 200, true, patient);
    } catch (error) {
        next(error);
    }
};

// Get current user's patient profile
const getMyProfile = async (req, res, next) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.id });

        if (!patient) {
            return sendResponse(res, 404, false, null, null, {
                code: 'NOT_FOUND',
                message: 'Patient profile not found. Please register first.'
            });
        }

        return sendResponse(res, 200, true, patient);
    } catch (error) {
        next(error);
    }
};

// Update patient profile
const updatePatient = async (req, res, next) => {
    try {
        const { id } = req.params;

        const patient = await Patient.findById(id);

        if (!patient) {
            return sendResponse(res, 404, false, null, null, {
                code: 'NOT_FOUND',
                message: 'Patient not found'
            });
        }

        // Check authorization
        if (patient.userId !== req.user.id && req.user.role !== 'admin') {
            return sendResponse(res, 403, false, null, null, {
                code: 'FORBIDDEN',
                message: 'You can only update your own profile'
            });
        }

        // Fields that can be updated
        const allowedUpdates = [
            'name', 'phone', 'dateOfBirth', 'gender', 'bloodGroup',
            'address', 'emergencyContact', 'medicalHistory'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                patient[field] = req.body[field];
            }
        });

        await patient.save();

        return sendResponse(res, 200, true, patient, 'Profile updated successfully');
    } catch (error) {
        next(error);
    }
};

// Get patient's appointments
const getPatientAppointments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        const patient = await Patient.findById(id);

        if (!patient) {
            return sendResponse(res, 404, false, null, null, {
                code: 'NOT_FOUND',
                message: 'Patient not found'
            });
        }

        // Check authorization
        if (patient.userId !== req.user.id && req.user.role !== 'admin') {
            return sendResponse(res, 403, false, null, null, {
                code: 'FORBIDDEN',
                message: 'You can only view your own appointments'
            });
        }

        const filter = { patient: id };
        if (status) filter.status = status;

        const appointments = await Appointment.find(filter)
            .populate('doctor', 'name specialization')
            .populate('department', 'name')
            .sort({ appointmentDate: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Appointment.countDocuments(filter);

        return sendPaginatedResponse(res, appointments, page, limit, total);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerPatient,
    getPatient,
    getMyProfile,
    updatePatient,
    getPatientAppointments
};
