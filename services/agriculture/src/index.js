const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const routes = require('./routes');
const { createLogger, transports, format } = require('winston');

dotenv.config();

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
const PORT = process.env.PORT || 3002; // Agriculture service typically on 3002

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

app.listen(PORT, () => {
  logger.info(`Agriculture Service running on port ${PORT}`);
  console.log(`Agriculture Service running on port ${PORT}`);
});
