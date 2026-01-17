/**
 * RabbitMQ Configuration for Healthcare Service
 * Used for publishing appointment and patient events
 */

const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

        connection = await amqp.connect(rabbitUrl);
        channel = await connection.createChannel();

        // Setup exchange for event-driven architecture
        const exchange = process.env.RABBITMQ_EXCHANGE || 'sdp.events';
        await channel.assertExchange(exchange, 'topic', { durable: true });

        logger.info('Healthcare RabbitMQ Connected');

        connection.on('close', () => {
            logger.warn('RabbitMQ connection closed');
        });

        connection.on('error', (err) => {
            logger.error('RabbitMQ connection error:', err);
        });

        return { connection, channel };
    } catch (error) {
        logger.error(`RabbitMQ Connection Error: ${error.message}`);
        return null;
    }
};

const getChannel = () => channel;

const publishEvent = async (routingKey, message) => {
    if (!channel) {
        logger.warn('RabbitMQ channel not available, skipping event publish');
        return false;
    }

    try {
        const exchange = process.env.RABBITMQ_EXCHANGE || 'sdp.events';
        const eventPayload = {
            eventId: uuidv4(),
            service: 'healthcare',
            timestamp: new Date().toISOString(),
            ...message
        };

        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(eventPayload)), {
            persistent: true,
            timestamp: Date.now(),
            messageId: eventPayload.eventId
        });

        logger.debug(`Event published: ${routingKey}`, { eventId: eventPayload.eventId });
        return true;
    } catch (error) {
        logger.error(`Failed to publish event: ${error.message}`);
        return false;
    }
};

module.exports = {
    connectRabbitMQ,
    getChannel,
    publishEvent
};
