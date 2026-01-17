/**
 * Redis Configuration
 * Used for caching, session storage, and rate limiting
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
    try {
        redisClient = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            db: process.env.REDIS_DB || 0,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true
        });

        await redisClient.connect();

        redisClient.on('error', (err) => {
            logger.error('Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            logger.info('Redis Client Connected');
        });

        return redisClient;
    } catch (error) {
        logger.error(`Redis Connection Error: ${error.message}`);
        // Don't throw - allow app to work without Redis in development
        return null;
    }
};

const getRedisClient = () => redisClient;

const disconnectRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        logger.info('Redis Disconnected');
    }
};

module.exports = { connectRedis, getRedisClient, disconnectRedis };
