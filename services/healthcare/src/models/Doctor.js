/**
 * Doctor Model
 * Represents healthcare providers/doctors
 */

const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Doctor name is required'],
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    specialization: {
        type: String,
        required: true,
        trim: true
    },
    qualification: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        default: 0,
        min: 0
    },
    consultationFee: {
        type: Number,
        default: 500,
        min: 0
    },
    bio: String,
    profileImage: String,
    // Available days and hours
    availability: {
        days: {
            type: [String],
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        startTime: {
            type: String,
            default: '09:00'
        },
        endTime: {
            type: String,
            default: '17:00'
        },
        slotDuration: {
            type: Number,
            default: 30 // minutes
        }
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for common queries
doctorSchema.index({ department: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ isActive: 1 });
doctorSchema.index({ name: 'text', specialization: 'text' });

// Virtual for full details with department
doctorSchema.virtual('departmentDetails', {
    ref: 'Department',
    localField: 'department',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
