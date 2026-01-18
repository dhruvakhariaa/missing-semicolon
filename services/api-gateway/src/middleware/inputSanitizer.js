/**
 * BULLETPROOF Input Validation Middleware
 * Enterprise-grade security with strict pattern rejection
 * 
 * Defense Layers:
 * 1. Type validation - reject non-string inputs
 * 2. Pattern detection - reject dangerous patterns
 * 3. HTML sanitization - escape any remaining entities
 * 4. Length enforcement - prevent DoS via large payloads
 * 5. Email alerts - notify admin and user when attacks are blocked
 */

const logger = require('../utils/logger');

// Admin email for security alerts
const ADMIN_EMAIL = process.env.SMTP_USER || 'admin@example.com';

/**
 * SECURITY ALERTS FLAG
 * Set SECURITY_ALERTS_ENABLED=true in .env to enable email alerts
 * Default: false (disabled for local development to prevent spam)
 * 
 * FOR PRODUCTION: Add this line to your .env file:
 * SECURITY_ALERTS_ENABLED=true
 */
const SECURITY_ALERTS_ENABLED = process.env.SECURITY_ALERTS_ENABLED === 'true';

/**
 * Send attack alert emails asynchronously (non-blocking)
 * Alerts both admin (with user context) and the affected user
 * 
 * NOTE: Disabled during local testing. Enable via SECURITY_ALERTS_ENABLED=true
 */
async function sendAttackAlertAsync(attackType, payload, sourceIP, userEmail) {
    // Skip if alerts are disabled (local development)
    if (!SECURITY_ALERTS_ENABLED) {
        logger.debug(`Attack alert skipped (SECURITY_ALERTS_ENABLED=false): ${attackType}`);
        return;
    }

    try {
        const { sendAttackAlert } = require('../services/emailService');

        // Only send for critical attacks
        const criticalAttacks = ['sqlInjection', 'nosql', 'commandInjection', 'pathTraversal'];
        const isCritical = criticalAttacks.some(c => attackType.toLowerCase().includes(c.toLowerCase()));

        if (!isCritical) return;

        const timestamp = new Date().toISOString();

        // Map attack type to short code
        const typeMap = {
            'sqlinjection': 'sqli',
            'commandinjection': 'command',
            'pathtraversal': 'path',
            'xss': 'xss',
            'nosql': 'nosql'
        };
        const shortType = typeMap[attackType.toLowerCase().replace(/_/g, '')] || attackType;

        // Send to admin with user context
        const adminDetails = {
            attackType: shortType,
            payload: payload.substring(0, 200),
            sourceIP,
            timestamp,
            targetUserEmail: userEmail || 'Unknown',
            isAdminAlert: true
        };
        await sendAttackAlert(ADMIN_EMAIL, adminDetails);

        // Send to user (if valid email)
        if (userEmail && userEmail.includes('@') && userEmail !== ADMIN_EMAIL) {
            const userDetails = {
                attackType: shortType,
                payload: payload.substring(0, 200),
                sourceIP,
                timestamp,
                isAdminAlert: false
            };
            await sendAttackAlert(userEmail, userDetails);
        }

        logger.info(`Attack alert sent for ${attackType} to admin and ${userEmail || 'N/A'}`);
    } catch (error) {
        // Don't block the response if email fails
        logger.error('Failed to send attack alert email:', error.message);
    }
}

// ===========================================
// DANGEROUS PATTERN DEFINITIONS (OWASP TOP 10)
// ===========================================

