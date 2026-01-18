/**
 * Health Routes - API Gateway health check
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            service: 'api-gateway',
            timestamp: new Date().toISOString()
        }
    });
});

module.exports = router;
