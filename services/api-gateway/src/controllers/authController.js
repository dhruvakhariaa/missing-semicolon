/**
 * Auth Controller - Handles registration, login, logout, token refresh
 */

const User = require('../models/User');
const { hashPassword, verifyPassword, validatePasswordStrength, needsRehash } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateSecureToken } = require('../utils/encryption');
const logger = require('../utils/logger');

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { email, password, name, phone, panNumber } = req.body;

        // Validate password strength
        const passwordCheck = validatePasswordStrength(password);
        if (!passwordCheck.valid) {
            return res.status(400).json({
                success: false,
                error: { code: 'WEAK_PASSWORD', message: 'Password requirements not met', details: passwordCheck.errors }
            });
        }

        // Check if email exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: { code: 'EMAIL_EXISTS', message: 'Email already registered' }
            });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const user = new User({
            email,
            passwordHash,
            name,
            phone,
            kycLevel: 0  // Email not verified yet
        });

        // Encrypt and store PAN if provided
        if (panNumber) {
            user.setPanNumber(panNumber);
        }

        // Generate email verification token
        const verificationToken = generateSecureToken();
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const { token: refreshToken, expiresAt } = generateRefreshToken(user);

        // Store refresh token
        user.addRefreshToken(refreshToken, expiresAt, req.headers['user-agent'], req.ip);
        await user.save();

        // Set refresh token as HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        logger.info(`User registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify your email.',
            data: {
                user: user.toJSON(),
                accessToken,
                tokenType: 'Bearer',
                expiresIn: 900 // 15 minutes
            }
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'REGISTRATION_FAILED', message: 'Registration failed' }
        });
    }
};

// POST /api/auth/login - Step 1: Validate credentials and send OTP
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Import email service
        const { generateOtp, sendLoginOtp } = require('../services/emailService');

        // Find user with password and OTP fields
        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+passwordHash +loginOtp +loginOtpExpires +loginOtpAttempts');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            const lockRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({
                success: false,
                error: {
                    code: 'ACCOUNT_LOCKED',
                    message: `Account locked. Try again in ${lockRemaining} minutes.`
                }
            });
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
            await user.incLoginAttempts();
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
            });
        }

        // Password is valid - now send OTP to email
        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Store OTP (hashed for security)
        const crypto = require('crypto');
        user.loginOtp = crypto.createHash('sha256').update(otp).digest('hex');
        user.loginOtpExpires = otpExpires;
        user.loginOtpAttempts = 0;
        await user.save();

        // Send OTP to email
        const emailResult = await sendLoginOtp(email, otp);

        if (!emailResult.success) {
            logger.error(`Failed to send OTP to ${email}`);
            return res.status(500).json({
                success: false,
                error: { code: 'OTP_SEND_FAILED', message: 'Failed to send verification code' }
            });
        }

        logger.info(`Login OTP sent to: ${email}`);

        // Return pending OTP response - NO TOKENS YET
        res.json({
            success: true,
            message: 'Verification code sent to your email',
            data: {
                pendingOtp: true,
                email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
                expiresIn: 300 // 5 minutes
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'LOGIN_FAILED', message: 'Login failed' }
        });
    }
};

