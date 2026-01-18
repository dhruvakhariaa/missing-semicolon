/**
 * Proxy Routes - Routes requests to microservices
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../utils/logger');

// Service endpoints (configured via environment or defaults)
const SERVICES = {
    urban: process.env.URBAN_SERVICE_URL || 'http://urban-service:5003',
    healthcare: process.env.HEALTHCARE_SERVICE_URL || 'http://healthcare-service:3001',
    agriculture: process.env.AGRICULTURE_SERVICE_URL || 'http://agriculture-service:3002'
};

// Generic proxy handler
const proxyRequest = async (req, res, serviceName, subPath) => {
    const serviceUrl = SERVICES[serviceName];
    if (!serviceUrl) {
        return res.status(404).json({ success: false, error: `Service ${serviceName} not found` });
    }

    // Build target URL: baseUrl + /api/{service} + subPath
    const targetUrl = `${serviceUrl}/api/${serviceName}${subPath}`;

    logger.info(`Proxying ${req.method} to: ${targetUrl}`);

    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.body,
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && { Authorization: req.headers.authorization })
            },
            timeout: 30000
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error(`Proxy error to ${serviceName}: ${error.message}`);

        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(503).json({
                success: false,
                error: `Service ${serviceName} is unavailable`
            });
        }
    }
};

// Urban Service Routes
router.all('/urban', (req, res) => proxyRequest(req, res, 'urban', ''));
router.all('/urban/*', (req, res) => proxyRequest(req, res, 'urban', '/' + req.params[0]));

// Healthcare Service Routes  
router.all('/healthcare', (req, res) => proxyRequest(req, res, 'healthcare', ''));
router.all('/healthcare/*', (req, res) => proxyRequest(req, res, 'healthcare', '/' + req.params[0]));

// Agriculture Service Routes
router.all('/agriculture', (req, res) => proxyRequest(req, res, 'agriculture', ''));
router.all('/agriculture/*', (req, res) => proxyRequest(req, res, 'agriculture', '/' + req.params[0]));

module.exports = router;
