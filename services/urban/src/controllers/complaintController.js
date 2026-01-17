const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// @desc    Get complaint metrics
// @route   GET /api/urban/complaints/metrics
// @access  Public
exports.getComplaintMetrics = async (req, res) => {
    try {
        const total = await Complaint.countDocuments();
        const resolved = await Complaint.countDocuments({ status: 'Resolved' });

        // Mocking average resolution time (random between 12h and 36h for demo)
        const avgResolutionTime = Math.floor(Math.random() * (36 - 12 + 1) + 12) + 'h';

        const categoryStats = await Complaint.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const formattedCategories = categoryStats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                total,
                resolved,
                avgResolutionTime,
                byCategory: formattedCategories
            }
        });
    } catch (error) {
        logger.error(`Error in getComplaintMetrics: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all complaints
// @route   GET /api/urban/complaints
// @access  Public (for demo)
exports.getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: complaints.length, data: complaints });
    } catch (error) {
        logger.error(`Error in getComplaints: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single complaint
// @route   GET /api/urban/complaints/:id
// @access  Public
exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }
        res.status(200).json({ success: true, data: complaint });
    } catch (error) {
        logger.error(`Error in getComplaintById: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create new complaint
// @route   POST /api/urban/complaints
// @access  Public
exports.createComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.create(req.body);

        // Mock sending notification
        // In real app, this would be via RabbitMQ or Notification Service
        await Notification.create({
            userId: complaint.citizenId,
            message: `Complaint received: ${complaint.title}`,
            type: 'Info'
        });

        res.status(201).json({ success: true, data: complaint });
    } catch (error) {
        logger.error(`Error in createComplaint: ${error.message}`);
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update complaint status
// @route   PUT /api/urban/complaints/:id
// @access  Public
exports.updateComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!complaint) {
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }

        res.status(200).json({ success: true, data: complaint });
    } catch (error) {
        logger.error(`Error in updateComplaint: ${error.message}`);
        res.status(400).json({ success: false, error: error.message });
    }
};
