const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: 'anonymous'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    message: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['General', 'Complaint', 'Service', 'Website', 'Other'],
        default: 'General'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
