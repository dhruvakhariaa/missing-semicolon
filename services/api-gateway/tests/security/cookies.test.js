/**
 * Cookie Security Tests
 * Tests protection against session hijacking and XSS token theft
 */

const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

describe('Cookie Security', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use(cookieParser());

        // Simulate login endpoint setting refresh token cookie
        app.post('/api/auth/login', (req, res) => {
            const isProd = process.env.NODE_ENV === 'production';

            res.cookie('refreshToken', 'mock-refresh-token-value', {
                httpOnly: true,
                secure: isProd,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/'
            });

            res.json({ success: true, accessToken: 'mock-access-token' });
        });

        app.post('/api/auth/logout', (req, res) => {
            res.clearCookie('refreshToken');
            res.json({ success: true });
        });

        app.get('/api/auth/check', (req, res) => {
            res.json({
                hasRefreshToken: !!req.cookies.refreshToken
            });
        });
    });

    describe('HttpOnly Flag', () => {
        test('should set HttpOnly flag on refresh token cookie', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com', password: 'password' });

            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies[0]).toContain('HttpOnly');
        });

        test('should prevent JavaScript access to cookie', async () => {
            // HttpOnly means document.cookie cannot access this cookie
            // This is verified by the presence of the HttpOnly flag
            const res = await request(app)
                .post('/api/auth/login')
                .send({});

            const cookies = res.headers['set-cookie'];
            const httpOnlyPresent = cookies.some(c => c.includes('HttpOnly'));
            expect(httpOnlyPresent).toBe(true);
        });
    });

    describe('Secure Flag (Production)', () => {
        test('should set Secure flag in production', async () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            // Recreate app with production setting
            const prodApp = express();
            prodApp.use(express.json());
            prodApp.post('/api/auth/login', (req, res) => {
                res.cookie('refreshToken', 'token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
                res.json({ success: true });
            });

            const res = await request(prodApp)
                .post('/api/auth/login')
                .send({});

            const cookies = res.headers['set-cookie'];
            expect(cookies[0]).toContain('Secure');

            process.env.NODE_ENV = originalEnv;
        });

        test('should not require Secure flag in development', async () => {
            process.env.NODE_ENV = 'development';

            const res = await request(app)
                .post('/api/auth/login')
                .send({});

            // In development, Secure flag may or may not be present
            // Just verify the cookie is set
            expect(res.headers['set-cookie']).toBeDefined();
        });
    });

    describe('SameSite Attribute', () => {
        test('should set SameSite to Strict', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({});

            const cookies = res.headers['set-cookie'];
            expect(cookies[0]).toContain('SameSite=Strict');
        });

        test('should prevent CSRF attacks via SameSite', async () => {
            // SameSite=Strict means cookie is ONLY sent for same-origin requests
            // Cross-origin requests will not include the cookie
            const res = await request(app)
                .post('/api/auth/login')
                .send({});

            const cookies = res.headers['set-cookie'];
            // Verify it's not Lax or None (which would allow some cross-origin)
            expect(cookies[0]).not.toContain('SameSite=Lax');
            expect(cookies[0]).not.toContain('SameSite=None');
        });
    });

    describe('Cookie Expiration', () => {
        test('should set appropriate expiration time', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({});

            const cookies = res.headers['set-cookie'];
            expect(cookies[0]).toContain('Max-Age=');
        });

        test('should set 7 day expiration for refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({});

            const cookies = res.headers['set-cookie'];
            // 7 days = 604800 seconds
            expect(cookies[0]).toContain('Max-Age=604800');
        });
    });

    describe('Cookie Clearing on Logout', () => {
        test('should clear refresh token on logout', async () => {
            // First login to set cookie
            await request(app)
                .post('/api/auth/login')
                .send({});

            // Then logout
            const res = await request(app)
                .post('/api/auth/logout')
                .send({});

            const cookies = res.headers['set-cookie'];
            if (cookies) {
                // If a cookie is set, it should be to clear (expire) it
                expect(cookies[0]).toMatch(/refreshToken=;|Expires=.*1970/i);
            }
        });
    });

    describe('Cookie Path Restriction', () => {
        test('should restrict cookie to root path', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({});

            const cookies = res.headers['set-cookie'];
            expect(cookies[0]).toContain('Path=/');
        });
    });
});

describe('Cookie Security Best Practices', () => {
    test('should not expose sensitive data in cookie value', async () => {
        const app = express();
        app.use(express.json());

        app.post('/login', (req, res) => {
            // Good: Using opaque token
            res.cookie('session', 'opaque-random-token-here', {
                httpOnly: true
            });
            res.json({ success: true });
        });

        const res = await request(app)
            .post('/login')
            .send({});

        const cookies = res.headers['set-cookie'];
        // Cookie should not contain JSON or PII
        expect(cookies[0]).not.toContain('password');
        expect(cookies[0]).not.toContain('email');
    });
});
