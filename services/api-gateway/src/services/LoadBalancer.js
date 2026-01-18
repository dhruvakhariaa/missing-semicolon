/**
 * Load Balancer - Distribute requests across service instances
 */

class LoadBalancer {
    constructor() {
        this.currentIndex = 0;
    }

    getNextInstance(instances) {
        if (!instances || instances.length === 0) return null;
        const instance = instances[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % instances.length;
        return instance;
    }
}

module.exports = LoadBalancer;
