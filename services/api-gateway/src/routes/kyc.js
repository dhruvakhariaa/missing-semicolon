/**
 * KYC Routes - Aadhaar & PAN Verification Endpoints
 * 
 * All routes require authentication via JWT.
 * Rate limited to prevent abuse of government APIs.
 */

const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const { authenticate } = require('../middleware/auth');
const { strictInputValidation } = require('../middleware/inputSanitizer');

// Apply authentication to all KYC routes
router.use(authenticate);

// Apply input sanitization to protect against injection attacks
router.use(strictInputValidation);

/**
 * POST /api/kyc/initiate
 * Start Aadhaar OTP verification process
 * Body: { aadhaarNumber: "123456789012" }
 */
router.post('/initiate', kycController.initiateKyc);

/**
 * POST /api/kyc/verify
 * Complete KYC with OTP and PAN verification
 * Body: { aadhaarNumber, panNumber, otp, requestId }
 */
router.post('/verify', kycController.verifyKyc);

/**
 * GET /api/kyc/status
 * Get current KYC verification status
 */
router.get('/status', kycController.getKycStatus);

module.exports = router;
