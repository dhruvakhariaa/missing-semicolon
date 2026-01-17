/**
 * Redis Configuration for Healthcare Service
 * Used for caching appointment slots
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
            logger.info('Healthcare Redis Connected');
        });

        return redisClient;
    } catch (error) {
        logger.error(`Redis Connection Error: ${error.message}`);
        // Don't throw - allow app to work without Redis
        return null;
    }
};

const getRedisClient = () => redisClient;

// Cache helpers
const setCache = async (key, value, ttl = 300) => {
    if (!redisClient) return false;
    try {
        await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
        return true;
    } catch (error) {
        logger.error('Redis Set Error:', error);
        return false;
    }
};

const getCache = async (key) => {
    if (!redisClient) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        logger.error('Redis Get Error:', error);
        return null;
    }
};

const deleteCache = async (key) => {
    if (!redisClient) return false;
    try {
        await redisClient.del(key);
        return true;
    } catch (error) {
        logger.error('Redis Delete Error:', error);
        return false;
    }
};

module.exports = {
    connectRedis,
    getRedisClient,
    setCache,
    getCache,
    deleteCache
};
