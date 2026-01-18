/**
 * Health Check Routes
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API Gateway is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

router.get('/ready', (req, res) => {
    res.json({ status: 'ready' });
});

router.get('/live', (req, res) => {
    res.json({ status: 'live' });
});

module.exports = router;
