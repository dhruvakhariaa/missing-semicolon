const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    citizenId: {
        type: String, // Assuming string for simplicity in demo, or ObjectId if linked to Auth service
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Water', 'Electricity', 'Road', 'Waste Management', 'Sanitation', 'Other'],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    images: [{
        type: String // URLs to images
    }],
    resolvedAt: {
        type: Date
    },
    feedback: {
        rating: Number,
        comment: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
