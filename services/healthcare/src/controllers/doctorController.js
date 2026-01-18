/**
 * Doctor Controller
 * Handles doctor-related HTTP requests
 */

const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { sendResponse, sendPaginatedResponse, generateTimeSlots, formatDate } = require('../utils/helpers');
const { getCache, setCache } = require('../config/redis');
const logger = require('../utils/logger');

// List all doctors with filtering
const listDoctors = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            department,
            specialization,
            search,
            active = 'true'
        } = req.query;

        const filter = {};
        if (active !== undefined) filter.isActive = active === 'true';
        if (department) filter.department = department;
        if (specialization) filter.specialization = new RegExp(specialization, 'i');
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { specialization: new RegExp(search, 'i') }
            ];
        }

        const doctors = await Doctor.find(filter)
            .populate('department', 'name code')
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Doctor.countDocuments(filter);

        return sendPaginatedResponse(res, doctors, page, limit, total);
    } catch (error) {
        next(error);
    }
};

// Get single doctor
const getDoctor = async (req, res, next) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findById(id)
            .populate('department', 'name code description');

        if (!doctor) {
            return sendResponse(res, 404, false, null, null, {
                code: 'NOT_FOUND',
                message: 'Doctor not found'
            });
        }

        return sendResponse(res, 200, true, doctor);
    } catch (error) {
        next(error);
    }
};

// Get doctors by department
const getDoctorsByDepartment = async (req, res, next) => {
    try {
        const { departmentId } = req.params;
        const { active = 'true' } = req.query;

        const filter = { department: departmentId };
        if (active !== undefined) filter.isActive = active === 'true';

        const doctors = await Doctor.find(filter)
            .populate('department', 'name code')
            .sort({ name: 1 });

        return sendResponse(res, 200, true, doctors);
    } catch (error) {
        next(error);
    }
};

// Get doctor availability for a specific date
const getDoctorAvailability = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!date) {
            return sendResponse(res, 400, false, null, null, {
                code: 'VALIDATION_ERROR',
                message: 'Date is required'
            });
        }

        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return sendResponse(res, 404, false, null, null, {
                code: 'NOT_FOUND',
                message: 'Doctor not found'
            });
        }

        // Check cache first
        const cacheKey = `slots:${id}:${date}`;
        const cached = await getCache(cacheKey);
        if (cached) {
            return sendResponse(res, 200, true, {
                doctor: { id: doctor._id, name: doctor.name },
                date,
                slots: cached,
                fromCache: true
            });
        }

        // Check if the day is available for this doctor
        const requestDate = new Date(date);
        const dayName = requestDate.toLocaleDateString('en-US', { weekday: 'long' });

        if (!doctor.availability.days.includes(dayName)) {
            return sendResponse(res, 200, true, {
                doctor: { id: doctor._id, name: doctor.name },
                date,
                slots: [],
                message: `Doctor is not available on ${dayName}s`
            });
        }

        // Generate all possible slots for the doctor
        const [startHour] = doctor.availability.startTime.split(':').map(Number);
        const [endHour] = doctor.availability.endTime.split(':').map(Number);
        const allSlots = generateTimeSlots(startHour, endHour, doctor.availability.slotDuration);

        // Find booked slots for this date
        const bookedAppointments = await Appointment.find({
            doctor: id,
            appointmentDate: {
                $gte: new Date(date),
                $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
            },
            status: { $in: ['scheduled', 'confirmed'] }
        }).select('timeSlot');

        const bookedTimes = bookedAppointments.map(apt => apt.timeSlot.startTime);

        // Mark slots as available or booked
        const slots = allSlots.map(slot => ({
            ...slot,
            isAvailable: !bookedTimes.includes(slot.startTime)
        }));

        // Cache the result for 5 minutes
        await setCache(cacheKey, slots, 300);

        return sendResponse(res, 200, true, {
            doctor: { id: doctor._id, name: doctor.name },
            date,
            slots
        });
    } catch (error) {
        next(error);
    }
};

// Create doctor (admin only)
const createDoctor = async (req, res, next) => {
    try {
        const doctor = new Doctor(req.body);
        await doctor.save();

        logger.info(`Doctor created: ${doctor.name}`);
        return sendResponse(res, 201, true, doctor, 'Doctor created successfully');
    } catch (error) {
        next(error);
    }
};

// Update doctor (admin only)
const updateDoctor = async (req, res, next) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!doctor) {
            return sendResponse(res, 404, false, null, null, {
                code: 'NOT_FOUND',
                message: 'Doctor not found'
            });
        }

        return sendResponse(res, 200, true, doctor, 'Doctor updated successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listDoctors,
    getDoctor,
    getDoctorsByDepartment,
    getDoctorAvailability,
    createDoctor,
    updateDoctor
};
