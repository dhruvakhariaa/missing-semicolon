const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const axios = require('axios');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const apiRoutes = require('./routes/api');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3003;
const SERVICE_NAME = process.env.SERVICE_NAME || 'urban';
const INSTANCE_ID = process.env.INSTANCE_ID || '1';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Routes
app.use('/api/urban', apiRoutes);

// Health Check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'Urban Service' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ success: false, error: 'Server Error' });
});

// ===========================================
// Service Registration with API Gateway
// ===========================================

const registerWithGateway = async () => {
    const gatewayUrl = process.env.API_GATEWAY_URL || 'http://api-gateway:8000';

    try {
        await axios.post(`${gatewayUrl}/api/registry/register`, {
            name: SERVICE_NAME,
            url: `http://${SERVICE_NAME}-service:${PORT}`,
            port: PORT,
            instanceId: INSTANCE_ID,
            healthEndpoint: '/api/urban/health'
        });
        logger.info('Registered with API Gateway');
    } catch (error) {
        logger.warn('Could not register with API Gateway:', error.message);
        // Continue running even if gateway registration fails
    }
};

// ===========================================
// Start Server
// ===========================================

const server = app.listen(PORT, () => {
    logger.info(`Urban Service running on port ${PORT}`);
    logger.info(`Instance ID: ${INSTANCE_ID}`);

    // Register with gateway after startup
    setTimeout(registerWithGateway, 2000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => process.exit(0));
});
