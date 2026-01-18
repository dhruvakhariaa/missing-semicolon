const Feedback = require('../models/Feedback');
const logger = require('../utils/logger');

// @desc    Get all feedback
// @route   GET /api/urban/feedback
// @access  Public
exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        logger.error(`Error in getAllFeedback: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get feedback metrics
// @route   GET /api/urban/feedback/metrics
// @access  Public
exports.getFeedbackMetrics = async (req, res) => {
    try {
        const total = await Feedback.countDocuments();
        const avgRating = await Feedback.aggregate([
            { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                total,
                averageRating: avgRating.length > 0 ? avgRating[0].avg.toFixed(1) : 0
            }
        });
    } catch (error) {
        logger.error(`Error in getFeedbackMetrics: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Submit feedback
// @route   POST /api/urban/feedback
// @access  Public
exports.submitFeedback = async (req, res) => {
    try {
        const { rating, message, userId, category } = req.body;

        const feedback = await Feedback.create({
            rating,
            message: message || '',
            userId: userId || 'anonymous',
            category: category || 'General'
        });

        res.status(201).json({ success: true, data: feedback });
    } catch (error) {
        logger.error(`Error in submitFeedback: ${error.message}`);
        res.status(400).json({ success: false, error: error.message });
    }
};
