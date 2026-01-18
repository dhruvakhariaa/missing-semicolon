/**
 * Security Headers Tests
 * Tests protection against XSS, clickjacking, MIME sniffing, etc.
 */

const request = require('supertest');
const express = require('express');
const { securityHeaders } = require('../../src/middleware/securityHeaders');

describe('Security Headers', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(securityHeaders);
        app.get('/test', (req, res) => res.json({ success: true }));
        app.get('/api/auth/test', (req, res) => res.json({ success: true }));
    });

    describe('Clickjacking Protection', () => {
        test('should set X-Frame-Options to DENY', async () => {
            const res = await request(app).get('/test');
            expect(res.headers['x-frame-options']).toBe('DENY');
        });

        test('should prevent embedding in iframes', async () => {
            const res = await request(app).get('/test');
            // DENY means this page cannot be embedded in any iframe
            expect(res.headers['x-frame-options']).not.toBe('SAMEORIGIN');
            expect(res.headers['x-frame-options']).not.toBe('ALLOW-FROM');
        });
    });

    describe('MIME Type Sniffing Protection', () => {
        test('should set X-Content-Type-Options to nosniff', async () => {
            const res = await request(app).get('/test');
            expect(res.headers['x-content-type-options']).toBe('nosniff');
        });
    });

    describe('XSS Protection', () => {
        test('should set X-XSS-Protection header', async () => {
            const res = await request(app).get('/test');
            expect(res.headers['x-xss-protection']).toBe('1; mode=block');
        });
    });

    describe('HTTPS Enforcement (HSTS)', () => {
        test('should set Strict-Transport-Security header', async () => {
            const res = await request(app).get('/test');
            expect(res.headers['strict-transport-security']).toBeDefined();
        });

        test('should set max-age to 1 year', async () => {
            const res = await request(app).get('/test');
            expect(res.headers['strict-transport-security']).toContain('max-age=31536000');
        });

        test('should include subdomains', async () => {
            const res = await request(app).get('/test');
            expect(res.headers['strict-transport-security']).toContain('includeSubDomains');
        });
    });

    describe('Content Security Policy', () => {
        test('should set Content-Security-Policy header', async () => {
            const res = await request(app).get('/test');
            expect(res.headers['content-security-policy']).toBeDefined();
        });

        test('should set default-src to self', async () => {
            const res = await request(app).get('/test');
            expect(res.headers['content-security-policy']).toContain("default-src 'self'");
        });

        test('should restrict script sources', async () => {
            const res = await request(app).get('/test');
            expect(res.headers['content-security-policy']).toContain('script-src');
        });
    });

    describe('Referrer Policy', () => {
        test('should set Referrer-Policy header', async () => {
            const res = await request(app).get('/test');
            expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
        });
    });

    describe('Feature Policy / Permissions Policy', () => {
        test('should set Permissions-Policy header', async () => {
            const res = await request(app).get('/test');
            expect(res.headers['permissions-policy']).toBeDefined();
        });

        test('should disable geolocation', async () => {
            const res = await request(app).get('/test');
            expect(res.headers['permissions-policy']).toContain('geolocation=()');
        });

        test('should disable microphone', async () => {
            const res = await request(app).get('/test');
            expect(res.headers['permissions-policy']).toContain('microphone=()');
        });

        test('should disable camera', async () => {
            const res = await request(app).get('/test');
            expect(res.headers['permissions-policy']).toContain('camera=()');
        });
    });

    describe('Auth Endpoints Caching', () => {
        test('should disable caching for auth endpoints', async () => {
            const res = await request(app).get('/api/auth/test');

            expect(res.headers['cache-control']).toContain('no-store');
            expect(res.headers['cache-control']).toContain('no-cache');
            expect(res.headers['pragma']).toBe('no-cache');
            expect(res.headers['expires']).toBe('0');
        });

        test('should allow caching for non-auth endpoints', async () => {
            const res = await request(app).get('/test');

            // These headers should NOT be set for non-auth endpoints
            expect(res.headers['cache-control']).toBeUndefined();
        });
    });

    describe('Header Completeness', () => {
        test('should have all required security headers', async () => {
            const res = await request(app).get('/test');

            const requiredHeaders = [
                'x-frame-options',
                'x-content-type-options',
                'x-xss-protection',
                'strict-transport-security',
                'content-security-policy',
                'referrer-policy',
                'permissions-policy'
            ];

            requiredHeaders.forEach(header => {
                expect(res.headers[header]).toBeDefined();
            });
        });
    });
});
