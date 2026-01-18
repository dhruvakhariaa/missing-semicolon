const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['citizen', 'sector_manager', 'government_official', 'system_admin'],
        default: 'citizen'
    },
    // For sector_manager only - which sector they manage
    assignedSector: {
        type: String,
        enum: ['healthcare', 'agriculture', 'urban', null],
        default: null
    },
    phone: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
userSchema.index({ role: 1 });
userSchema.index({ assignedSector: 1 });

module.exports = mongoose.model('User', userSchema);
