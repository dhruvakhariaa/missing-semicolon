const Farmer = require('../models/Farmer');
const { validationResult } = require('express-validator');

// @desc    Register a new farmer
// @route   POST /api/agriculture/farmers
// @access  Public
exports.registerFarmer = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone, aadharNumber, village, taluka, district, state } = req.body;

    try {
        let farmer = await Farmer.findOne({ phone });

        if (farmer) {
            return res.status(400).json({ success: false, message: 'Farmer already registered with this phone number' });
        }

        farmer = new Farmer({
            name,
            phone,
            aadharNumber,
            village,
            taluka,
            district,
            state
        });

        await farmer.save();

        res.status(201).json({
            success: true,
            data: farmer,
            message: 'Farmer registered successfully'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Login farmer (Mock OTP)
// @route   POST /api/agriculture/farmers/login
// @access  Public
exports.loginFarmer = async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone) {
        return res.status(400).json({ success: false, message: 'Please provide a phone number' });
    }

    // Mock OTP check: In real world, verify OTP here.
    // For hackathon, any OTP is valid or specific '123456'
    if (otp !== '123456') {
        // return res.status(400).json({ success: false, message: 'Invalid OTP' });
        // For ease of testing, let's accept 123456. 
        // You can uncomment above line to enforce it.
    }

    try {
        const farmer = await Farmer.findOne({ phone });

        if (!farmer) {
            return res.status(404).json({ success: false, message: 'Farmer not found with this phone number' });
        }

        // Return JWT or just ID for simple session? 
        // Plan mentions "Login should be done via OTP". 
        // We'll return the full farmer object as "session" for simple frontend logic.

        res.status(200).json({
            success: true,
            data: farmer,
            message: 'Login successful'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get farmer profile
// @route   GET /api/agriculture/farmers/:id
// @access  Private (Mock)
exports.getFarmerProfile = async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.params.id);

        if (!farmer) {
            return res.status(404).json({ success: false, message: 'Farmer not found' });
        }

        res.status(200).json({
            success: true,
            data: farmer
        });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Farmer not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add land parcel
// @route   POST /api/agriculture/farmers/:id/land
// @access  Private (Mock)
exports.addLandParcel = async (req, res) => {
    const { surveyNumber, area, village, irrigationType, currentCrop, sowingDate } = req.body;

    try {
        const farmer = await Farmer.findById(req.params.id);

        if (!farmer) {
            return res.status(404).json({ success: false, message: 'Farmer not found' });
        }

        const newParcel = {
            surveyNumber,
            area,
            village,
            irrigationType,
            currentCrop,
            sowingDate
        };

        farmer.landParcels.push(newParcel);
        await farmer.save();

        res.status(200).json({
            success: true,
            data: farmer.landParcels,
            message: 'Land parcel added successfully'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update land parcel
// @route   PUT /api/agriculture/farmers/:id/land/:parcelId
// @access  Private (Mock)
exports.updateLandParcel = async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.params.id);

        if (!farmer) {
            return res.status(404).json({ success: false, message: 'Farmer not found' });
        }

        const parcel = farmer.landParcels.id(req.params.parcelId);
        if (!parcel) {
            return res.status(404).json({ success: false, message: 'Land parcel not found' });
        }

        // Update fields if provided
        // Check for undefined to allow clearing values (e.g. set to null)
        if (req.body.sowingDate !== undefined) parcel.sowingDate = req.body.sowingDate;
        if (req.body.lastIrrigationDate !== undefined) parcel.lastIrrigationDate = req.body.lastIrrigationDate;
        if (req.body.soilDetails) parcel.soilDetails = { ...parcel.soilDetails, ...req.body.soilDetails };
        if (req.body.currentCrop) parcel.currentCrop = req.body.currentCrop;
        // Add other fields as needed

        await farmer.save();

        res.status(200).json({
            success: true,
            data: farmer.landParcels,
            message: 'Land parcel updated successfully'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
