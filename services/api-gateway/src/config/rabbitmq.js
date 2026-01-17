/**
 * RabbitMQ Configuration
 * Used for asynchronous inter-service communication
 */

const amqp = require('amqplib');
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

        logger.info('RabbitMQ Connected');

        // Handle connection close
        connection.on('close', () => {
            logger.warn('RabbitMQ connection closed');
        });

        connection.on('error', (err) => {
            logger.error('RabbitMQ connection error:', err);
        });

        return { connection, channel };
    } catch (error) {
        logger.error(`RabbitMQ Connection Error: ${error.message}`);
        // Don't throw - allow app to work without RabbitMQ in development
        return null;
    }
};

const getChannel = () => channel;
const getConnection = () => connection;

const publishEvent = async (routingKey, message) => {
    if (!channel) {
        logger.warn('RabbitMQ channel not available, skipping event publish');
        return false;
    }

    try {
        const exchange = process.env.RABBITMQ_EXCHANGE || 'sdp.events';
        const messageBuffer = Buffer.from(JSON.stringify(message));

        channel.publish(exchange, routingKey, messageBuffer, {
            persistent: true,
            timestamp: Date.now(),
            messageId: require('uuid').v4()
        });

        logger.debug(`Event published: ${routingKey}`);
        return true;
    } catch (error) {
        logger.error(`Failed to publish event: ${error.message}`);
        return false;
    }
};

const subscribeToEvent = async (routingKey, handler) => {
    if (!channel) {
        logger.warn('RabbitMQ channel not available');
        return;
    }

    const exchange = process.env.RABBITMQ_EXCHANGE || 'sdp.events';
    const queueName = `${process.env.RABBITMQ_QUEUE_PREFIX || 'sdp'}.${routingKey}`;

    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchange, routingKey);

    channel.consume(queueName, async (msg) => {
        if (msg) {
            try {
                const content = JSON.parse(msg.content.toString());
                await handler(content);
                channel.ack(msg);
            } catch (error) {
                logger.error(`Error processing message: ${error.message}`);
                channel.nack(msg, false, false);
            }
        }
    });

    logger.info(`Subscribed to: ${routingKey}`);
};

const disconnectRabbitMQ = async () => {
    if (channel) await channel.close();
    if (connection) await connection.close();
    logger.info('RabbitMQ Disconnected');
};

module.exports = {
    connectRabbitMQ,
    getChannel,
    getConnection,
    publishEvent,
    subscribeToEvent,
    disconnectRabbitMQ
};
