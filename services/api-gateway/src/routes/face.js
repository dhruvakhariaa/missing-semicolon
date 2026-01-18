/**
 * Face Authentication Routes
 * 
 * Endpoints for face registration and verification using InspireFace SDK.
 * Integrates with Python face service for biometric processing.
 */

const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const {
    faceRegisterLimiter,
    faceVerifyLimiter,
    validateFaceImage,
    checkFaceAuthEnabled,
    logFaceAuthAttempt
} = require('../middleware/faceAuth');
const {
    sanitizeInputs,
    blockNoSqlInjection
} = require('../middleware/inputSanitizer');

const faceAuthService = require('../services/faceAuthService');
const logger = require('../utils/logger');

// Increase body size limit for face images (5 images * ~2MB each = ~10MB, with base64 overhead ~15MB)
router.use(express.json({ limit: '50mb' }));

// Apply sanitization to all routes
router.use(sanitizeInputs());
router.use(blockNoSqlInjection);

// Check if face auth is enabled globally
router.use(checkFaceAuthEnabled);

/**
 * GET /api/face/health
 * Check face service health
 */
router.get('/health', async (req, res) => {
    try {
        const health = await faceAuthService.checkFaceServiceHealth();
        res.json({
            success: true,
            data: health
        });
    } catch (error) {
        logger.error('Face health check error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'HEALTH_CHECK_FAILED', message: 'Failed to check face service health' }
        });
    }
});

/**
 * GET /api/face/status
 * Get face auth status for current user
 * Requires authentication
 */
router.get('/status',
    authenticate,
    async (req, res) => {
        try {
            const result = await faceAuthService.getFaceAuthStatus(req.user.userId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.json(result);
        } catch (error) {
            logger.error('Face status error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Failed to get face auth status' }
            });
        }
    }
);

/**
 * POST /api/face/register
 * Register face for authentication (requires 5 images)
 * Requires authentication
 */
router.post('/register',
    authenticate,
    faceRegisterLimiter,
    logFaceAuthAttempt('register'),
    validateFaceImage,
    async (req, res) => {
        try {
            const { images } = req.body;

            const result = await faceAuthService.registerFace(req.user.userId, images);

            if (!result.success) {
                const statusCode = result.error?.code === 'SERVICE_UNAVAILABLE' ? 503 : 400;
                return res.status(statusCode).json(result);
            }

            logger.info(`Face registered for user: ${req.user.email}`);

            res.status(201).json(result);
        } catch (error) {
            logger.error('Face register error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Face registration failed' }
            });
        }
    }
);

/**
 * POST /api/face/verify
 * Verify face against stored embedding
 * Used during login flow (requires face verify token, not JWT)
 */
router.post('/verify',
    faceVerifyLimiter,
    logFaceAuthAttempt('verify'),
    validateFaceImage,
    async (req, res) => {
        try {
            const { image, userId, faceVerifyToken } = req.body;

            // Validate token (temporary token issued after OTP verification)
            if (!faceVerifyToken || !userId) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_TOKEN', message: 'Face verification token and user ID required' }
                });
            }

            // Verify the temporary token
            const jwt = require('jsonwebtoken');
            try {
                const payload = jwt.verify(faceVerifyToken, process.env.JWT_ACCESS_SECRET);
                if (payload.userId !== userId || payload.type !== 'face_verify') {
                    return res.status(401).json({
                        success: false,
                        error: { code: 'INVALID_TOKEN', message: 'Invalid face verification token' }
                    });
                }
            } catch (tokenError) {
                return res.status(401).json({
                    success: false,
                    error: { code: 'TOKEN_EXPIRED', message: 'Face verification token expired. Please login again.' }
                });
            }

            const result = await faceAuthService.verifyFace(userId, image);

            if (!result.success) {
                const statusCode = result.error?.code === 'SERVICE_UNAVAILABLE' ? 503 :
                    result.error?.code === 'FACE_AUTH_LOCKED' ? 423 : 401;
                return res.status(statusCode).json(result);
            }

            res.json(result);
        } catch (error) {
            logger.error('Face verify error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Face verification failed' }
            });
        }
    }
);

/**
 * POST /api/face/disable
 * Disable face authentication for current user
 * Requires authentication
 */
router.post('/disable',
    authenticate,
    async (req, res) => {
        try {
            const result = await faceAuthService.disableFaceAuth(req.user.userId);

            if (!result.success) {
                return res.status(400).json(result);
            }

            logger.info(`Face auth disabled for user: ${req.user.email}`);

            res.json(result);
        } catch (error) {
            logger.error('Face disable error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Failed to disable face auth' }
            });
        }
    }
);

module.exports = router;