const DANGEROUS_PATTERNS = {
    // XSS Patterns - VERY STRICT
    xss: [
        /<script/i,
        /<\/script/i,
        /javascript:/i,
        /on\w+\s*=/i,          // onclick=, onerror=, onload=, etc.
        /<iframe/i,
        /<embed/i,
        /<object/i,
        /<link/i,
        /<meta/i,
        /<style/i,
        /<img[^>]+src/i,
        /expression\s*\(/i,
        /url\s*\(/i,
        /data:/i,
        /vbscript:/i,
        /<svg/i,
        /<math/i,
        /&lt;script/i,         // HTML encoded
        /&#x3C;script/i,       // Hex encoded
        /&#60;script/i,        // Decimal encoded
        /%3Cscript/i,          // URL encoded
        /\u003Cscript/i        // Unicode encoded
    ],

    // SQL Injection Patterns
    sqlInjection: [
        /'\s*OR\s*'?1/i,
        /'\s*OR\s*''?\s*=/i,
        /'\s*=\s*'/i,
        /--\s*$/,
        /;\s*DROP/i,
        /;\s*DELETE/i,
        /;\s*UPDATE/i,
        /;\s*INSERT/i,
        /UNION\s+SELECT/i,
        /UNION\s+ALL/i,
        /'\s*;\s*/,
        /1\s*=\s*1/i,
        /OR\s+1\s*=\s*1/i
    ],

    // Command Injection Patterns
    commandInjection: [
        /[;&|`$]/,             // Shell metacharacters
        /\$\(/,                // Command substitution
        /`[^`]*`/,             // Backtick execution
        /\|\|/,                // OR operator
        /&&/,                  // AND operator
        />\s*\//,              // Redirect
        /<\s*\//,              // Input redirect
        /\bcat\s/i,
        /\bls\s/i,
        /\brm\s/i,
        /\bchmod\s/i,
        /\bwget\s/i,
        /\bcurl\s/i,
        /\beval\s/i,
        /\bexec\s/i,
        /\/etc\/passwd/i,
        /\/bin\//i,
        /\bsudo\s/i,
        /\bsh\s/i,
        /\bbash\s/i
    ],

    // Path Traversal
    pathTraversal: [
        /\.\.\//,
        /\.\.%2f/i,
        /\.\.%5c/i,
        /%2e%2e/i,
        /\.\.\/\.\.\//
    ]
};

// ===========================================
// VALIDATION FUNCTIONS
// ===========================================

/**
 * Check if a string contains any dangerous patterns
 */
function containsDangerousPattern(str, patternType) {
    if (typeof str !== 'string') return false;

    const patterns = DANGEROUS_PATTERNS[patternType];
    if (!patterns) return false;

    for (const pattern of patterns) {
        pattern.lastIndex = 0;  // Reset regex
        if (pattern.test(str)) {
            return true;
        }
    }
    return false;
}

/**
 * Check ALL dangerous patterns
 */
function containsAnyDangerousPattern(str) {
    if (typeof str !== 'string') return { dangerous: false };

    for (const [type, patterns] of Object.entries(DANGEROUS_PATTERNS)) {
        for (const pattern of patterns) {
            pattern.lastIndex = 0;
            if (pattern.test(str)) {
                return { dangerous: true, type, pattern: pattern.toString() };
            }
        }
    }
    return { dangerous: false };
}

/**
 * Escape HTML entities
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/`/g, '&#x60;')
        .replace(/=/g, '&#x3D;');
}

// ===========================================
// MIDDLEWARE FUNCTIONS
// ===========================================

/**
 * STRICT Input Sanitization - Applied globally
 * REJECTS requests with dangerous patterns instead of just sanitizing
 * Sends email alerts to admin and user when attacks are blocked
 */
const strictInputValidation = (req, res, next) => {
    // Extract user email for alert context (if available)
    const userEmail = req.body?.email || req.query?.email || null;
    const sourceIP = req.ip || req.connection?.remoteAddress || 'Unknown';

    // Check body
    if (req.body) {
        for (const [key, value] of Object.entries(req.body)) {
            // Type check - reject non-primitive types for known fields
            if (['email', 'password', 'name', 'phone'].includes(key)) {
                if (value !== null && typeof value === 'object') {
                    logger.warn(`NoSQL injection attempt blocked: ${key} is object`);
                    // Send alert (non-blocking)
                    sendAttackAlertAsync('nosql', JSON.stringify(value), sourceIP, userEmail);
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'NOSQL_INJECTION_BLOCKED',
                            message: 'Invalid input format'
                        }
                    });
                }
            }

            // Pattern check for strings
            if (typeof value === 'string') {
                const check = containsAnyDangerousPattern(value);
                if (check.dangerous) {
                    logger.warn(`${check.type} attack blocked in field ${key}`);
                    // Send alert (non-blocking)
                    sendAttackAlertAsync(check.type, value, sourceIP, userEmail);
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: `${check.type.toUpperCase()}_BLOCKED`,
                            message: 'Invalid characters detected'
                        }
                    });
                }
            }
        }
    }

    // Check query params
    if (req.query) {
        for (const [key, value] of Object.entries(req.query)) {
            if (typeof value === 'string') {
                const check = containsAnyDangerousPattern(value);
                if (check.dangerous) {
                    logger.warn(`${check.type} attack blocked in query ${key}`);
                    // Send alert (non-blocking)
                    sendAttackAlertAsync(check.type, value, sourceIP, userEmail);
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: `${check.type.toUpperCase()}_BLOCKED`,
                            message: 'Invalid query parameter'
                        }
                    });
                }
            }
        }
    }

    next();
};

