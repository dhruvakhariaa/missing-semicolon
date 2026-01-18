/**
 * Appointment Routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const appointmentController = require('../controllers/appointmentController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Create appointment - use optionalAuth for demo mode
router.post('/',
    optionalAuth, // Changed from authenticate to allow demo booking
    [
        body('doctor').optional(),
        body('doctorId').optional(),
        body('appointmentDate').notEmpty().withMessage('Appointment date is required'),
        body('timeSlot').notEmpty().withMessage('Time slot is required'),
        body('timeSlot.start').optional(),
        body('timeSlot.startTime').optional()
    ],
    validate,
    appointmentController.createAppointment
);

// List appointments - public for demo
router.get('/', optionalAuth, appointmentController.listAppointments);

// Get appointment by ID
router.get('/:id', optionalAuth, appointmentController.getAppointment);

// Update appointment - use optionalAuth for demo
router.put('/:id', optionalAuth, appointmentController.updateAppointment);

// Cancel appointment - use optionalAuth for demo
router.delete('/:id', optionalAuth, appointmentController.cancelAppointment);

module.exports = router;
