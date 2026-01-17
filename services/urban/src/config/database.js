const mongoose = require('mongoose');
const logger = require('../utils/logger');
let mongoServer;

const connectDB = async () => {
    try {
        if (process.env.NODE_ENV === 'test' || process.env.USE_MEMORY_DB === 'true' || true) { // Forcing true for this demo based on user request
            const { MongoMemoryServer } = require('mongodb-memory-server');
            mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();

            logger.info(`Starting In-Memory MongoDB at ${uri}`);

            await mongoose.connect(uri);
            logger.info(`MongoDB Connected: ${mongoose.connection.host} (In-Memory)`);
        } else {
            const conn = await mongoose.connect(process.env.MONGODB_URI);
            logger.info(`MongoDB Connected: ${conn.connection.host}`);
        }
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
