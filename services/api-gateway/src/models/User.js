/**
 * User Model - MongoDB Schema with Security Features
 * 
 * Security Features:
 * - Password hashing with Argon2id (fallback to bcrypt)
 * - Field-level encryption for PAN
 * - Account lockout after failed login attempts
 * - SSO: Single login for all sectors
 */

const mongoose = require('mongoose');
const { encryptField, decryptField } = require('../utils/encryption');

const UserSchema = new mongoose.Schema({
    // Basic Info
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },

    passwordHash: {
        type: String,
        required: [true, 'Password is required'],
        select: false  // Never returned in queries by default
    },

    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxLength: [100, 'Name cannot exceed 100 characters']
    },

    phone: {
        type: String,
        trim: true,
        match: [/^[6-9]\d{9}$/, 'Please use a valid Indian mobile number']
    },

    // KYC Information (Encrypted)
    panNumber: {
        type: String,  // Stored encrypted: "iv:authTag:encryptedData"
        select: false
    },

    aadhaarNumber: {
        type: String,  // Stored encrypted: "iv:authTag:encryptedData"
        select: false
    },

    aadhaarVerified: { type: Boolean, default: false },

    // Role & Permissions - SSO across all sectors
    role: {
        type: String,
        enum: ['citizen', 'provider', 'admin'],
        default: 'citizen'
    },

    permissions: {
        healthcare: { type: [String], default: ['read', 'book_appointment'] },
        agriculture: { type: [String], default: ['read', 'request_advisory'] },
        urban: { type: [String], default: ['read', 'file_complaint'] }
    },

    // KYC Verification Status
    kycLevel: {
        type: Number,
        enum: [0, 1, 2],  // 0=email, 1=PAN verified, 2=Aadhaar verified
        default: 0
    },

    emailVerified: { type: Boolean, default: false },
    panVerified: { type: Boolean, default: false },

    // Security: Account Lockout
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // 2FA
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },

    // Refresh tokens for session management
    refreshTokens: [{
        token: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: Date,
        device: String,
        ip: String
    }],

    // Verification tokens
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // Login OTP (2FA via email)
    loginOtp: { type: String, select: false },
    loginOtpExpires: { type: Date, select: false },
    loginOtpAttempts: { type: Number, default: 0 },
    lastOtpResend: { type: Date, select: false },
    otpResendCount: { type: Number, default: 0, select: false },

    // Face Authentication (3FA)
    faceAuth: {
        enabled: { type: Boolean, default: false },
        faceEmbedding: { type: String, default: null, select: false },  // AES-256-GCM encrypted
        embeddingDimension: { type: Number, default: null },
        numSamplesUsed: { type: Number, default: 0 },
        averageQuality: { type: Number, default: null },
        lastFaceUpdate: { type: Date, default: null },
        faceAuthAttempts: { type: Number, default: 0 },
        faceAuthLockUntil: { type: Date, default: null }
    },

    // Timestamps
    lastLogin: Date,
    passwordChangedAt: Date
}, { timestamps: true });

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });

// Virtual: Is Account Locked?
UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Methods
UserSchema.methods.setPanNumber = function (panNumber) {
    this.panNumber = encryptField(panNumber);
};

UserSchema.methods.getPanNumber = function () {
    if (!this.panNumber) return null;
    return decryptField(this.panNumber);
};

UserSchema.methods.setAadhaarNumber = function (aadhaarNumber) {
    this.aadhaarNumber = encryptField(aadhaarNumber);
};

UserSchema.methods.getAadhaarNumber = function () {
    if (!this.aadhaarNumber) return null;
    return decryptField(this.aadhaarNumber);
};

UserSchema.methods.incLoginAttempts = async function () {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
    }
    const updates = { $inc: { loginAttempts: 1 } };
    if (this.loginAttempts + 1 >= 5) {
        updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 };
    }
    return this.updateOne(updates);
};

UserSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $set: { loginAttempts: 0, lastLogin: new Date() },
        $unset: { lockUntil: 1 }
    });
};

UserSchema.methods.addRefreshToken = function (token, expiresAt, device, ip) {
    if (this.refreshTokens.length >= 5) this.refreshTokens.shift();
    this.refreshTokens.push({ token, expiresAt, device, ip, createdAt: new Date() });
};

UserSchema.methods.removeRefreshToken = function (token) {
    this.refreshTokens = this.refreshTokens.filter(t => t.token !== token);
};

// Face Authentication Methods
UserSchema.methods.setFaceEmbedding = function (embeddingJson) {
    this.faceAuth.faceEmbedding = encryptField(embeddingJson);
};

UserSchema.methods.getFaceEmbedding = function () {
    if (!this.faceAuth?.faceEmbedding) return null;
    return decryptField(this.faceAuth.faceEmbedding);
};

UserSchema.methods.incFaceAuthAttempts = async function () {
    const lockoutMinutes = parseInt(process.env.FACE_LOCKOUT_MINUTES) || 15;
    const maxAttempts = parseInt(process.env.FACE_MAX_ATTEMPTS) || 5;

    // Check if previous lock has expired
    if (this.faceAuth.faceAuthLockUntil && this.faceAuth.faceAuthLockUntil < Date.now()) {
        return this.updateOne({
            $set: { 'faceAuth.faceAuthAttempts': 1 },
            $unset: { 'faceAuth.faceAuthLockUntil': 1 }
        });
    }

    const updates = { $inc: { 'faceAuth.faceAuthAttempts': 1 } };
    if ((this.faceAuth.faceAuthAttempts || 0) + 1 >= maxAttempts) {
        updates.$set = { 'faceAuth.faceAuthLockUntil': new Date(Date.now() + lockoutMinutes * 60 * 1000) };
    }
    return this.updateOne(updates);
};

UserSchema.methods.resetFaceAuthAttempts = function () {
    return this.updateOne({
        $set: { 'faceAuth.faceAuthAttempts': 0 },
        $unset: { 'faceAuth.faceAuthLockUntil': 1 }
    });
};

// Virtual: Is Face Auth Locked?
UserSchema.virtual('isFaceAuthLocked').get(function () {
    return !!(this.faceAuth?.faceAuthLockUntil && this.faceAuth.faceAuthLockUntil > Date.now());
});

// Statics
UserSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findByEmailWithPassword = function (email) {
    return this.findOne({ email: email.toLowerCase() }).select('+passwordHash');
};

// JSON Transformation - remove sensitive fields
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    delete obj.panNumber;
    delete obj.refreshTokens;
    delete obj.twoFactorSecret;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('User', UserSchema);