/**
 * NoSQL Injection Blocker - Strict type checking
 * Sends email alerts when MongoDB operator attacks are detected
 */
const blockNoSqlInjection = (req, res, next) => {
    if (!req.body) return next();

    const userEmail = req.body?.email || null;
    const sourceIP = req.ip || req.connection?.remoteAddress || 'Unknown';

    const checkValue = (value, path) => {
        if (value === null || value === undefined) return null;

        // Object values in critical fields = attack
        if (typeof value === 'object' && !Array.isArray(value)) {
            const keys = Object.keys(value);
            for (const key of keys) {
                if (key.startsWith('$')) {
                    return { blocked: true, path, operator: key };
                }
            }
        }
        return null;
    };

    for (const [key, value] of Object.entries(req.body)) {
        const result = checkValue(value, key);
        if (result) {
            logger.warn(`NoSQL injection blocked: ${result.operator} in ${result.path}`);
            // Send alert (non-blocking)
            sendAttackAlertAsync('nosql', `${result.operator} operator in ${result.path}`, sourceIP, userEmail);
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NOSQL_INJECTION_BLOCKED',
                    message: 'Invalid input format detected'
                }
            });
        }
    }

    next();
};

/**
 * Validate auth inputs specifically - VERY STRICT
 */
const validateAuthInput = (req, res, next) => {
    const { email, password, name } = req.body;

    // Email must be string
    if (email !== undefined) {
        if (typeof email !== 'string') {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT_TYPE', message: 'Email must be a string' }
            });
        }
        // Check for XSS/injection in email
        const check = containsAnyDangerousPattern(email);
        if (check.dangerous) {
            return res.status(400).json({
                success: false,
                error: { code: 'XSS_BLOCKED', message: 'Invalid email format' }
            });
        }
    }

    // Password must be string
    if (password !== undefined) {
        if (typeof password !== 'string') {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT_TYPE', message: 'Password must be a string' }
            });
        }
    }

    // Name must be string and safe
    if (name !== undefined) {
        if (typeof name !== 'string') {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT_TYPE', message: 'Name must be a string' }
            });
        }
        // STRICT: Check for XSS in name
        const check = containsAnyDangerousPattern(name);
        if (check.dangerous) {
            return res.status(400).json({
                success: false,
                error: { code: 'XSS_BLOCKED', message: 'Invalid characters in name' }
            });
        }
        // Check for command injection in name
        if (containsDangerousPattern(name, 'commandInjection')) {
            return res.status(400).json({
                success: false,
                error: { code: 'COMMAND_INJECTION_BLOCKED', message: 'Invalid characters in name' }
            });
        }
    }

    next();
};

/**
 * Sanitize inputs (for non-critical fields) - escape but don't reject
 */
const sanitizeInputs = (options = {}) => (req, res, next) => {
    const {
        escapeHtmlEntities = true,
        maxLength = 10000
    } = options;

    const sanitizeValue = (value) => {
        if (typeof value !== 'string') return value;
        let result = value.trim();
        if (result.length > maxLength) {
            result = result.substring(0, maxLength);
        }
        if (escapeHtmlEntities) {
            result = escapeHtml(result);
        }
        return result;
    };

    const sanitizeObject = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            if (key.startsWith('$')) continue;  // Skip MongoDB operators
            result[key] = typeof value === 'object' ? sanitizeObject(value) : sanitizeValue(value);
        }
        return result;
    };

    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);

    next();
};

/**
 * Large payload protection
 */
const limitPayloadSize = (maxBytes = 100000) => (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > maxBytes) {
        return res.status(413).json({
            success: false,
            error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body too large' }
        });
    }
    next();
};

module.exports = {
    strictInputValidation,
    sanitizeInputs,
    validateAuthInput,
    blockNoSqlInjection,
    limitPayloadSize,
    escapeHtml,
    containsDangerousPattern,
    containsAnyDangerousPattern,
    DANGEROUS_PATTERNS
};
