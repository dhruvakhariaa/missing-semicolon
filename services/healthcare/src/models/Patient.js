/**
 * Patient Model
 * Represents patients/users of healthcare services
 */

const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    // Link to user in main auth system
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        lowercase: true
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    emergencyContact: {
        name: String,
        relation: String,
        phone: String
    },
    medicalHistory: {
        allergies: [String],
        conditions: [String],
        medications: [String],
        notes: String
    },
    insuranceInfo: {
        provider: String,
        policyNumber: String,
        validUntil: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
patientSchema.index({ email: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ name: 'text' });

// Virtual for age calculation
patientSchema.virtual('age').get(function () {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
});

patientSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);
