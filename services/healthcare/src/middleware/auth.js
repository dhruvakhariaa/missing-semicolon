/**
 * Authentication Middleware
 * Verifies JWT tokens passed from API Gateway
 */

const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendResponse(res, 401, false, null, null, {
                code: 'UNAUTHORIZED',
                message: 'Access token is required'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user info to request
        req.user = {
            id: decoded.id || decoded.userId,
            email: decoded.email,
            role: decoded.role || 'citizen'
        };

        next();
    } catch (error) {
        logger.error('Authentication error:', error);

        if (error.name === 'TokenExpiredError') {
            return sendResponse(res, 401, false, null, null, {
                code: 'TOKEN_EXPIRED',
                message: 'Access token has expired'
            });
        }

        return sendResponse(res, 401, false, null, null, {
            code: 'INVALID_TOKEN',
            message: 'Invalid access token'
        });
    }
};

// Optional auth - allows unauthenticated access but parses token if present
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = {
                id: decoded.id || decoded.userId,
                email: decoded.email,
                role: decoded.role || 'citizen'
            };
        }

        next();
    } catch (error) {
        // Token invalid, but that's okay for optional auth
        next();
    }
};

// Role-based access control
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendResponse(res, 401, false, null, null, {
                code: 'UNAUTHORIZED',
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return sendResponse(res, 403, false, null, null, {
                code: 'FORBIDDEN',
                message: 'You do not have permission to access this resource'
            });
        }

        next();
    };
};

module.exports = { authenticate, optionalAuth, authorize };
