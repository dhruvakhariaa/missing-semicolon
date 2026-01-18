/**
 * Error Handler Middleware
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message
        }
    });
};

const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`
        }
    });
};

module.exports = { errorHandler, notFoundHandler };
