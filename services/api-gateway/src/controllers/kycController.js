/**
 * KYC Controller - Handles Aadhaar & PAN verification requests
 * 
 * Endpoints:
 * POST /api/kyc/initiate - Start Aadhaar OTP verification
 * POST /api/kyc/verify - Complete verification with OTP + PAN
 * GET /api/kyc/status - Get current KYC status
 */

const User = require('../models/User');
const kycService = require('../services/kycService');
const logger = require('../utils/logger');

/**
 * POST /api/kyc/initiate
 * Initiate Aadhaar OTP verification
 */
exports.initiateKyc = async (req, res) => {
    try {
        const { aadhaarNumber } = req.body;
        const userId = req.user.userId;

        // Validate Aadhaar format
        if (!kycService.validateAadhaarFormat(aadhaarNumber)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_AADHAAR',
                    message: 'Invalid Aadhaar format. Must be 12 digits.'
                }
            });
        }

        // Initiate OTP
        const result = await kycService.initiateAadhaarOtp(aadhaarNumber);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'OTP_INITIATION_FAILED',
                    message: result.message || 'Failed to send OTP'
                }
            });
        }

        // Store request_id temporarily (in production, use Redis with TTL)
        // For now, we'll send it back to the client
        logger.info(`Aadhaar OTP initiated for user ${userId}`);

        res.json({
            success: true,
            message: result.message,
            data: {
                request_id: result.request_id,
                masked_mobile: result.masked_mobile
            }
        });

    } catch (error) {
        logger.error('KYC initiation error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'KYC_ERROR', message: 'KYC initiation failed' }
        });
    }
};

/**
 * POST /api/kyc/verify
 * Complete KYC verification with OTP and PAN
 */
exports.verifyKyc = async (req, res) => {
    try {
        const { aadhaarNumber, panNumber, otp, requestId } = req.body;
        const userId = req.user.userId;

        // Validate inputs
        if (!aadhaarNumber || !panNumber || !otp || !requestId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'Aadhaar, PAN, OTP, and request ID are required'
                }
            });
        }

        if (!kycService.validateAadhaarFormat(aadhaarNumber)) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_AADHAAR', message: 'Invalid Aadhaar format' }
            });
        }

        if (!kycService.validatePanFormat(panNumber)) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_PAN', message: 'Invalid PAN format. Must be like ABCDE1234F' }
            });
        }

        // Find user with encrypted fields selected (they have select: false by default)
        const user = await User.findById(userId).select('+panNumber +aadhaarNumber');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User not found' }
            });
        }

        logger.info(`Found user for KYC: ${user.email}, current kycLevel: ${user.kycLevel}`);

        // Perform complete KYC verification
        const result = await kycService.performKycVerification(
            user,
            aadhaarNumber,
            panNumber,
            otp,
            requestId
        );

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'KYC_VERIFICATION_FAILED',
                    message: result.error || 'KYC verification failed'
                }
            });
        }

        logger.info(`KYC verified for user ${userId}: Level ${result.kycLevel}`);

        res.json({
            success: true,
            message: 'KYC verification successful! Your identity has been verified.',
            data: {
                kycLevel: result.kycLevel,
                aadhaarVerified: true,
                panVerified: true,
                nameMatch: {
                    similarity: result.nameMatch.similarity,
                    matched: result.nameMatch.match
                }
            }
        });

    } catch (error) {
        logger.error('KYC verification error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'KYC_ERROR', message: 'KYC verification failed' }
        });
    }
};

/**
 * GET /api/kyc/status
 * Get current KYC verification status
 */
exports.getKycStatus = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User not found' }
            });
        }

        const kycLevelNames = ['Email Only', 'PAN Verified', 'Fully Verified (Aadhaar + PAN)'];

        res.json({
            success: true,
            data: {
                kycLevel: user.kycLevel,
                kycLevelName: kycLevelNames[user.kycLevel] || 'Unknown',
                aadhaarVerified: user.aadhaarVerified || false,
                panVerified: user.panVerified || false,
                emailVerified: user.emailVerified || false
            }
        });

    } catch (error) {
        logger.error('KYC status error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'KYC_ERROR', message: 'Failed to get KYC status' }
        });
    }
};
