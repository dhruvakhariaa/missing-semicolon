/**
 * Healthcare Microservice - Main Entry Point
 * 
 * Responsibilities:
 * - Patient registration and profile management
 * - Appointment scheduling with availability checking
 * - Doctor/department assignment based on specialization
 * - Medical history storage
 * - Appointment reminders and notifications (via events)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');

// Config
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { connectRabbitMQ } = require('./config/rabbitmq');

// Middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Routes
const routes = require('./routes');

// Utils
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;
const SERVICE_NAME = process.env.SERVICE_NAME || 'healthcare';
const INSTANCE_ID = process.env.INSTANCE_ID || '1';

// ===========================================
// Middleware Configuration
// ===========================================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) }
}));

// Add request ID and service info
app.use((req, res, next) => {
    req.requestId = req.headers['x-request-id'] || require('uuid').v4();
    req.serviceName = SERVICE_NAME;
    req.instanceId = INSTANCE_ID;
    res.setHeader('X-Service', SERVICE_NAME);
    res.setHeader('X-Instance', INSTANCE_ID);
    next();
});

// ===========================================
// Routes
// ===========================================

// Mount all routes under /api/healthcare
app.use('/api/healthcare', routes);

// AI Disease Prediction routes
const predictionRoutes = require('./routes/prediction');
app.use('/api/healthcare/ai', predictionRoutes);

// Root health check
app.get('/', (req, res) => {
    res.json({
        service: SERVICE_NAME,
        instance: INSTANCE_ID,
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// ===========================================
// Error Handling
// ===========================================

app.use(notFoundHandler);
app.use(errorHandler);

// ===========================================
// Service Registration
// ===========================================

const registerWithGateway = async () => {
    const gatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3000';

    try {
        await axios.post(`${gatewayUrl}/api/registry/register`, {
            name: SERVICE_NAME,
            url: `http://${SERVICE_NAME}-service:${PORT}`,
            port: PORT,
            instanceId: INSTANCE_ID,
            healthEndpoint: '/api/healthcare/health'
        });
        logger.info('Registered with API Gateway');
    } catch (error) {
        logger.warn('Could not register with API Gateway:', error.message);
        // Continue running even if gateway registration fails
    }
};

// ===========================================
// Application Startup
// ===========================================

async function startServer() {
    try {
        // Connect to MongoDB
        await connectDB();
        logger.info('Connected to MongoDB');

        // Connect to Redis (optional - app works without it)
        await connectRedis();
        logger.info('Redis connection attempted');

        // Connect to RabbitMQ (optional - app works without it)
        await connectRabbitMQ();
        logger.info('RabbitMQ connection attempted');

        // Start server
        app.listen(PORT, async () => {
            logger.info(`Healthcare Service running on port ${PORT}`);
            logger.info(`Instance ID: ${INSTANCE_ID}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

            // Register with gateway after startup
            setTimeout(registerWithGateway, 2000);
        });

    } catch (error) {
        logger.error('Failed to start Healthcare Service:', error);
        process.exit(1);
    }
}

// ===========================================
// Graceful Shutdown
// ===========================================

process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();

module.exports = app;
