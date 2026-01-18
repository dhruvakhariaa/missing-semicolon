/**
 * Service Registry - Manages registered microservices
 */

const logger = require('../utils/logger');

// In-memory service registry (production would use Redis/etcd)
const services = new Map();

const ServiceRegistry = {
    async initialize() {
        logger.info('ServiceRegistry initialized');
        return true;
    },

    async register(service) {
        const { name, host, port, version = '1.0.0' } = service;
        services.set(name, {
            name,
            host,
            port,
            version,
            registeredAt: new Date(),
            lastHeartbeat: new Date(),
            status: 'healthy'
        });
        logger.info(`Service registered: ${name} at ${host}:${port}`);
    },

    async deregister(name) {
        if (services.has(name)) {
            services.delete(name);
            logger.info(`Service deregistered: ${name}`);
        }
    },

    async getService(name) {
        return services.get(name);
    },

    async getAllServices() {
        return Array.from(services.values());
    },

    async updateHeartbeat(name) {
        const service = services.get(name);
        if (service) {
            service.lastHeartbeat = new Date();
            service.status = 'healthy';
        }
    },

    async markUnhealthy(name) {
        const service = services.get(name);
        if (service) {
            service.status = 'unhealthy';
        }
    }
};

module.exports = ServiceRegistry;
