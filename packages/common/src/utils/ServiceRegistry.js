const Redis = require('ioredis');
const os = require('os');
const logger = require('./logger');

class ServiceRegistry {
    constructor(config = {}) {
        this.serviceName = config.serviceName || process.env.SERVICE_NAME;
        this.instanceId = config.instanceId || process.env.INSTANCE_ID || '1';
        this.port = config.port || process.env.PORT;
        this.host = config.host || os.hostname();

        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'redis',
            port: process.env.REDIS_PORT || 6379,
            retryStrategy: (times) => Math.min(times * 50, 2000)
        });

        this.heartbeatInterval = null;
        this.ttl = 30;
    }

    async register() {
        const key = `service:${this.serviceName}:${this.instanceId}`;
        const value = JSON.stringify({
            host: this.host,
            port: this.port,
            instanceId: this.instanceId,
            registeredAt: new Date().toISOString(),
            status: 'healthy'
        });

        try {
            await this.redis.setex(key, this.ttl, value);
            await this.redis.sadd(`services:${this.serviceName}`, this.instanceId);

            logger.info(`Service registered: ${this.serviceName}-${this.instanceId}`);

            await this.publishEvent('service.registered', {
                service: this.serviceName,
                instanceId: this.instanceId,
                host: this.host,
                port: this.port
            });

            this.startHeartbeat();
            return true;
        } catch (error) {
            logger.error('Failed to register service:', error);
            throw error;
        }
    }

    async deregister() {
        const key = `service:${this.serviceName}:${this.instanceId}`;

        try {
            await this.redis.del(key);
            await this.redis.srem(`services:${this.serviceName}`, this.instanceId);
            logger.info(`Service deregistered: ${this.serviceName}-${this.instanceId}`);
            this.stopHeartbeat();
            return true;
        } catch (error) {
            logger.error('Failed to deregister service:', error);
            throw error;
        }
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(async () => {
            const key = `service:${this.serviceName}:${this.instanceId}`;
            try {
                await this.redis.expire(key, this.ttl);
            } catch (error) {
                logger.error('Heartbeat failed:', error);
            }
        }, (this.ttl / 2) * 1000);
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    async getServiceInstances(serviceName) {
        try {
            const instanceIds = await this.redis.smembers(`services:${serviceName}`);
            const instances = [];

            for (const instanceId of instanceIds) {
                const data = await this.redis.get(`service:${serviceName}:${instanceId}`);
                if (data) instances.push(JSON.parse(data));
            }

            return instances;
        } catch (error) {
            logger.error(`Failed to get instances for ${serviceName}:`, error);
            return [];
        }
    }

    async publishEvent(eventType, data) {
        await this.redis.publish('system.events', JSON.stringify({
            type: eventType,
            data,
            timestamp: new Date().toISOString()
        }));
    }

    getHealthStatus() {
        return {
            service: this.serviceName,
            instanceId: this.instanceId,
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = ServiceRegistry;
