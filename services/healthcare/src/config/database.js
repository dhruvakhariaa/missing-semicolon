/**
 * MongoDB Database Configuration for Healthcare Service
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sdp_healthcare';
    
    const conn = await mongoose.connect(mongoUri);
    
    logger.info(`Healthcare MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB Disconnected');
};

module.exports = { connectDB, disconnectDB };
