/**
 * Health Check Route
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { sendResponse } = require('../utils/helpers');
const { getRedisClient } = require('../config/redis');
const { getChannel } = require('../config/rabbitmq');

router.get('/', async (req, res) => {
    const health = {
        status: 'healthy',
        service: 'healthcare',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        instanceId: process.env.INSTANCE_ID || '1'
    };

    // Check MongoDB
    try {
        health.mongodb = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    } catch (e) {
        health.mongodb = 'error';
    }

    // Check Redis
    try {
        const redis = getRedisClient();
        health.redis = redis ? 'connected' : 'not configured';
    } catch (e) {
        health.redis = 'error';
    }

    // Check RabbitMQ
    try {
        const channel = getChannel();
        health.rabbitmq = channel ? 'connected' : 'not configured';
    } catch (e) {
        health.rabbitmq = 'error';
    }

    // Determine overall status
    if (health.mongodb !== 'connected') {
        health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    return sendResponse(res, statusCode, health.status === 'healthy', health);
});

module.exports = router;
