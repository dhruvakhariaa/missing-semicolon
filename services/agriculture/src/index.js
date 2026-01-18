const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config(); // Must be loaded before routes/imports that use env vars

const connectDB = require('./config/database');
const routes = require('./routes');
const { createLogger, transports, format } = require('winston');

// Logger setup
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 3002;
const SERVICE_NAME = process.env.SERVICE_NAME || 'agriculture';
const INSTANCE_ID = process.env.INSTANCE_ID || '1';

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api/agriculture', routes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Agriculture Service' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
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
      healthEndpoint: '/api/agriculture/health'
    });
    logger.info('Registered with API Gateway');
  } catch (error) {
    logger.warn('Could not register with API Gateway: ' + error.message);
  }
};

// ===========================================
// Start Server
// ===========================================

app.listen(PORT, () => {
  logger.info(`Agriculture Service running on port ${PORT}`);
  console.log(`Agriculture Service running on port ${PORT}`);

  // Register with gateway after startup
  setTimeout(registerWithGateway, 2000);
});
