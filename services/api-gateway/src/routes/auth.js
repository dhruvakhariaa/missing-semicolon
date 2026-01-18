/**
 * Auth Routes - Registration, Login, and User Management
 * Supports 4 roles: citizen, sector_manager, government_official, system_admin
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * POST /api/auth/register
 * Register a new user (default role: citizen)
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName, phone } = req.body;

        // Validate required fields
        if (!email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and fullName are required'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user (default role: citizen)
        const user = new User({
            email: email.toLowerCase(),
            passwordHash,
            fullName,
            phone,
            role: 'citizen'
        });

        await user.save();
        logger.info(`New user registered: ${email}`);

        // Generate token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
                assignedSector: user.assignedSector
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role
                }
            }
        });
    } catch (error) {
        logger.error('Registration failed:', error);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Account is deactivated'
            });
        }

        // Generate token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
                assignedSector: user.assignedSector
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        logger.info(`User logged in: ${email} (${user.role})`);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    assignedSector: user.assignedSector
                }
            }
        });
    } catch (error) {
        logger.error('Login failed:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

/**
 * GET /api/auth/me
 * Get current user info (requires auth)
 */
router.get('/me', async (req, res) => {
    try {
        // Extract token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        logger.error('Get current user failed:', error);
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

/**
 * POST /api/auth/create-admin
 * Create admin users (for demo/setup purposes)
 * In production, this should be protected or removed
 */
router.post('/create-admin', async (req, res) => {
    try {
        const { email, password, fullName, role, assignedSector } = req.body;

        // Validate role
        const validRoles = ['sector_manager', 'government_official', 'system_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be: sector_manager, government_official, or system_admin'
            });
        }

        // For sector_manager, assignedSector is required
        if (role === 'sector_manager' && !assignedSector) {
            return res.status(400).json({
                success: false,
                error: 'assignedSector is required for sector_manager role'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            email: email.toLowerCase(),
            passwordHash,
            fullName,
            role,
            assignedSector: role === 'sector_manager' ? assignedSector : null
        });

        await user.save();
        logger.info(`Admin user created: ${email} (${role})`);

        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                assignedSector: user.assignedSector
            }
        });
    } catch (error) {
        logger.error('Create admin failed:', error);
        res.status(500).json({ success: false, error: 'Failed to create admin user' });
    }
});

module.exports = router;
