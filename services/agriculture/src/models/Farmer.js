const mongoose = require('mongoose');

const LandParcelSchema = new mongoose.Schema({
    surveyNumber: {
        type: String,
        required: true
    },
    area: {
        type: Number, // in acres
        required: true
    },
    village: {
        type: String,
        required: true
    },
    irrigationType: {
        type: String,
        enum: ['Irrigated', 'Rainfed', 'Drip', 'Sprinkler'],
        default: 'Rainfed'
    },
    currentCrop: {
        type: String, // e.g., 'Wheat', 'Rice'
        default: null
    },
    sowingDate: {
        type: Date,
        default: null
    },
    soilDetails: {
        ph: Number,
        nitrogen: Number,
        phosphorus: Number,
        potassium: Number,
        organicCarbon: Number,
        lastTested: Date
    },
    lastIrrigationDate: {
        type: Date,
        default: null
    }
});

const FarmerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{10}$/
    },
    aadharNumber: {
        type: String,
        required: true,
        unique: true
    },
    village: {
        type: String,
        required: true
    },
    taluka: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    landParcels: [LandParcelSchema],
    enrolledSchemes: [{
        schemeName: String,
        enrollmentDate: { type: Date, default: Date.now },
        status: { type: String, default: 'Applied' }, // Applied, Approved, Rejected
        applicationId: String,
        category: String,
        landArea: Number,
        bankAccount: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Farmer', FarmerSchema);
