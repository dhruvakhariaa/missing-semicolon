const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    eligibility: {
        type: String // Text description of who is eligible
    },
    benefits: {
        type: String
    },
    applicationLink: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Scheme', SchemeSchema);
