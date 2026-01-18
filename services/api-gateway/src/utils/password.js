/**
 * Password Hashing - Argon2id (OWASP recommended) with bcrypt fallback
 */

let argon2;
const bcrypt = require('bcryptjs');

try { argon2 = require('argon2'); } catch { argon2 = null; }

const ARGON2_OPTIONS = {
    type: argon2?.argon2id,
    memoryCost: 65536,  // 64 MB
    timeCost: 3,
    parallelism: 4,
    hashLength: 32
};

const BCRYPT_SALT_ROUNDS = 12;

async function hashPassword(password) {
    if (argon2) return argon2.hash(password, ARGON2_OPTIONS);
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    return bcrypt.hash(password, salt);
}

async function verifyPassword(password, hash) {
    if (hash.startsWith('$argon2') && argon2) return argon2.verify(hash, password);
    return bcrypt.compare(password, hash);
}

function needsRehash(hash) {
    if (argon2 && !hash.startsWith('$argon2')) return true;
    if (argon2 && hash.startsWith('$argon2')) return argon2.needsRehash(hash, ARGON2_OPTIONS);
    return false;
}

const COMMON_PASSWORDS = [
    'password', 'password123', '123456', '12345678', 'qwerty', 'admin123',
    'welcome', 'login123', 'test1234', 'p@ssword', 'letmein1', 'password!',
    'qwerty123', 'admin'
];

function validatePasswordStrength(password) {
    const errors = [];
    if (!password || password.length < 8) errors.push('Password must be at least 8 characters');
    if (password.length > 128) errors.push('Password must not exceed 128 characters');

    // Pattern checks
    if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
    if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
    if (!/[0-9]/.test(password)) errors.push('Must contain number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Must contain special character');

    // Common/Breached Password Check
    const normalized = password.toLowerCase();
    if (COMMON_PASSWORDS.includes(normalized)) {
        errors.push('CRITICAL: This is a highly common/breached password. Please choose a more unique one.');
    }

    // Sequence checks
    if (/12345|abcde|asdfg|qwerty/i.test(normalized)) {
        errors.push('Password contains simple sequences (unsecure)');
    }

    return {
        valid: errors.length === 0,
        errors,
        isCommon: COMMON_PASSWORDS.includes(normalized)
    };
}

module.exports = { hashPassword, verifyPassword, needsRehash, validatePasswordStrength };
