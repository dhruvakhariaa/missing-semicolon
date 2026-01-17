const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    citizenId: {
        type: String,
        required: true
    },
    serviceType: {
        type: String,
        required: true
    },
    details: {
        type: Object
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    requestedDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
