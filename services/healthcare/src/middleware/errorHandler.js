/**
 * Global Error Handler Middleware
 */

const logger = require('../utils/logger');
const { sendResponse } = require('../utils/helpers');

const errorHandler = (err, req, res, next) => {
    logger.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const details = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        return sendResponse(res, 400, false, null, null, {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return sendResponse(res, 409, false, null, null, {
            code: 'CONFLICT',
            message: `${field} already exists`
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return sendResponse(res, 400, false, null, null, {
            code: 'INVALID_ID',
            message: 'Invalid ID format'
        });
    }

    // Default to 500 server error
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    return sendResponse(res, statusCode, false, null, null, {
        code: 'INTERNAL_ERROR',
        message
    });
};

const notFoundHandler = (req, res) => {
    return sendResponse(res, 404, false, null, null, {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
};

module.exports = { errorHandler, notFoundHandler };
