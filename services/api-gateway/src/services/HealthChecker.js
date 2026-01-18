/**
 * Health Checker - Monitors service health
 */

const logger = require('../utils/logger');
const ServiceRegistry = require('./ServiceRegistry');
const axios = require('axios');

let healthCheckInterval = null;
const CHECK_INTERVAL = 30000; // 30 seconds

const HealthChecker = {
    start() {
        logger.info('HealthChecker started');

        healthCheckInterval = setInterval(async () => {
            const services = await ServiceRegistry.getAllServices();

            for (const service of services) {
                try {
                    await axios.get(`http://${service.host}:${service.port}/api/${service.name}/health`, {
                        timeout: 5000
                    });
                    await ServiceRegistry.updateHeartbeat(service.name);
                } catch (error) {
                    logger.warn(`Health check failed for ${service.name}: ${error.message}`);
                    await ServiceRegistry.markUnhealthy(service.name);
                }
            }
        }, CHECK_INTERVAL);
    },

    stop() {
        if (healthCheckInterval) {
            clearInterval(healthCheckInterval);
            healthCheckInterval = null;
            logger.info('HealthChecker stopped');
        }
    }
};

module.exports = HealthChecker;
