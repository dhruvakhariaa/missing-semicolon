/**
 * Face Authentication Middleware
 * 
 * Provides rate limiting, input validation, and lockout checking
 * for face authentication endpoints.
 */

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Rate limiter for face registration
 * 3 attempts per 15 minutes
 */
const faceRegisterLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 3,
    message: {
        success: false,
        error: {
            code: 'FACE_REGISTER_RATE_LIMITED',
            message: 'Too many face registration attempts. Please try again in 15 minutes.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.userId || req.ip
});

/**
 * Rate limiter for face verification
 * 5 attempts per 5 minutes
 */
const faceVerifyLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,  // 5 minutes
    max: 5,
    message: {
        success: false,
        error: {
            code: 'FACE_VERIFY_RATE_LIMITED',
            message: 'Too many face verification attempts. Please try again in 5 minutes.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.body?.email || req.ip
});

/**
 * Validate face image input
 * Checks for required fields and basic format validation
 */
const validateFaceImage = (req, res, next) => {
    const { image, images } = req.body;

    // Debug logging
    console.log('[DEBUG] validateFaceImage - Path:', req.path);
    console.log('[DEBUG] validateFaceImage - Body keys:', Object.keys(req.body || {}));
    console.log('[DEBUG] validateFaceImage - images type:', typeof images, 'isArray:', Array.isArray(images));
    if (images) {
        console.log('[DEBUG] validateFaceImage - images.length:', images.length);
    }

    // For single image (verification)
    if (req.path.includes('verify')) {
        if (!image) {
            return res.status(400).json({
                success: false,
                error: { code: 'MISSING_IMAGE', message: 'Face image is required' }
            });
        }

        if (typeof image !== 'string') {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_IMAGE', message: 'Image must be a base64 string' }
            });
        }

        // Check approximate size (10MB limit, base64 is ~1.37x larger)
        if (image.length > 14 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                error: { code: 'IMAGE_TOO_LARGE', message: 'Image too large. Maximum 10MB allowed.' }
            });
        }
    }

    // For multiple images (registration)
    if (req.path.includes('register')) {
        if (!images || !Array.isArray(images)) {
            return res.status(400).json({
                success: false,
                error: { code: 'MISSING_IMAGES', message: '5 face images are required' }
            });
        }

        if (images.length !== 5) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_IMAGE_COUNT', message: 'Exactly 5 face images are required' }
            });
        }

        for (let i = 0; i < images.length; i++) {
            if (typeof images[i] !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_IMAGE', message: `Image ${i + 1} must be a base64 string` }
                });
            }

            if (images[i].length > 14 * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'IMAGE_TOO_LARGE', message: `Image ${i + 1} too large. Maximum 10MB allowed.` }
                });
            }
        }
    }

    next();
};

/**
 * Check if face auth is globally enabled
 */
const checkFaceAuthEnabled = (req, res, next) => {
    const enabled = process.env.FACE_AUTH_ENABLED !== 'false';

    if (!enabled) {
        return res.status(503).json({
            success: false,
            error: { code: 'FACE_AUTH_DISABLED', message: 'Face authentication is currently disabled' }
        });
    }

    next();
};

/**
 * Log face auth attempts for security audit
 */
const logFaceAuthAttempt = (action) => (req, res, next) => {
    const userId = req.user?.userId || 'anonymous';
    const ip = req.ip || req.connection?.remoteAddress;

    logger.info(`Face auth ${action} attempt - User: ${userId}, IP: ${ip}`);

    // Store for audit
    req.faceAuthAudit = {
        action,
        userId,
        ip,
        timestamp: new Date()
    };

    next();
};

module.exports = {
    faceRegisterLimiter,
    faceVerifyLimiter,
    validateFaceImage,
    checkFaceAuthEnabled,
    logFaceAuthAttempt
};
