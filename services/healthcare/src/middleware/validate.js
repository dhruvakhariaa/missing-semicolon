/**
 * Validation Middleware
 * Handles express-validator results
 */

const { validationResult } = require('express-validator');
const { sendResponse } = require('../utils/helpers');

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));

        return sendResponse(res, 400, false, null, null, {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: formattedErrors
        });
    }

    next();
};

module.exports = { validate };
