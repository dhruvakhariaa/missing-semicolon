const ServiceRequest = require('../models/ServiceRequest');
const logger = require('../utils/logger');

// @desc    Get service request metrics
// @route   GET /api/urban/service-requests/metrics
// @access  Public
exports.getServiceRequestMetrics = async (req, res) => {
    try {
        const total = await ServiceRequest.countDocuments();
        const completed = await ServiceRequest.countDocuments({ status: 'Completed' });
        const pending = await ServiceRequest.countDocuments({ status: 'Pending' });

        res.status(200).json({
            success: true,
            data: {
                total,
                completed,
                pending
            }
        });
    } catch (error) {
        logger.error(`Error in getServiceRequestMetrics: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all service requests
// @route   GET /api/urban/service-requests
// @access  Public
exports.getServiceRequests = async (req, res) => {
    try {
        const requests = await ServiceRequest.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        logger.error(`Error in getServiceRequests: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create service request
// @route   POST /api/urban/service-requests
// @access  Public
exports.createServiceRequest = async (req, res) => {
    try {
        const request = await ServiceRequest.create(req.body);
        res.status(201).json({ success: true, data: request });
    } catch (error) {
        logger.error(`Error in createServiceRequest: ${error.message}`);
        res.status(400).json({ success: false, error: error.message });
    }
};