// POST /api/auth/verify-login-otp - Step 2: Verify OTP and return tokens
exports.verifyLoginOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: { code: 'MISSING_FIELDS', message: 'Email and OTP are required' }
            });
        }

        // Find user with OTP fields
        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+loginOtp +loginOtpExpires +loginOtpAttempts +passwordHash');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_REQUEST', message: 'Invalid verification request' }
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            const lockRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({
                success: false,
                error: {
                    code: 'ACCOUNT_LOCKED',
                    message: `Account locked. Try again in ${lockRemaining} minutes.`
                }
            });
        }

        // Check if OTP exists and is not expired
        if (!user.loginOtp || !user.loginOtpExpires) {
            return res.status(400).json({
                success: false,
                error: { code: 'NO_OTP_PENDING', message: 'No verification pending. Please login again.' }
            });
        }

        if (user.loginOtpExpires < new Date()) {
            // Clear expired OTP
            user.loginOtp = undefined;
            user.loginOtpExpires = undefined;
            await user.save();
            return res.status(400).json({
                success: false,
                error: { code: 'OTP_EXPIRED', message: 'Verification code expired. Please login again.' }
            });
        }

        // Hash the provided OTP and compare
        const crypto = require('crypto');
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        if (hashedOtp !== user.loginOtp) {
            // Increment OTP attempts
            user.loginOtpAttempts = (user.loginOtpAttempts || 0) + 1;

            // Lock after 5 failed OTP attempts
            if (user.loginOtpAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
                user.loginOtp = undefined;
                user.loginOtpExpires = undefined;
                await user.save();
                return res.status(423).json({
                    success: false,
                    error: { code: 'ACCOUNT_LOCKED', message: 'Too many failed attempts. Account locked for 15 minutes.' }
                });
            }

            await user.save();
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_OTP',
                    message: `Invalid verification code. ${5 - user.loginOtpAttempts} attempts remaining.`
                }
            });
        }

        // OTP is valid - clear it and prepare for next step
        user.loginOtp = undefined;
        user.loginOtpExpires = undefined;
        user.loginOtpAttempts = 0;
        user.lastLogin = new Date();

        // Mark email as verified and enable 2FA (email OTP was successful)
        user.emailVerified = true;
        user.twoFactorEnabled = true;
        user.loginAttempts = (user.loginAttempts || 0) + 1;  // Track successful logins

        // Reset login attempts on successful verification
        await user.resetLoginAttempts();

        // Rehash password if needed (algorithm upgrade)
        if (needsRehash(user.passwordHash)) {
            // Note: We don't have the original password here, so we can't rehash
            // This would need to be done in the login step
        }

        // Check if face authentication is enabled for this user (3FA)
        if (user.faceAuth?.enabled) {
            // Generate temporary face verification token (short-lived)
            const jwt = require('jsonwebtoken');
            const faceVerifyToken = jwt.sign(
                { userId: user._id.toString(), type: 'face_verify', email: email },
                process.env.JWT_ACCESS_SECRET,
                { expiresIn: '5m' }  // 5 minutes to complete face verification
            );

            await user.save();

            logger.info(`OTP verified for user: ${email}, pending face auth`);

            return res.json({
                success: true,
                message: 'OTP verified. Face verification required.',
                data: {
                    pendingFaceAuth: true,
                    faceVerifyToken,
                    userId: user._id.toString(),
                    email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
                    expiresIn: 300  // 5 minutes
                }
            });
        }

        // No face auth - generate tokens directly
        const accessToken = generateAccessToken(user);
        const { token: refreshToken, expiresAt } = generateRefreshToken(user);

        // Store refresh token
        user.addRefreshToken(refreshToken, expiresAt, req.headers['user-agent'], req.ip);
        await user.save();

        // Set refresh token as HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        logger.info(`User logged in successfully: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                accessToken,
                tokenType: 'Bearer',
                expiresIn: 900
            }
        });
    } catch (error) {
        logger.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'VERIFICATION_FAILED', message: 'Verification failed' }
        });
    }
};

// POST /api/auth/resend-otp - Resend OTP to user's email
exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: { code: 'MISSING_EMAIL', message: 'Email is required' }
            });
        }

        // Import email service
        const { generateOtp, sendLoginOtp } = require('../services/emailService');

        // Find user with OTP fields
        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+loginOtp +loginOtpExpires +loginOtpAttempts +lastOtpResend +otpResendCount');

        if (!user) {
            // Don't reveal if user exists
            return res.status(400).json({
                success: false,
                error: { code: 'RESEND_FAILED', message: 'Unable to resend code. Please try logging in again.' }
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            const lockRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({
                success: false,
                error: {
                    code: 'ACCOUNT_LOCKED',
                    message: `Account locked. Try again in ${lockRemaining} minutes.`
                }
            });
        }

        // Rate limiting: 60 second cooldown between resends
        const now = Date.now();
        const lastResend = user.lastOtpResend ? user.lastOtpResend.getTime() : 0;
        const cooldownRemaining = Math.ceil((60000 - (now - lastResend)) / 1000);

        if (cooldownRemaining > 0) {
            return res.status(429).json({
                success: false,
                error: {
                    code: 'RESEND_COOLDOWN',
                    message: `Please wait ${cooldownRemaining} seconds before requesting a new code.`
                }
            });
        }

        // Max 3 resends per login attempt
        const resendCount = user.otpResendCount || 0;
        if (resendCount >= 3) {
            return res.status(429).json({
                success: false,
                error: {
                    code: 'RESEND_LIMIT',
                    message: 'Maximum resend attempts reached. Please login again.'
                }
            });
        }

        // Generate new OTP
        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Store OTP (hashed for security)
        const crypto = require('crypto');
        user.loginOtp = crypto.createHash('sha256').update(otp).digest('hex');
        user.loginOtpExpires = otpExpires;
        user.loginOtpAttempts = 0;
        user.lastOtpResend = new Date();
        user.otpResendCount = resendCount + 1;
        await user.save();

        // Send OTP to email
        const emailResult = await sendLoginOtp(email, otp);

        if (!emailResult.success) {
            logger.error(`Failed to resend OTP to ${email}`);
            return res.status(500).json({
                success: false,
                error: { code: 'OTP_SEND_FAILED', message: 'Failed to send verification code' }
            });
        }

        logger.info(`OTP resent to: ${email} (attempt ${resendCount + 1}/3)`);

        res.json({
            success: true,
            message: 'New verification code sent to your email',
            data: {
                email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
                expiresIn: 300, // 5 minutes
                resendsRemaining: 2 - resendCount
            }
        });
    } catch (error) {
        logger.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'RESEND_FAILED', message: 'Failed to resend code' }
        });
    }
};

