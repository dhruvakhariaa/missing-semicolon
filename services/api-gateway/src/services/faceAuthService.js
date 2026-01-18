/**
 * Face Authentication Service
 * 
 * Handles face registration and verification by calling the Python InspireFace service.
 * Manages encryption/decryption of face embeddings and business logic for lockout.
 */

const axios = require('axios');
const User = require('../models/User');
const { encryptField, decryptField } = require('../utils/encryption');
const logger = require('../utils/logger');

// Configuration
const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || 'http://localhost:5001';
const FACE_AUTH_ENABLED = process.env.FACE_AUTH_ENABLED !== 'false';
const FACE_AUTH_THRESHOLD = parseFloat(process.env.FACE_AUTH_THRESHOLD) || 0.50;

/**
 * Check if face authentication is enabled globally
 */
function isFaceAuthEnabled() {
    return FACE_AUTH_ENABLED;
}

/**
 * Check health of Python face service
 */
async function checkFaceServiceHealth() {
    try {
        const response = await axios.get(`${FACE_SERVICE_URL}/health`, { timeout: 5000 });
        return {
            healthy: response.data.status === 'healthy',
            inspireface_available: response.data.inspireface_available
        };
    } catch (error) {
        logger.error('Face service health check failed:', error.message);
        return { healthy: false, error: error.message };
    }
}

/**
 * Register face for a user
 * 
 * @param {string} userId - MongoDB user ID
 * @param {string[]} images - Array of 5 base64 encoded face images
 * @returns {Object} - Registration result
 */
async function registerFace(userId, images) {
    if (!isFaceAuthEnabled()) {
        return { success: false, error: { code: 'FACE_AUTH_DISABLED', message: 'Face authentication is disabled' } };
    }

    if (!images || images.length !== 5) {
        return { success: false, error: { code: 'INVALID_INPUT', message: 'Exactly 5 face images are required' } };
    }

    try {
        // Find user
        const user = await User.findById(userId).select('+faceAuth.faceEmbedding');
        if (!user) {
            return { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } };
        }

        // Call Python face service
        const response = await axios.post(`${FACE_SERVICE_URL}/register-face`, {
            images
        }, {
            timeout: 60000,  // 60 seconds for processing multiple images
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.data.success) {
            return { success: false, error: { code: 'REGISTRATION_FAILED', message: response.data.message } };
        }

        // Encrypt and store embedding
        const embeddingJson = JSON.stringify(response.data.embedding);
        user.setFaceEmbedding(embeddingJson);

        // Update face auth fields
        user.faceAuth.enabled = true;
        user.faceAuth.embeddingDimension = response.data.dimension;
        user.faceAuth.numSamplesUsed = response.data.num_samples;
        user.faceAuth.averageQuality = response.data.average_quality;
        user.faceAuth.lastFaceUpdate = new Date();
        user.faceAuth.faceAuthAttempts = 0;
        user.faceAuth.faceAuthLockUntil = null;

        await user.save();

        logger.info(`Face registered for user: ${user.email}`);

        return {
            success: true,
            message: 'Face registration successful',
            data: {
                enabled: true,
                dimension: response.data.dimension,
                quality: response.data.average_quality
            }
        };

    } catch (error) {
        logger.error('Face registration error:', error.message);

        // Handle axios errors from Python service
        if (error.response) {
            return {
                success: false,
                error: {
                    code: 'REGISTRATION_FAILED',
                    message: error.response.data?.detail || 'Face registration failed'
                }
            };
        }

        // Handle connection errors
        if (error.code === 'ECONNREFUSED') {
            return {
                success: false,
                error: {
                    code: 'SERVICE_UNAVAILABLE',
                    message: 'Face authentication service is unavailable'
                }
            };
        }

        return {
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Face registration failed' }
        };
    }
}

/**
 * Verify face for a user
 * 
 * @param {string} userId - MongoDB user ID
 * @param {string} image - Base64 encoded face image
 * @returns {Object} - Verification result
 */
