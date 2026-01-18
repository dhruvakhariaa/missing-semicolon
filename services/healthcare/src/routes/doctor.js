/**
 * Doctor Routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const doctorController = require('../controllers/doctorController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Public routes
router.get('/', optionalAuth, doctorController.listDoctors);
router.get('/:id', optionalAuth, doctorController.getDoctor);
router.get('/:id/availability', optionalAuth, doctorController.getDoctorAvailability);
router.get('/department/:departmentId', optionalAuth, doctorController.getDoctorsByDepartment);

// Admin routes
router.post('/',
    authenticate,
    authorize('admin'),
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('phone').notEmpty().withMessage('Phone is required'),
        body('department').notEmpty().withMessage('Department is required'),
        body('specialization').notEmpty().withMessage('Specialization is required'),
        body('qualification').notEmpty().withMessage('Qualification is required')
    ],
    validate,
    doctorController.createDoctor
);

router.put('/:id',
    authenticate,
    authorize('admin'),
    doctorController.updateDoctor
);

module.exports = router;
