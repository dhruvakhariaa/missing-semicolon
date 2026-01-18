/**
 * Auth Routes - Registration, Login, Logout, Token Refresh
 * With enhanced security: Input sanitization, type validation, injection protection
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
    validateAuthInput,
    blockNoSqlInjection,
    sanitizeInputs
} = require('../middleware/inputSanitizer');

// Apply sanitization to all routes
router.use(sanitizeInputs());

// Apply NoSQL injection protection to all routes
router.use(blockNoSqlInjection);

// Input validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input data',
                details: errors.array()
            }
        });
    }
    next();
};

// Custom sanitizer to strip dangerous characters from name
const sanitizeName = (value) => {
    if (typeof value !== 'string') return '';
    // Remove HTML tags, script contents, and dangerous characters
    return value
        .replace(/<[^>]*>/g, '')  // Remove HTML tags
        .replace(/[<>"'`;&|$(){}[\]]/g, '')  // Remove dangerous chars
        .trim();
};

// Validation rules with enhanced security
const registerValidation = [
    body('email')
        .isEmail().withMessage('Valid email required')
        .normalizeEmail()
        .isLength({ max: 255 }).withMessage('Email too long'),
    body('password')
        .isString().withMessage('Password must be a string')
        .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters'),
    body('name')
        .isString().withMessage('Name must be a string')
        .trim()
        .customSanitizer(sanitizeName)
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
        .matches(/^[a-zA-Z\s\-'\.]+$/).withMessage('Name can only contain letters, spaces, hyphens, apostrophes'),
    body('phone')
        .optional()
        .matches(/^[6-9]\d{9}$/).withMessage('Valid Indian mobile number required'),
    body('panNumber')
        .optional()
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/).withMessage('Valid PAN format required')
];

const loginValidation = [
    body('email')
        .isEmail().withMessage('Valid email required')
        .normalizeEmail()
        .isLength({ max: 255 }).withMessage('Email too long'),
    body('password')
        .isString().withMessage('Password must be a string')
        .notEmpty().withMessage('Password required')
        .isLength({ max: 128 }).withMessage('Password too long')
];

const refreshValidation = [
    body('refreshToken')
        .optional()
        .isString().withMessage('Refresh token must be a string')
        .isLength({ max: 1000 }).withMessage('Token too long')
];

// Routes with layered security
// POST /api/auth/register - Register new user
router.post('/register',
    validateAuthInput,  // Type validation
    registerValidation,
    handleValidationErrors,
    authController.register
);

// POST /api/auth/login - Step 1: Validate credentials and send OTP
router.post('/login',
    validateAuthInput,  // Type validation
    loginValidation,
    handleValidationErrors,
    authController.login
);

// POST /api/auth/verify-login-otp - Step 2: Verify OTP and get tokens
const otpValidation = [
    body('email')
        .isEmail().withMessage('Valid email required')
        .normalizeEmail()
        .isLength({ max: 255 }).withMessage('Email too long'),
    body('otp')
        .isString().withMessage('OTP must be a string')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
        .matches(/^[0-9]+$/).withMessage('OTP must contain only numbers')
];

router.post('/verify-login-otp',
    validateAuthInput,
    otpValidation,
    handleValidationErrors,
    authController.verifyLoginOtp
);

// POST /api/auth/resend-otp - Resend OTP to email
const resendOtpValidation = [
    body('email')
        .isEmail().withMessage('Valid email required')
        .normalizeEmail()
        .isLength({ max: 255 }).withMessage('Email too long')
];

router.post('/resend-otp',
    validateAuthInput,
    resendOtpValidation,
    handleValidationErrors,
    authController.resendOtp
);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh',
    refreshValidation,
    handleValidationErrors,
    authController.refreshToken
);

// POST /api/auth/logout - Logout user
router.post('/logout',
    authenticate,
    authController.logout
);

// GET /api/auth/me - Get current user
router.get('/me',
    authenticate,
    authController.getMe
);

// GET /api/auth/users/:id - Get specific user (IDOR Protection)
router.get('/users/:id',
    authenticate,
    authController.getUserProfile
);

// POST /api/auth/complete-face-auth - Step 3: Complete login after face verification (3FA)
const completeFaceAuthValidation = [
    body('faceVerifyToken')
        .isString().withMessage('Face verify token required')
        .isLength({ max: 2000 }).withMessage('Token too long'),
    body('userId')
        .isString().withMessage('User ID required')
        .isLength({ min: 24, max: 24 }).withMessage('Invalid user ID format')
];

router.post('/complete-face-auth',
    validateAuthInput,
    completeFaceAuthValidation,
    handleValidationErrors,
    authController.completeFaceAuth
);

module.exports = router;
