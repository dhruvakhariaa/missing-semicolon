/**
 * Encryption Utilities - AES-256-GCM Field-Level Encryption
 * For PAN, Aadhaar, Medical records
 */

const crypto = require('crypto');

const getEncryptionKey = () => {
    const key = process.env.FIELD_ENCRYPTION_KEY;
    if (!key) throw new Error('FIELD_ENCRYPTION_KEY environment variable is required');
    if (key.length === 64) return Buffer.from(key, 'hex');
    if (key.length === 44) return Buffer.from(key, 'base64');
    return crypto.createHash('sha256').update(key).digest();
};

const IV_LENGTH = 16;

function encryptField(plainText) {
    if (!plainText) return null;
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptField(encryptedData) {
    if (!encryptedData) return null;
    const key = getEncryptionKey();
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    if (!ivHex || !authTagHex || !encrypted) throw new Error('Invalid encrypted data format');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
}

function hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

function generateSecureToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
}

module.exports = { encryptField, decryptField, generateEncryptionKey, hashData, generateSecureToken };
