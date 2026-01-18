/**
 * Request Approval Routes - For Government Officials to manage Sector Manager requests
 */
const express = require('express');
const router = express.Router();
const PendingRequest = require('../models/PendingRequest');
const logger = require('../utils/logger');

/**
 * POST /api/requests
 * Create a pending request (Sector Manager)
 */
router.post('/', async (req, res) => {
    try {
        const { sector, action, resourceType, resourceId, payload } = req.body;

        // Validate sector manager can only request for their sector
        if (req.user.role === 'sector_manager' && req.user.assignedSector !== sector) {
            return res.status(403).json({
                success: false,
                error: 'You can only create requests for your assigned sector'
            });
        }

        const pendingRequest = new PendingRequest({
            requestedBy: req.user.id,
            sector,
            action,
            resourceType,
            resourceId: resourceId || null,
            payload
        });

        await pendingRequest.save();

        logger.info(`Pending request created: ${pendingRequest._id} by ${req.user.id}`);

        res.status(201).json({
            success: true,
            data: pendingRequest,
            message: 'Request submitted for approval'
        });
    } catch (error) {
        logger.error('Failed to create pending request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create request'
        });
    }
});

/**
 * GET /api/requests/my
 * Get my pending requests (Sector Manager)
 */
router.get('/my', async (req, res) => {
    try {
        const requests = await PendingRequest.find({ requestedBy: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, data: requests });
    } catch (error) {
        logger.error('Failed to get my requests:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch requests' });
    }
});

/**
 * GET /api/requests/pending
 * Get all pending requests (Government Official only)
 */
router.get('/pending', async (req, res) => {
    try {
        if (req.user.role !== 'government_official') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const { sector } = req.query;
        const query = { status: 'pending' };
        if (sector) query.sector = sector;

        const requests = await PendingRequest.find(query)
            .populate('requestedBy', 'fullName email')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: requests });
    } catch (error) {
        logger.error('Failed to get pending requests:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch requests' });
    }
});

/**
 * POST /api/requests/:id/approve
 * Approve a pending request (Government Official)
 */
router.post('/:id/approve', async (req, res) => {
    try {
        if (req.user.role !== 'government_official') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const request = await PendingRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, error: 'Request already processed' });
        }

        request.status = 'approved';
        request.reviewedBy = req.user.id;
        request.reviewNotes = req.body.notes || '';
        request.reviewedAt = new Date();
        await request.save();

        // TODO: Publish event to actually execute the action on the target service
        logger.info(`Request ${request._id} approved by ${req.user.id}`);

        res.json({
            success: true,
            data: request,
            message: 'Request approved'
        });
    } catch (error) {
        logger.error('Failed to approve request:', error);
        res.status(500).json({ success: false, error: 'Failed to approve request' });
    }
});

/**
 * POST /api/requests/:id/reject
 * Reject a pending request (Government Official)
 */
router.post('/:id/reject', async (req, res) => {
    try {
        if (req.user.role !== 'government_official') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const request = await PendingRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, error: 'Request already processed' });
        }

        request.status = 'rejected';
        request.reviewedBy = req.user.id;
        request.reviewNotes = req.body.notes || 'Request rejected';
        request.reviewedAt = new Date();
        await request.save();

        logger.info(`Request ${request._id} rejected by ${req.user.id}`);

        res.json({
            success: true,
            data: request,
            message: 'Request rejected'
        });
    } catch (error) {
        logger.error('Failed to reject request:', error);
        res.status(500).json({ success: false, error: 'Failed to reject request' });
    }
});

module.exports = router;
