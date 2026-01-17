const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// @desc    Get notification metrics
// @route   GET /api/urban/notifications/metrics
// @access  Public
exports.getNotificationMetrics = async (req, res) => {
    try {
        const total = await Notification.countDocuments();
        const pending = await Notification.countDocuments({ isRead: false });

        res.status(200).json({
            success: true,
            data: {
                text: "Alerts Sent",
                value: total,
                pending: pending
            }
        });
    } catch (error) {
        logger.error(`Error in getNotificationMetrics: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get notifications for user
// @route   GET /api/urban/notifications
// @access  Public
// Note: In real app, filter by req.user.id
exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.query;
        let query = {};
        if (userId) {
            query.userId = userId;
        }

        const notifications = await Notification.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (error) {
        logger.error(`Error in getNotifications: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
