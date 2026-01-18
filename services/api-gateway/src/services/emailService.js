/**
 * Email Service - Sends OTP codes via email
 * 
 * Uses nodemailer with configurable SMTP settings.
 * In test mode, logs OTP to console instead of sending.
 * 
 * Security Features:
 * - OTP has 5-minute expiry
 * - 6-digit cryptographically secure random code
 * - Rate limiting handled at controller level
 */

const nodemailer = require('nodemailer');
const crypto = require('crypto');
const logger = require('../utils/logger');

// SMTP Configuration from environment
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@sdp.gov.in';
const EMAIL_TEST_MODE = process.env.EMAIL_TEST_MODE === 'true' || !SMTP_USER;

// Create transporter (only if not in test mode)
let transporter = null;
if (!EMAIL_TEST_MODE && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });
}

/**
 * Generate a cryptographically secure 6-digit OTP
 */
function generateOtp() {
    const buffer = crypto.randomBytes(4);
    const num = buffer.readUInt32BE(0);
    const otp = (num % 900000 + 100000).toString(); // 100000-999999
    return otp;
}

/**
 * Send Login OTP to user's email
 * @param {string} email - User's email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function sendLoginOtp(email, otp) {
    const subject = '🔐 Your Login Verification Code - Government KYC Portal';
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }
        .header { text-align: center; margin-bottom: 24px; }
        .emblem { font-size: 48px; margin-bottom: 8px; }
        h1 { color: #f8fafc; margin: 0; font-size: 24px; }
        .subtitle { color: #94a3b8; font-size: 14px; }
        .otp-box { background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: white; }
        .info { color: #94a3b8; font-size: 14px; margin-top: 20px; }
        .warning { color: #fbbf24; font-size: 12px; margin-top: 16px; padding: 12px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; }
        .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #64748b; }
        .security-badge { display: inline-block; padding: 4px 12px; background: #10b981; border-radius: 20px; font-size: 11px; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emblem">🇮🇳</div>
            <h1>Government KYC Portal</h1>
            <p class="subtitle">Secure Identity Verification System</p>
        </div>
        
        <p>Hello,</p>
        <p>Your login verification code is:</p>
        
        <div class="otp-box">
            <div class="otp-code">${otp}</div>
        </div>
        
        <p class="info">
            This code expires in <strong>5 minutes</strong>.<br>
            If you didn't request this code, please ignore this email.
        </p>
        
        <div class="warning">
            ⚠️ Never share this code with anyone. Government officials will never ask for your OTP.
        </div>
        
        <div class="footer">
            <span class="security-badge">🔒 AES-256-GCM Encrypted</span>
            <p>Service Delivery Platform - Government of India</p>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
Government KYC Portal - Login Verification

Your OTP is: ${otp}

This code expires in 5 minutes.
Never share this code with anyone.

If you didn't request this code, please ignore this email.
    `;

    // Test Mode: Log to console instead of sending
    if (EMAIL_TEST_MODE) {
        logger.info(`\n${'='.repeat(50)}`);
        logger.info(`📧 EMAIL TEST MODE - OTP for ${email}`);
        logger.info(`🔐 OTP CODE: ${otp}`);
        logger.info(`⏰ Expires in 5 minutes`);
        logger.info(`${'='.repeat(50)}\n`);
        return { success: true, message: 'OTP logged to console (test mode)' };
    }

    // Production Mode: Send via SMTP
    try {
        await transporter.sendMail({
            from: `"Government KYC Portal" <${SMTP_FROM}>`,
            to: email,
            subject,
            text,
            html
        });

        logger.info(`Login OTP sent to: ${email}`);
        return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
        logger.error(`Failed to send OTP email: ${error.message}`);
        return { success: false, message: 'Failed to send OTP email' };
    }
}

/**
 * Send Signup Welcome Email
 * @param {string} email - User's email address
 * @param {string} name - User's name
 */
