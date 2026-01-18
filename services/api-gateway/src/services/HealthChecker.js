/**
 * Health Checker - Monitor service health
 */

const logger = require('../utils/logger');

class HealthChecker {
    static interval = null;

    static start() {
        logger.info('Health Checker started');
        // Placeholder - would periodically check service health
    }

    static stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        logger.info('Health Checker stopped');
    }
}

module.exports = HealthChecker;
