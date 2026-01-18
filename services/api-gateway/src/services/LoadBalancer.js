/**
 * Load Balancer - Distributes requests across service instances
 */

const logger = require('../utils/logger');

const LoadBalancer = {
    roundRobinIndex: {},

    // Round-robin load balancing
    getNextInstance(serviceName, instances) {
        if (!instances || instances.length === 0) {
            return null;
        }

        if (!this.roundRobinIndex[serviceName]) {
            this.roundRobinIndex[serviceName] = 0;
        }

        const instance = instances[this.roundRobinIndex[serviceName]];
        this.roundRobinIndex[serviceName] = (this.roundRobinIndex[serviceName] + 1) % instances.length;

        return instance;
    },

    // Get all healthy instances
    getHealthyInstances(instances) {
        return instances.filter(i => i.status === 'healthy');
    }
};

module.exports = LoadBalancer;