async function verifyFace(userId, image) {
    if (!isFaceAuthEnabled()) {
        return { success: false, error: { code: 'FACE_AUTH_DISABLED', message: 'Face authentication is disabled' } };
    }

    if (!image) {
        return { success: false, error: { code: 'INVALID_INPUT', message: 'Face image is required' } };
    }

    try {
        // Find user with face data
        const user = await User.findById(userId).select('+faceAuth.faceEmbedding');
        if (!user) {
            return { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } };
        }

        // Check if face auth is enabled for user
        if (!user.faceAuth?.enabled) {
            return { success: false, error: { code: 'FACE_AUTH_NOT_ENABLED', message: 'Face authentication not enabled for this user' } };
        }

        // Check if face auth is locked
        if (user.isFaceAuthLocked) {
            const lockRemaining = Math.ceil((user.faceAuth.faceAuthLockUntil - Date.now()) / 60000);
            return {
                success: false,
                error: {
                    code: 'FACE_AUTH_LOCKED',
                    message: `Face authentication locked. Try again in ${lockRemaining} minutes.`
                }
            };
        }

        // Get and decrypt stored embedding
        const embeddingJson = user.getFaceEmbedding();
        if (!embeddingJson) {
            return { success: false, error: { code: 'NO_FACE_DATA', message: 'No face data found for user' } };
        }

        const storedEmbedding = JSON.parse(embeddingJson);

        // Call Python face service
        const response = await axios.post(`${FACE_SERVICE_URL}/verify-face`, {
            image,
            stored_embedding: storedEmbedding
        }, {
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.data.success) {
            await user.incFaceAuthAttempts();
            return { success: false, error: { code: 'VERIFICATION_FAILED', message: response.data.message } };
        }

        if (!response.data.verified) {
            // Increment failed attempts
            await user.incFaceAuthAttempts();

            // Reload user to get updated attempts
            const updatedUser = await User.findById(userId);
            const maxAttempts = parseInt(process.env.FACE_MAX_ATTEMPTS) || 5;
            const attemptsRemaining = maxAttempts - (updatedUser.faceAuth?.faceAuthAttempts || 0);

            logger.warn(`Face verification failed for user: ${user.email}, similarity: ${response.data.similarity}`);

            return {
                success: false,
                error: {
                    code: 'FACE_MISMATCH',
                    message: attemptsRemaining > 0
                        ? `Face verification failed. ${attemptsRemaining} attempts remaining.`
                        : 'Face authentication locked due to too many failed attempts.'
                }
            };
        }

        // Reset attempts on successful verification
        await user.resetFaceAuthAttempts();

        logger.info(`Face verified for user: ${user.email}, similarity: ${response.data.similarity}`);

        return {
            success: true,
            message: 'Face verified successfully',
            data: {
                verified: true,
                similarity: response.data.similarity
            }
        };

    } catch (error) {
        logger.error('Face verification error:', error.message);

        if (error.response) {
            return {
                success: false,
                error: {
                    code: 'VERIFICATION_FAILED',
                    message: error.response.data?.detail || 'Face verification failed'
                }
            };
        }

        if (error.code === 'ECONNREFUSED') {
            return {
                success: false,
                error: {
                    code: 'SERVICE_UNAVAILABLE',
                    message: 'Face authentication service is unavailable'
                }
            };
        }

        return {
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Face verification failed' }
        };
    }
}

/**
 * Disable face authentication for a user
 * 
 * @param {string} userId - MongoDB user ID
 * @returns {Object} - Result
 */
async function disableFaceAuth(userId) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } };
        }

        // Clear face auth data
        user.faceAuth = {
            enabled: false,
            faceEmbedding: null,
            embeddingDimension: null,
            numSamplesUsed: 0,
            averageQuality: null,
            lastFaceUpdate: null,
            faceAuthAttempts: 0,
            faceAuthLockUntil: null
        };

        await user.save();

        logger.info(`Face auth disabled for user: ${user.email}`);

        return { success: true, message: 'Face authentication disabled' };

    } catch (error) {
        logger.error('Disable face auth error:', error.message);
        return { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to disable face authentication' } };
    }
}

/**
 * Get face auth status for a user
 * 
 * @param {string} userId - MongoDB user ID
 * @returns {Object} - Status
 */
async function getFaceAuthStatus(userId) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } };
        }

        return {
            success: true,
            data: {
                enabled: user.faceAuth?.enabled || false,
                quality: user.faceAuth?.averageQuality || null,
                lastUpdated: user.faceAuth?.lastFaceUpdate || null,
                isLocked: user.isFaceAuthLocked || false
            }
        };

    } catch (error) {
        logger.error('Get face auth status error:', error.message);
        return { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get face auth status' } };
    }
}

module.exports = {
    isFaceAuthEnabled,
    checkFaceServiceHealth,
    registerFace,
    verifyFace,
    disableFaceAuth,
    getFaceAuthStatus
};
