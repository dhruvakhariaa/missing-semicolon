/**
 * MongoDB Database Configuration
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        const dbName = process.env.MONGODB_DB || 'sdp_registry';

        const conn = await mongoose.connect(`${mongoUri}/${dbName}`, {
            // Mongoose 6+ no longer needs these options
        });

        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        logger.error(`MongoDB Connection Error: ${error.message}`);
        logger.warn('Continuing without MongoDB - some features may be unavailable');
        return null;
    }
};

const disconnectDB = async () => {
    await mongoose.disconnect();
    logger.info('MongoDB Disconnected');
};

module.exports = { connectDB, disconnectDB };
