const Advisory = require('../models/Advisory');

// @desc    Get all advisories (optionally filter by crop)
// @route   GET /api/agriculture/advisories
// @access  Public
exports.getAdvisories = async (req, res) => {
    try {
        const { crop } = req.query;
        let query = {};
        if (crop) {
            query.crop = { $regex: crop, $options: 'i' };
        }

        const advisories = await Advisory.find(query);

        // Mock data if empty for demo purposes
        if (advisories.length === 0 && !crop) {
            return res.status(200).json({
                success: true,
                data: [
                    {
                        crop: 'Wheat',
                        stage: 'Vegetative',
                        advice: 'Apply urea fertilizer after first irrigation.',
                        type: 'General',
                    },
                    {
                        crop: 'Rice',
                        stage: 'Harvesting',
                        advice: 'Ensure grain moisture is below 14% before storage.',
                        type: 'General',
                    }
                ]
            });
        }

        res.status(200).json({
            success: true,
            count: advisories.length,
            data: advisories
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create advisory (Admin/Expert use)
// @route   POST /api/agriculture/advisories
// @access  Private
exports.createAdvisory = async (req, res) => {
    try {
        const advisory = await Advisory.create(req.body);
        res.status(201).json({
            success: true,
            data: advisory
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
