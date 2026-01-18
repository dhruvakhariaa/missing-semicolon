/**
 * Proxy Routes - Forward requests to microservices
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Placeholder for proxy routes - will route to microservices
router.use('/healthcare', authenticate, (req, res) => {
    res.json({ success: true, message: 'Healthcare service proxy - coming soon' });
});

router.use('/agriculture', authenticate, (req, res) => {
    res.json({ success: true, message: 'Agriculture service proxy - coming soon' });
});

router.use('/urban', authenticate, (req, res) => {
    res.json({ success: true, message: 'Urban service proxy - coming soon' });
});

module.exports = router;
