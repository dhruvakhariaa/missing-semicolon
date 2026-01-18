/**
 * Registry Routes - Service registration management
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        success: true,
        data: { services: [], message: 'Service registry' }
    });
});

module.exports = router;