async function sendWelcomeEmail(email, name) {
    const subject = '🎉 Welcome to Government KYC Portal';
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }
        .header { text-align: center; margin-bottom: 24px; }
        .emblem { font-size: 48px; margin-bottom: 8px; }
        h1 { color: #10b981; margin: 0; font-size: 28px; }
        .subtitle { color: #94a3b8; font-size: 14px; }
        .content { line-height: 1.8; }
        .steps { background: rgba(59, 130, 246, 0.1); border-radius: 8px; padding: 16px; margin: 20px 0; }
        .step { padding: 8px 0; border-bottom: 1px solid #334155; }
        .step:last-child { border-bottom: none; }
        .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emblem">🇮🇳</div>
            <h1>Welcome, ${name}!</h1>
            <p class="subtitle">Your account has been created successfully</p>
        </div>
        
        <div class="content">
            <p>Thank you for registering with the Government KYC Portal. Here's what you can do next:</p>
            
            <div class="steps">
                <div class="step">✅ <strong>Step 1:</strong> Login with your email and password</div>
                <div class="step">📧 <strong>Step 2:</strong> Verify your identity with email OTP</div>
                <div class="step">🆔 <strong>Step 3:</strong> Complete KYC with Aadhaar & PAN</div>
                <div class="step">🎉 <strong>Step 4:</strong> Access all government services!</div>
            </div>
            
            <p>Your data is secured with government-grade AES-256-GCM encryption.</p>
        </div>
        
        <div class="footer">
            <p>Service Delivery Platform - Government of India</p>
        </div>
    </div>
</body>
</html>
    `;

    if (EMAIL_TEST_MODE) {
        logger.info(`📧 Welcome email logged for: ${email}`);
        return { success: true };
    }

    try {
        await transporter.sendMail({
            from: `"Government KYC Portal" <${SMTP_FROM}>`,
            to: email,
            subject,
            text: `Welcome to Government KYC Portal, ${name}! Your account has been created successfully.`,
            html
        });
        logger.info(`Welcome email sent to: ${email}`);
        return { success: true };
    } catch (error) {
        logger.error(`Failed to send welcome email: ${error.message}`);
        return { success: false };
    }
}

/**
 * Send Attack Alert Email (for critical attacks only)
 * @param {string} email - Admin/User email to notify
 * @param {Object} attackDetails - Attack information
 * @returns {Promise<{success: boolean}>}
 */
async function sendAttackAlert(email, attackDetails) {
    const { attackType, payload, sourceIP, timestamp, targetUserEmail, isAdminAlert } = attackDetails;

    const attackLabels = {
        sqli: 'SQL Injection',
        nosql: 'NoSQL Injection',
        command: 'Command Injection',
        xxe: 'XML External Entity (XXE)',
        xss: 'Cross-Site Scripting (XSS)',
        path: 'Path Traversal',
        prototype: 'Prototype Pollution'
    };

    const label = attackLabels[attackType] || attackType.toUpperCase();
    const time = new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Different subject for admin vs user
    const subject = isAdminAlert
        ? `[ADMIN] ${label} Attack Blocked | Target: ${targetUserEmail || 'Unknown'}`
        : `SECURITY ALERT: ${label} Attack Blocked - Government KYC Portal`;
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; border: 2px solid #ef4444; }
        .header { text-align: center; margin-bottom: 24px; border-bottom: 1px solid #334155; padding-bottom: 20px; }
        .alert-icon { font-size: 48px; margin-bottom: 8px; }
        h1 { color: #ef4444; margin: 0; font-size: 24px; }
        .subtitle { color: #94a3b8; font-size: 14px; margin-top: 8px; }
        .attack-box { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .attack-type { display: inline-block; background: #ef4444; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; }
        .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #334155; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #94a3b8; width: 120px; flex-shrink: 0; }
        .detail-value { color: #f8fafc; font-weight: 500; word-break: break-all; }
        .payload-box { background: #0f172a; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 13px; word-break: break-all; margin-top: 16px; }
        .status-badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #64748b; padding-top: 20px; border-top: 1px solid #334155; }
        .info-text { color: #94a3b8; font-size: 13px; margin-top: 20px; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="alert-icon">⚠</div>
            <h1>Security Alert</h1>
            <p class="subtitle">Attack Detected and Blocked</p>
        </div>
        
        <div class="attack-box">
            <div style="margin-bottom: 16px;">
                <span class="attack-type">${label}</span>
                <span class="status-badge" style="margin-left: 10px;">BLOCKED</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value">${time}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Source IP</span>
                <span class="detail-value">${sourceIP || 'Unknown'}</span>
            </div>
            ${isAdminAlert && targetUserEmail ? `
            <div class="detail-row">
                <span class="detail-label">Target User</span>
                <span class="detail-value" style="color: #f59e0b;">${targetUserEmail}</span>
            </div>
            ` : ''}
            <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value" style="color: #10b981;">Blocked - No data compromised</span>
            </div>
            
            <div class="payload-box">
                <strong style="color: #ef4444;">Malicious Payload Detected:</strong><br><br>
                ${payload.substring(0, 200)}${payload.length > 200 ? '...' : ''}
            </div>
        </div>
        
        <p class="info-text">
            This attack was automatically blocked by the Government KYC Portal security system. 
            No action is required from your end. Your data remains secure and protected.
        </p>
        
        <div class="footer">
            <p>Government KYC Portal - Security Operations Center</p>
            <p>AES-256-GCM Encrypted | Government of India</p>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
SECURITY ALERT - Government KYC Portal

Attack Type: ${label}
Time: ${time}
Status: BLOCKED
Source IP: ${sourceIP || 'Unknown'}

Payload: ${payload.substring(0, 200)}

This attack was automatically blocked. No action is required.
    `;

    if (EMAIL_TEST_MODE) {
        logger.info(`\n${'='.repeat(50)}`);
        logger.warn(`⚠️  SECURITY ALERT - ${label} ATTACK BLOCKED`);
        logger.info(`📧 Alert email logged for: ${email}`);
        logger.info(`🕐 Time: ${time}`);
        logger.info(`📍 Source IP: ${sourceIP || 'Unknown'}`);
        logger.info(`${'='.repeat(50)}\n`);
        return { success: true, message: 'Alert logged to console (test mode)' };
    }

    try {
        await transporter.sendMail({
            from: `"Government KYC Security" <${SMTP_FROM}>`,
            to: email,
            subject,
            text,
            html
        });
        logger.info(`Security alert email sent to: ${email}`);
        return { success: true, message: 'Alert sent successfully' };
    } catch (error) {
        logger.error(`Failed to send security alert: ${error.message}`);
        return { success: false, message: 'Failed to send alert' };
    }
}

module.exports = {
    generateOtp,
    sendLoginOtp,
    sendWelcomeEmail,
    sendAttackAlert
};
