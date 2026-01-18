/**
 * Event Subscribers
 * Subscribe to events from other services
 */

const logger = require('../utils/logger');

// Placeholder for event subscriptions
// Add subscriptions as needed when other services publish events

const setupSubscribers = async () => {
    logger.info('Healthcare event subscribers ready');
    // Example: Subscribe to user events from auth service
    // await subscribeToEvent('user.updated', handleUserUpdated);
};

module.exports = { setupSubscribers };
