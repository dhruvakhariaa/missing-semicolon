const mongoose = require('mongoose');

const AdvisorySchema = new mongoose.Schema({
    crop: {
        type: String,
        required: true
    },
    stage: {
        type: String, // e.g., 'Sowing', 'Vegetative', 'Flowering', 'Harvesting'
        required: true
    },
    advice: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['General', 'Disease', 'Pest', 'Weather'],
        default: 'General'
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Advisory', AdvisorySchema);
