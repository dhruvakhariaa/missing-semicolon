const mongoose = require('mongoose');

/**
 * Pending Request Schema
 * Sector Managers create these; Government Officials approve/reject them
 */
const pendingRequestSchema = new mongoose.Schema({
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sector: {
        type: String,
        enum: ['healthcare', 'agriculture', 'urban'],
        required: true
    },
    action: {
        type: String,
        enum: ['CREATE', 'UPDATE', 'DELETE'],
        required: true
    },
    resourceType: {
        type: String,
        required: true
        // e.g., 'doctor', 'scheme', 'complaint', 'hospital'
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
        // For UPDATE/DELETE - the ID of the resource to modify
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
        // The data for CREATE or the updates for UPDATE
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewNotes: {
        type: String,
        trim: true
    },
    reviewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes
pendingRequestSchema.index({ status: 1 });
pendingRequestSchema.index({ sector: 1 });
pendingRequestSchema.index({ requestedBy: 1 });

module.exports = mongoose.model('PendingRequest', pendingRequestSchema);
