/**
 * Service Registry - Track registered microservices
 */

class ServiceRegistry {
    constructor() {
        this.services = new Map();
    }

    static async initialize() {
        return new ServiceRegistry();
    }

    register(name, url) {
        this.services.set(name, { url, lastHeartbeat: Date.now() });
    }

    get(name) {
        return this.services.get(name);
    }

    getAll() {
        return Array.from(this.services.entries());
    }
}

module.exports = ServiceRegistry;
