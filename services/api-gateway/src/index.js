/**
 * API Gateway - Main Entry Point
 * 
 * Responsibilities:
 * - Single entry point for all client requests
 * - Authentication and authorization enforcement
 * - Rate limiting to prevent abuse
 * - Request routing to appropriate microservices
 * - Load balancing across multiple service instances
 * - Service discovery and health monitoring
 * - Request/response logging for audit trails
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Core modules
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { connectRabbitMQ } = require('./config/rabbitmq');
const logger = require('./utils/logger');

// Middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');
const { requestLogger } = require('./middleware/requestLogger');

// Routes
const authRoutes = require('./routes/auth');
const proxyRoutes = require('./routes/proxy');
const registryRoutes = require('./routes/registry');
const healthRoutes = require('./routes/health');
const uploadRoutes = require('./routes/upload');
const requestRoutes = require('./routes/requests');

// Services
const ServiceRegistry = require('./services/ServiceRegistry');
const LoadBalancer = require('./services/LoadBalancer');
const HealthChecker = require('./services/HealthChecker');

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// Middleware Configuration
// ===========================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// ===========================================
// Routes
// ===========================================

// Health check endpoint (no auth required)
app.use('/health', healthRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// Service registry management
app.use('/api/registry', registryRoutes);

// File upload (presigned URLs)
app.use('/api/upload', uploadRoutes);

// Pending requests (Sector Manager -> Gov Official workflow)
app.use('/api/requests', requestRoutes);

// Proxy all service requests
app.use('/api', proxyRoutes);

// ===========================================
// Error Handling
// ===========================================

app.use(notFoundHandler);
app.use(errorHandler);

// ===========================================
// Application Startup
// ===========================================

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('Connected to MongoDB');

    // Connect to Redis
    await connectRedis();
    logger.info('Connected to Redis');

    // Connect to RabbitMQ
    await connectRabbitMQ();
    logger.info('Connected to RabbitMQ');

    // Initialize service registry
    await ServiceRegistry.initialize();
    logger.info('Service Registry initialized');

    // Start health checker
    HealthChecker.start();
    logger.info('Health Checker started');

    // Start server
    app.listen(PORT, () => {
      logger.info(`API Gateway running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    logger.error('Failed to start API Gateway:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  HealthChecker.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  HealthChecker.stop();
  process.exit(0);
});

startServer();

module.exports = app;
