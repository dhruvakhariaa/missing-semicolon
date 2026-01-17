const express = require('express');
const router = express.Router();

const {
    getComplaints,
    createComplaint,
    getComplaintById,
    updateComplaint,
    getComplaintMetrics
} = require('../controllers/complaintController');

const {
    getServiceRequests,
    createServiceRequest,
    getServiceRequestMetrics
} = require('../controllers/serviceRequestController');

const {
    getNotifications,
    getNotificationMetrics
} = require('../controllers/notificationController');

// Complaint Routes
router.get('/complaints/metrics', getComplaintMetrics); // Must be before /:id
router.route('/complaints')
    .get(getComplaints)
    .post(createComplaint);

router.route('/complaints/:id')
    .get(getComplaintById)
    .put(updateComplaint);

// Service Request Routes
router.get('/service-requests/metrics', getServiceRequestMetrics);
router.route('/service-requests')
    .get(getServiceRequests)
    .post(createServiceRequest);

// Notification Routes
router.get('/notifications/metrics', getNotificationMetrics);
router.route('/notifications')
    .get(getNotifications);

// Health Check
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'urban-service' });
});

module.exports = router;
