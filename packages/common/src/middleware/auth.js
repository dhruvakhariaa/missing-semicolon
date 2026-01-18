const jwt = require('jsonwebtoken');

/**
 * Authenticate JWT token
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-jwt-secret');

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            assignedSector: decoded.assignedSector || null
        };

        req.correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Token expired' });
        }
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-jwt-secret');
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                assignedSector: decoded.assignedSector || null
            };
        }
        next();
    } catch (error) {
        next();
    }
};

module.exports = { authenticate, optionalAuth };
