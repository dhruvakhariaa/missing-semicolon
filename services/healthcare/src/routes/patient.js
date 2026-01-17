/**
 * Patient Routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const patientController = require('../controllers/patientController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All patient routes require authentication
router.use(authenticate);

// Get current user's profile
router.get('/me', patientController.getMyProfile);

// Register patient (create profile)
router.post('/',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('phone').notEmpty().withMessage('Phone is required')
    ],
    validate,
    patientController.registerPatient
);

// Get patient by ID
router.get('/:id', patientController.getPatient);

// Update patient
router.put('/:id', patientController.updatePatient);

// Get patient's appointments
router.get('/:id/appointments', patientController.getPatientAppointments);

module.exports = router;
