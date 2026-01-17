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
        // Get original complaint to check status change
        const originalComplaint = await Complaint.findById(req.params.id);
        if (!originalComplaint) {
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }

        // Build update object
        const updateData = { ...req.body };

        // If status is changing, add to history
        if (req.body.status && req.body.status !== originalComplaint.status) {
            const historyEntry = {
                status: req.body.status,
                timestamp: new Date(),
                note: getStatusNote(req.body.status)
            };

            // Push to history array
            updateData.$push = { history: historyEntry };
            delete updateData.status; // Remove status from $set

            // Use findByIdAndUpdate with both $set and $push
            const complaint = await Complaint.findByIdAndUpdate(
                req.params.id,
                {
                    $set: { status: req.body.status, ...req.body },
                    $push: { history: historyEntry }
                },
                { new: true, runValidators: true }
            );

            // Create notification
            let notificationMessage = '';
            let notificationType = 'Info';

            switch (req.body.status) {
                case 'In Progress':
                    notificationMessage = `Your complaint "${complaint.title}" is now being processed.`;
                    notificationType = 'Info';
                    break;
                case 'Resolved':
                    notificationMessage = `Good news! Your complaint "${complaint.title}" has been resolved.`;
                    notificationType = 'Success';
                    break;
                case 'Rejected':
                    notificationMessage = `Your complaint "${complaint.title}" was rejected.`;
                    notificationType = 'Warning';
                    break;
                case 'Pending':
                    notificationMessage = `Your complaint "${complaint.title}" has been reopened.`;
                    notificationType = 'Info';
                    break;
            }

            if (notificationMessage) {
                await Notification.create({
                    userId: complaint.citizenId,
                    message: notificationMessage,
                    type: notificationType
                });
            }

            return res.status(200).json({ success: true, data: complaint });
        }

        // If no status change, just update normally
        const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: complaint });
    } catch (error) {
        logger.error(`Error in updateComplaint: ${error.message}`);
        res.status(400).json({ success: false, error: error.message });
    }
};

// Helper function to get status notes
function getStatusNote(status) {
    switch (status) {
        case 'In Progress': return 'Work has started on this complaint';
        case 'Resolved': return 'Complaint has been resolved';
        case 'Rejected': return 'Complaint was rejected';
        case 'Pending': return 'Complaint reopened';
        default: return 'Status updated';
    }
}
