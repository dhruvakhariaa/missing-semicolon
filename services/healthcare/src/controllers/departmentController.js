/**
 * Department Controller
 * Handles department-related HTTP requests
 */

const Department = require('../models/Department');
const { sendResponse, sendPaginatedResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

// List all departments
const listDepartments = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, active } = req.query;

        const filter = {};
        if (active !== undefined) filter.isActive = active === 'true';

        const departments = await Department.find(filter)
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Department.countDocuments(filter);

        return sendPaginatedResponse(res, departments, page, limit, total);
    } catch (error) {
        next(error);
    }
};

// Get single department
const getDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const department = await Department.findById(id);

        if (!department) {
            return sendResponse(res, 404, false, null, null, {
                code: 'NOT_FOUND',
                message: 'Department not found'
            });
        }

        return sendResponse(res, 200, true, department);
    } catch (error) {
        next(error);
    }
};

// Create department (admin only)
const createDepartment = async (req, res, next) => {
    try {
        const department = new Department(req.body);
        await department.save();

        logger.info(`Department created: ${department.name}`);
        return sendResponse(res, 201, true, department, 'Department created successfully');
    } catch (error) {
        next(error);
    }
};

// Update department (admin only)
const updateDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const department = await Department.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!department) {
            return sendResponse(res, 404, false, null, null, {
                code: 'NOT_FOUND',
                message: 'Department not found'
            });
        }

        return sendResponse(res, 200, true, department, 'Department updated successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listDepartments,
    getDepartment,
    createDepartment,
    updateDepartment
};
