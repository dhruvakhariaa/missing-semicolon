/**
 * Appointment Model
 * Represents scheduled appointments between patients and doctors
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    // Appointment reference number
    appointmentNumber: {
        type: String,
        unique: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    timeSlot: {
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled'
    },
    type: {
        type: String,
        enum: ['in-person', 'telemedicine'],
        default: 'in-person'
    },
    symptoms: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    // Doctor's notes after consultation
    diagnosis: String,
    prescription: String,
    followUpDate: Date,
    // Cancellation info
    cancelledAt: Date,
    cancellationReason: String,
    // Payment info
    fee: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Generate appointment number before saving
appointmentSchema.pre('save', async function (next) {
    if (!this.appointmentNumber) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.appointmentNumber = `APT${dateStr}${random}`;
    }
    next();
});

// Indexes for common queries
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1, 'timeSlot.startTime': 1 });
appointmentSchema.index({ appointmentNumber: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
