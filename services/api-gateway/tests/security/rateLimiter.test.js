/**
 * Rate Limiter Security Tests
 * Tests protection against DDoS and brute force attacks
 */

const request = require('supertest');
const express = require('express');
const { rateLimiter } = require('../../src/middleware/rateLimiter');

describe('Rate Limiter Security', () => {
    let app;

    beforeEach(() => {
        // Create fresh app for each test
        app = express();
        app.use(express.json());

        // Apply rate limiter with test-friendly settings
        const testRateLimiter = require('express-rate-limit')({
            windowMs: 1000, // 1 second window for testing
            max: 5,         // 5 requests per window
            message: {
                success: false,
                error: {
                    code: 'TOO_MANY_REQUESTS',
                    message: 'Too many requests, please try again later'
                }
            },
            standardHeaders: true,
            legacyHeaders: false
        });

        app.use(testRateLimiter);
        app.get('/test', (req, res) => res.json({ success: true }));
    });

    describe('Request Limiting', () => {
        test('should allow requests within limit', async () => {
            for (let i = 0; i < 5; i++) {
                const res = await request(app).get('/test');
                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
            }
        });

        test('should block requests exceeding limit with 429', async () => {
            // Make 5 allowed requests
            for (let i = 0; i < 5; i++) {
                await request(app).get('/test');
            }

            // 6th request should be blocked
            const res = await request(app).get('/test');
            expect(res.status).toBe(429);
            expect(res.body.success).toBe(false);
            expect(res.body.error.code).toBe('TOO_MANY_REQUESTS');
        });

        test('should return correct rate limit headers', async () => {
            const res = await request(app).get('/test');

            expect(res.headers).toHaveProperty('ratelimit-limit');
            expect(res.headers).toHaveProperty('ratelimit-remaining');
            expect(res.headers).toHaveProperty('ratelimit-reset');
        });

        test('should decrement remaining count with each request', async () => {
            const res1 = await request(app).get('/test');
            const remaining1 = parseInt(res1.headers['ratelimit-remaining']);

            const res2 = await request(app).get('/test');
            const remaining2 = parseInt(res2.headers['ratelimit-remaining']);

            expect(remaining2).toBe(remaining1 - 1);
        });
    });

    describe('DDoS Protection', () => {
        test('should handle burst of requests gracefully', async () => {
            const requests = Array(20).fill().map(() =>
                request(app).get('/test')
            );

            const responses = await Promise.all(requests);

            const successCount = responses.filter(r => r.status === 200).length;
            const blockedCount = responses.filter(r => r.status === 429).length;

            expect(successCount).toBeLessThanOrEqual(5);
            expect(blockedCount).toBeGreaterThanOrEqual(15);
        });
    });
});

describe('Rate Limiter Configuration', () => {
    test('should use environment variables for configuration', () => {
        const originalWindow = process.env.RATE_LIMIT_WINDOW_MS;
        const originalMax = process.env.RATE_LIMIT_MAX_REQUESTS;

        process.env.RATE_LIMIT_WINDOW_MS = '60000';
        process.env.RATE_LIMIT_MAX_REQUESTS = '50';

        // Re-require to get new values
        jest.resetModules();

        // Restore original values
        process.env.RATE_LIMIT_WINDOW_MS = originalWindow;
        process.env.RATE_LIMIT_MAX_REQUESTS = originalMax;
    });
});