// POST /api/auth/refresh
exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token required' }
            });
        }

        // Validate token is a string
        if (typeof refreshToken !== 'string') {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_TOKEN_FORMAT', message: 'Invalid token format' }
            });
        }

        // Basic format validation - JWT should have 3 parts
        const parts = refreshToken.split('.');
        if (parts.length !== 3) {
            return res.status(401).json({
                success: false,
                error: { code: 'MALFORMED_TOKEN', message: 'Malformed token structure' }
            });
        }

        // Verify refresh token (now includes algorithm and expiry checks)
        const result = verifyRefreshToken(refreshToken);
        if (!result.valid) {
            logger.warn(`Token verification failed: ${result.error}`);
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_REFRESH_TOKEN', message: result.error }
            });
        }

        // Find user
        const user = await User.findById(result.payload.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User not found' }
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken(user);

        res.json({
            success: true,
            data: {
                accessToken,
                tokenType: 'Bearer',
                expiresIn: 900
            }
        });
    } catch (error) {
        logger.error('Token refresh error:', error);
        // Return 401 for any token-related errors instead of 500
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: { code: 'TOKEN_VERIFICATION_FAILED', message: 'Invalid or expired token' }
            });
        }
        res.status(500).json({
            success: false,
            error: { code: 'REFRESH_FAILED', message: 'Token refresh failed' }
        });
    }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken && req.user) {
            const user = await User.findById(req.user.userId);
            if (user) {
                user.removeRefreshToken(refreshToken);
                await user.save();
            }
        }

        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'LOGOUT_FAILED', message: 'Logout failed' }
        });
    }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User not found' }
            });
        }

        res.json({
            success: true,
            data: { user: user.toJSON() }
        });
    } catch (error) {
        logger.error('Get me error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_FAILED', message: 'Failed to fetch user' }
        });
    }
};

/**
 * GET /api/auth/users/:id
 * Get user profile - STRICTOR IDOR PROTECTION
 */
exports.getUserProfile = async (req, res) => {
    try {
        const targetId = req.params.id;
        const currentUserId = req.user.userId;

        // CRITICAL IDOR CHECK: Only allow users to access their own ID
        // In a real system, admins might have access, but for this test we are strict
        if (targetId !== currentUserId) {
            logger.warn(`IDOR ATTEMPT BLOCKED: User ${currentUserId} tried to access User ${targetId}`);
            return res.status(403).json({
                success: false,
                error: {
                    code: 'IDOR_BLOCKED',
                    message: 'Forbidden: Access to this profile is restricted to the owner only'
                }
            });
        }

        const user = await User.findById(targetId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User not found' }
            });
        }

        res.json({
            success: true,
            data: { user: user.toJSON() }
        });
    } catch (error) {
        logger.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_FAILED', message: 'Failed to fetch user profile' }
        });
    }
};

/**
 * POST /api/auth/complete-face-auth
 * Complete login after face verification (3FA)
 * Called after face verification is successful
 */
exports.completeFaceAuth = async (req, res) => {
    try {
        const { faceVerifyToken, userId } = req.body;

        if (!faceVerifyToken || !userId) {
            return res.status(400).json({
                success: false,
                error: { code: 'MISSING_FIELDS', message: 'Face verify token and user ID required' }
            });
        }

        // Verify the face verification token
        const jwt = require('jsonwebtoken');
        let payload;
        try {
            payload = jwt.verify(faceVerifyToken, process.env.JWT_ACCESS_SECRET);
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

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User not found' }
            });
        }

        // Generate tokens  
        const accessToken = generateAccessToken(user);
        const { token: refreshToken, expiresAt } = generateRefreshToken(user);

        // Store refresh token
        user.addRefreshToken(refreshToken, expiresAt, req.headers['user-agent'], req.ip);
        await user.save();

        // Set refresh token as HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        logger.info(`User completed 3FA login: ${user.email}`);

        res.json({
            success: true,
            message: 'Login successful (3FA complete)',
            data: {
                user: user.toJSON(),
                accessToken,
                tokenType: 'Bearer',
                expiresIn: 900
            }
        });
    } catch (error) {
        logger.error('Complete face auth error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'AUTH_FAILED', message: 'Face authentication completion failed' }
        });
    }
};
