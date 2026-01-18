/**
 * Authentication Middleware
 * JWT verification, role-based access, sector permissions
 */

const { verifyAccessToken, extractTokenFromHeader, hasPermission } = require('../utils/jwt');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader) || req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
            });
        }

        const result = verifyAccessToken(token);
        if (!result.valid) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_TOKEN', message: result.error }
            });
        }

        req.user = result.payload;
        next();
    } catch (error) {
        logger.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'AUTH_ERROR', message: 'Authentication failed' }
        });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const token = extractTokenFromHeader(req.headers.authorization) || req.cookies?.accessToken;
        if (token) {
            const result = verifyAccessToken(token);
            if (result.valid) req.user = result.payload;
        }
        next();
    } catch { next(); }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }
    next();
};

const requirePermission = (sector, action) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }
    if (!hasPermission(req.user, sector, action)) {
        return res.status(403).json({
            success: false,
            error: { code: 'INSUFFICIENT_PERMISSION', message: `Need '${action}' permission for ${sector}` }
        });
    }
    next();
};

const requireKycLevel = (minLevel) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }
    if (req.user.kycLevel < minLevel) {
        const names = ['email', 'PAN', 'Aadhaar'];
        return res.status(403).json({
            success: false,
            error: { code: 'KYC_REQUIRED', message: `Requires ${names[minLevel]} verification` }
        });
    }
    next();
};

module.exports = { authenticate, optionalAuth, requireRole, requirePermission, requireKycLevel };
