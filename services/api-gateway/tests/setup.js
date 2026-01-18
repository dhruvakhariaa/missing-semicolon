/**
 * Test Setup - Global configuration for all tests
 */

require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-64bytes-for-testing-purposes-only-do-not-use-in-production';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-64bytes-for-testing-purposes-only-do-not-use-in-production';
process.env.FIELD_ENCRYPTION_KEY = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Start in-memory MongoDB before all tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;

    await mongoose.connect(mongoUri);
});

// Clear database between tests
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// Stop MongoDB after all tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Global test utilities
global.testUtils = {
    // Create a mock user object
    createMockUser: (overrides = {}) => ({
        _id: new mongoose.Types.ObjectId(),
        email: 'test@example.com',
        name: 'Test User',
        role: 'citizen',
        kycLevel: 0,
        permissions: {
            healthcare: ['read', 'book_appointment'],
            agriculture: ['read', 'request_advisory'],
            urban: ['read', 'file_complaint']
        },
        loginAttempts: 0,
        refreshTokens: [],
        ...overrides
    }),

    // Generate valid password
    validPassword: 'SecurePass@123',

    // Generate weak passwords for testing
    weakPasswords: [
        'password',          // No uppercase, number, special
        'PASSWORD123',       // No lowercase, special
        'Pass123',           // No special, too short
        'Pass@word',         // No number
        '12345678',          // No letters, special
        'Aa1!',              // Too short
    ],

    // Wait for a specific time
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

console.log('🧪 Test environment initialized');
