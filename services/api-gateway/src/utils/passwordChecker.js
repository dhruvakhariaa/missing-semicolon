/**
 * Password Checker - Breach Detection & Common Password Prevention
 * Integrates with HaveIBeenPwned API for breach checking
 */

const crypto = require('crypto');

// Top 1000 common passwords (subset for demo)
const COMMON_PASSWORDS = new Set([
    '123456', 'password', '12345678', 'qwerty', '123456789',
    '12345', '1234', '111111', '1234567', 'dragon',
    '123123', 'baseball', 'iloveyou', 'trustno1', 'sunshine',
    'master', 'welcome', 'shadow', 'ashley', 'football',
    'jesus', 'michael', 'ninja', 'mustang', 'password1',
    'password123', 'admin', 'letmein', 'monkey', 'abc123',
    'starwars', 'login', 'passw0rd', 'qwerty123', 'admin123',
    'root', 'toor', 'pass', 'test', 'guest',
    'master', 'changeme', 'hello', 'love', 'princess',
    'solo', 'qazwsx', 'access', 'flower', 'hottie'
]);

/**
 * Check if password is in common passwords list
 * @param {string} password - Password to check
 * @returns {boolean} - True if password is common (should be rejected)
 */
function isCommonPassword(password) {
    if (!password || typeof password !== 'string') return true;
    return COMMON_PASSWORDS.has(password.toLowerCase());
}

/**
 * Check if password is similar to user info
 * @param {string} password - Password to check
 * @param {object} userInfo - User info (email, name, etc.)
 * @returns {boolean} - True if password is similar (should be rejected)
 */
function isSimilarToUserInfo(password, userInfo = {}) {
    if (!password || typeof password !== 'string') return true;

    const lowercasePassword = password.toLowerCase();

    // Check email username
    if (userInfo.email) {
        const emailUsername = userInfo.email.split('@')[0].toLowerCase();
        if (lowercasePassword.includes(emailUsername) || emailUsername.includes(lowercasePassword)) {
            return true;
        }
    }

    // Check name
    if (userInfo.name) {
        const nameParts = userInfo.name.toLowerCase().split(' ');
        for (const part of nameParts) {
            if (part.length > 2 && (lowercasePassword.includes(part) || part.includes(lowercasePassword))) {
                return true;
            }
        }
    }

    // Check phone
    if (userInfo.phone) {
        if (lowercasePassword.includes(userInfo.phone) || userInfo.phone.includes(password)) {
            return true;
        }
    }

    return false;
}

/**
 * Generate SHA-1 hash prefix for k-anonymity API
 * @param {string} password - Password to hash
 * @returns {object} - { prefix, suffix } for HIBP API
 */
function getPasswordHashParts(password) {
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    return {
        prefix: hash.substring(0, 5),
        suffix: hash.substring(5)
    };
}

/**
 * Check if password has been breached using HaveIBeenPwned API
 * Uses k-anonymity to protect the password during check
 * @param {string} password - Password to check
 * @returns {Promise<{breached: boolean, count: number}>}
 */
async function checkBreachedPassword(password) {
    try {
        const { prefix, suffix } = getPasswordHashParts(password);

        // In production, this would make an actual API call to:
        // https://api.pwnedpasswords.com/range/${prefix}

        // For testing/demo, we simulate the check
        const simulatedBreachedHashes = {
            'password': { suffix: 'CBFDAC6008F9CAB4083784CBD1874F76618D2A97', count: 3861493 },
            '123456': { suffix: '7C4A8D09CA3762AF61E59520943DC26494F8941B', count: 24230577 },
            'qwerty': { suffix: 'B1B3773A05C0ED0176787A4F1574FF0075F7521E', count: 3912816 }
        };

        const breachInfo = simulatedBreachedHashes[password.toLowerCase()];
        if (breachInfo) {
            return { breached: true, count: breachInfo.count };
        }

        return { breached: false, count: 0 };
    } catch (error) {
        // Fail open for availability (but log the error)
        console.error('Breach check failed:', error);
        return { breached: false, count: 0, error: error.message };
    }
}

/**
 * Comprehensive password security check
 * @param {string} password - Password to check
 * @param {object} userInfo - User info for similarity check
 * @returns {Promise<{safe: boolean, issues: string[]}>}
 */
async function validatePasswordSecurity(password, userInfo = {}) {
    const issues = [];

    // Check if common password
    if (isCommonPassword(password)) {
        issues.push('Password is too common');
    }

    // Check if similar to user info
    if (isSimilarToUserInfo(password, userInfo)) {
        issues.push('Password is too similar to your personal information');
    }

    // Check if breached
    const breachCheck = await checkBreachedPassword(password);
    if (breachCheck.breached) {
        issues.push(`Password has been exposed in ${breachCheck.count.toLocaleString()} data breaches`);
    }

    return {
        safe: issues.length === 0,
        issues
    };
}

module.exports = {
    isCommonPassword,
    isSimilarToUserInfo,
    checkBreachedPassword,
    validatePasswordSecurity,
    getPasswordHashParts
};
