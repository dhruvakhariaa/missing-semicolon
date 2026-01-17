/**
 * Appointment Routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All appointment routes require authentication
router.use(authenticate);

// Create appointment
router.post('/',
    [
        body('doctorId').notEmpty().withMessage('Doctor ID is required'),
        body('appointmentDate').notEmpty().withMessage('Appointment date is required'),
        body('timeSlot').notEmpty().withMessage('Time slot is required'),
        body('timeSlot.startTime').notEmpty().withMessage('Start time is required'),
        body('timeSlot.endTime').notEmpty().withMessage('End time is required')
    ],
    validate,
    appointmentController.createAppointment
);

// List current user's appointments
router.get('/', appointmentController.listAppointments);

// Get appointment by ID
router.get('/:id', appointmentController.getAppointment);

// Update appointment
router.put('/:id', appointmentController.updateAppointment);

// Cancel appointment
router.delete('/:id', appointmentController.cancelAppointment);

module.exports = router;
