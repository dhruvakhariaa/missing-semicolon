/**
 * JWT Token Utilities - SSO Implementation (Hardened)
 * Single token works across Healthcare, Agriculture, Urban sectors
 * 
 * Security Features:
 * - Algorithm enforcement (HS256 only)
 * - Expiration validation
 * - Token type verification
 * - Issuer/audience validation
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const ALLOWED_ALGORITHMS = ['HS256'];  // CRITICAL: Only allow secure algorithms

const getSecrets = () => {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!accessSecret || !refreshSecret) {
        throw new Error('JWT secrets not configured');
    }
    if (accessSecret.length < 32 || refreshSecret.length < 32) {
        throw new Error('JWT secrets must be at least 32 characters');
    }
    return { accessSecret, refreshSecret };
};

/**
 * Generate access token for a user
 * @param {object} user - User document
 * @returns {string} - Signed JWT access token
 */
function generateAccessToken(user) {
    const { accessSecret } = getSecrets();
    return jwt.sign({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        kycLevel: user.kycLevel,
        // SSO: Permissions for ALL sectors in one token
        permissions: {
            healthcare: user.permissions?.healthcare || ['read'],
            agriculture: user.permissions?.agriculture || ['read'],
            urban: user.permissions?.urban || ['read']
        },
        tokenType: 'access'
    }, accessSecret, {
        algorithm: 'HS256',  // Explicitly set algorithm
        expiresIn: ACCESS_TOKEN_EXPIRY,
        issuer: 'service-delivery-platform',
        audience: 'citizen-portal',
        subject: user._id.toString()
    });
}

/**
 * Generate refresh token for a user
 * @param {object} user - User document
 * @returns {{token: string, tokenId: string, expiresAt: Date}}
 */
function generateRefreshToken(user) {
    const { refreshSecret } = getSecrets();
    const tokenId = crypto.randomBytes(16).toString('hex');
    const token = jwt.sign({
        userId: user._id.toString(),
        tokenId,
        tokenType: 'refresh'
    }, refreshSecret, {
        algorithm: 'HS256',  // Explicitly set algorithm
        expiresIn: REFRESH_TOKEN_EXPIRY,
        issuer: 'service-delivery-platform',
        audience: 'token-refresh',
        subject: user._id.toString()
    });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    return { token, tokenId, expiresAt };
}

/**
 * Verify and decode an access token with strict security checks
 * @param {string} token - JWT access token
 * @returns {{valid: boolean, payload?: object, error?: string}}
 */
function verifyAccessToken(token) {
    const { accessSecret } = getSecrets();

    try {
        // Pre-validation: Check token structure
        if (!token || typeof token !== 'string') {
            return { valid: false, error: 'Invalid token format' };
        }

        // Split token to check header
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { valid: false, error: 'Malformed token' };
        }

        // Decode header without verification to check algorithm
        try {
            // Convert base64url to base64 (replace - with +, _ with /, add padding)
            let base64Header = parts[0].replace(/-/g, '+').replace(/_/g, '/');
            while (base64Header.length % 4) base64Header += '=';
            const headerJson = Buffer.from(base64Header, 'base64').toString('utf8');
            const header = JSON.parse(headerJson);

            // CRITICAL: Reject "none" algorithm and any non-allowed algorithms
            if (!header.alg || header.alg.toLowerCase() === 'none') {
                return { valid: false, error: 'Invalid algorithm: none not allowed' };
            }
            if (!ALLOWED_ALGORITHMS.includes(header.alg)) {
                return { valid: false, error: `Invalid algorithm: ${header.alg} not allowed` };
            }
        } catch (e) {
            return { valid: false, error: 'Failed to decode token header' };
        }

        // Verify token with strict options
        const payload = jwt.verify(token, accessSecret, {
            algorithms: ALLOWED_ALGORITHMS,  // Only accept specified algorithms
            issuer: 'service-delivery-platform',
            audience: 'citizen-portal',
            complete: false,
            ignoreExpiration: false,  // CRITICAL: Always check expiration
            ignoreNotBefore: false
        });

        // Verify token type
        if (payload.tokenType !== 'access') {
            return { valid: false, error: 'Invalid token type' };
        }

        // Verify required claims exist
        if (!payload.userId || !payload.email) {
            return { valid: false, error: 'Missing required claims' };
        }

        return { valid: true, payload };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { valid: false, error: 'Token expired' };
        }
        if (error.name === 'JsonWebTokenError') {
            return { valid: false, error: 'Invalid token signature' };
        }
        if (error.name === 'NotBeforeError') {
            return { valid: false, error: 'Token not yet valid' };
        }
        return { valid: false, error: 'Token verification failed' };
    }
}

