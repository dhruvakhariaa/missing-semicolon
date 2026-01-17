/**
 * Department Routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const departmentController = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Public routes
router.get('/', departmentController.listDepartments);
router.get('/:id', departmentController.getDepartment);

// Admin routes
router.post('/',
    authenticate,
    authorize('admin'),
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('code').notEmpty().withMessage('Code is required')
    ],
    validate,
    departmentController.createDepartment
);

router.put('/:id',
    authenticate,
    authorize('admin'),
    departmentController.updateDepartment
);

module.exports = router;
