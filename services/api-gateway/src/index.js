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
const path = require('path');
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
const kycRoutes = require('./routes/kyc');
const securityRoutes = require('./routes/security');
const faceRoutes = require('./routes/face');

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
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(requestLogger);

// CRITICAL: Bulletproof Input Validation (OWASP Protection)
// Apply STRICT validation BEFORE rate limiting
const {
  strictInputValidation,
  blockNoSqlInjection,
  limitPayloadSize
} = require('./middleware/inputSanitizer');

// Layer 1: Payload size limit (DoS protection)
// Skip for face auth routes which need larger payloads for images
app.use((req, res, next) => {
  if (req.path.startsWith('/api/face')) {
    return next();  // Skip limit for face routes
  }
  limitPayloadSize(100000)(req, res, next);  // 100KB max for other routes
});

// Layer 2: NoSQL injection blocking
app.use(blockNoSqlInjection);

// Layer 3: Strict pattern validation (XSS, SQLi, CMDi)
// Layer 3: Strict pattern validation (XSS, SQLi, CMDi)
// Skip for face auth as base64 images might trigger false positives or be corrupted by checking
app.use((req, res, next) => {
  if (req.path.startsWith('/api/face')) {
    return next();
  }
  strictInputValidation(req, res, next);
});

// Layer 4: Rate limiting
app.use(rateLimiter);

// ===========================================
// Routes
// ===========================================

// Serve static files from public directory (CSS, JS, images)
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint (no auth required)
app.use('/health', healthRoutes);

// Serve Security Dashboard (with no-cache for development)
app.use('/security-dashboard', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
}, express.static(path.join(__dirname, '../public')));

app.get('/security-demo', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// KYC Portal - Aadhaar & PAN Verification UI
app.get('/kyc-portal', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, '../public/kyc.html'));
});

// Live Security Monitor - Split-screen attack testing
app.get('/live-monitor', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, '../public/live-monitor.html'));
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Security routes (attack alerts)
app.use('/api/security', securityRoutes);

// KYC (Aadhaar & PAN) verification routes
app.use('/api/kyc', kycRoutes);

// Service registry management
app.use('/api/registry', registryRoutes);

// Face authentication routes (3FA)
app.use('/api/face', faceRoutes);

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
    // Connect to MongoDB (optional - continues if unavailable)
    const mongoConnection = await connectDB();
    if (mongoConnection) {
      logger.info('Connected to MongoDB');
    } else {
      logger.warn('MongoDB unavailable - running in limited mode');
    }

    // Connect to Redis (optional - continues if unavailable)
    const redisConnection = await connectRedis();
    if (redisConnection) {
      logger.info('Connected to Redis');
    } else {
      logger.warn('Redis unavailable - rate limiting may use in-memory store');
    }

    // Connect to RabbitMQ (optional - continues if unavailable)
    const rabbitConnection = await connectRabbitMQ();
    if (rabbitConnection) {
      logger.info('Connected to RabbitMQ');
    } else {
      logger.warn('RabbitMQ unavailable - event publishing disabled');
    }

    // Initialize service registry (with error handling)
    try {
      await ServiceRegistry.initialize();
      logger.info('Service Registry initialized');
    } catch (err) {
      logger.warn('Service Registry initialization failed - using defaults');
    }

    // Start health checker (with error handling)
    try {
      HealthChecker.start();
      logger.info('Health Checker started');
    } catch (err) {
      logger.warn('Health Checker failed to start');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`API Gateway running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Security Dashboard: http://localhost:${PORT}/security-dashboard`);
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