/**
 * Verify and decode a refresh token with strict security checks
 * @param {string} token - JWT refresh token
 * @returns {{valid: boolean, payload?: object, error?: string}}
 */
function verifyRefreshToken(token) {
    const { refreshSecret } = getSecrets();

    try {
        // Pre-validation: Check token structure
        if (!token || typeof token !== 'string') {
            return { valid: false, error: 'Invalid token format' };
        }

        // Split token to check header
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { valid: false, error: 'Malformed token' };
        }

        // Decode header without verification to check algorithm
        try {
            // Convert base64url to base64 (replace - with +, _ with /, add padding)
            let base64Header = parts[0].replace(/-/g, '+').replace(/_/g, '/');
            while (base64Header.length % 4) base64Header += '=';
            const headerJson = Buffer.from(base64Header, 'base64').toString('utf8');
            const header = JSON.parse(headerJson);

            // CRITICAL: Reject "none" algorithm
            if (!header.alg || header.alg.toLowerCase() === 'none') {
                return { valid: false, error: 'Invalid algorithm: none not allowed' };
            }
            if (!ALLOWED_ALGORITHMS.includes(header.alg)) {
                return { valid: false, error: `Invalid algorithm: ${header.alg} not allowed` };
            }
        } catch (e) {
            return { valid: false, error: 'Failed to decode token header' };
        }

        // Verify token with strict options
        const payload = jwt.verify(token, refreshSecret, {
            algorithms: ALLOWED_ALGORITHMS,
            issuer: 'service-delivery-platform',
            audience: 'token-refresh',
            complete: false,
            ignoreExpiration: false,
            ignoreNotBefore: false
        });

        // Verify token type
        if (payload.tokenType !== 'refresh') {
            return { valid: false, error: 'Invalid token type' };
        }

        // Verify required claims
        if (!payload.userId || !payload.tokenId) {
            return { valid: false, error: 'Missing required claims' };
        }

        return { valid: true, payload };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { valid: false, error: 'Refresh token expired' };
        }
        if (error.name === 'JsonWebTokenError') {
            return { valid: false, error: 'Invalid refresh token signature' };
        }
        return { valid: false, error: error.message };
    }
}

/**
 * Extract Bearer token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Token or null
 */
function extractTokenFromHeader(authHeader) {
    if (!authHeader || typeof authHeader !== 'string') return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    // Basic token format validation
    const token = parts[1];
    if (!token || token.split('.').length !== 3) return null;
    return token;
}

/**
 * Check if user has permission for sector/action
 * @param {object} tokenPayload - Decoded token payload
 * @param {string} sector - Sector name
 * @param {string} action - Action to check
 * @returns {boolean}
 */
function hasPermission(tokenPayload, sector, action) {
    if (!tokenPayload) return false;
    if (tokenPayload.role === 'admin') return true;
    const perms = tokenPayload.permissions?.[sector];
    return perms?.includes(action) || perms?.includes('*');
}

/**
 * Decode token without verification (for debugging only)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null
 */
function decodeWithoutVerification(token) {
    try {
        return jwt.decode(token, { complete: true });
    } catch {
        return null;
    }
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    extractTokenFromHeader,
    hasPermission,
    decodeWithoutVerification,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
    ALLOWED_ALGORITHMS
};
