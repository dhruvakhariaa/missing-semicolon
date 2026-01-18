/**
 * Security Routes - Handles security alert endpoints
 */

const express = require('express');
const router = express.Router();
const { sendAttackAlert } = require('../services/emailService');
const logger = require('../utils/logger');

// Admin email for security alerts
const ADMIN_EMAIL = process.env.SMTP_USER || 'admin@example.com';

/**
 * POST /api/security/alert
 * Send attack alert email for critical attacks
 * Sends to both admin (with user context) and the user (just attack info)
 */
router.post('/alert', async (req, res) => {
    try {
        const { attackType, payloadBase64, timestamp, userEmail } = req.body;

        if (!attackType) {
            return res.status(400).json({
                success: false,
                error: { message: 'Attack type is required' }
            });
        }

        // Only send alerts for critical attacks
        const criticalAttacks = ['sqli', 'nosql', 'command', 'xxe'];
        if (!criticalAttacks.includes(attackType)) {
            return res.json({
                success: true,
                message: 'Non-critical attack logged but no email sent',
                emailSent: false
            });
        }

        // Decode payload from base64 if provided
        let payload = 'Attack payload blocked';
        if (payloadBase64) {
            try {
                payload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
            } catch (e) {
                payload = 'Encoded attack payload';
            }
        }

        const baseAttackDetails = {
            attackType,
            payload,
            sourceIP: req.ip || req.connection.remoteAddress,
            timestamp: timestamp || new Date().toISOString()
        };

        // Send alert to admin with user context
        const adminDetails = {
            ...baseAttackDetails,
            targetUserEmail: userEmail || 'Unknown (during registration)',
            isAdminAlert: true
        };
        const adminResult = await sendAttackAlert(ADMIN_EMAIL, adminDetails);

        // Send alert to user (if email is provided and valid)
        let userResult = { success: false };
        if (userEmail && userEmail.includes('@') && userEmail !== ADMIN_EMAIL) {
            const userDetails = {
                ...baseAttackDetails,
                isAdminAlert: false
            };
            userResult = await sendAttackAlert(userEmail, userDetails);
        }

        res.json({
            success: adminResult.success || userResult.success,
            message: 'Alert sent',
            adminAlertSent: adminResult.success,
            userAlertSent: userResult.success
        });
    } catch (error) {
        logger.error('Security alert error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to send alert' }
        });
    }
});

/**
 * GET /api/security/status
 * Get current security status
 */
router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: {
            securityLevel: 'MAXIMUM',
            protections: [
                'XSS Protection',
                'SQL Injection Protection',
                'NoSQL Injection Protection',
                'Command Injection Protection',
                'Path Traversal Protection',
                'Prototype Pollution Protection',
                'XXE Protection',
                'CSRF Protection',
                'Rate Limiting',
                'Input Sanitization'
            ],
            status: 'Active'
        }
    });
});

module.exports = router;
