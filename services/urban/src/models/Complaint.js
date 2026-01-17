const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    citizenId: {
        type: String,
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
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    images: [{
        type: String // Base64 encoded images
    }],
    // Timeline/History of status changes
    history: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String
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

// Add initial history entry when complaint is created
complaintSchema.pre('save', function (next) {
    if (this.isNew && (!this.history || this.history.length === 0)) {
        this.history = [{
            status: 'Pending',
            timestamp: new Date(),
            note: 'Complaint filed'
        }];
    }
    next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
