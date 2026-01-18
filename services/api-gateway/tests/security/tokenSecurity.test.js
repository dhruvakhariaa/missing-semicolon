/**
 * Token Security Tests
 * Tests protection against token theft, tampering, and confusion attacks
 */

const jwt = require('jsonwebtoken');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    hasPermission
} = require('../../src/utils/jwt');
const { jwtAttacks } = require('../fixtures/attackPayloads');

describe('JWT Token Security', () => {
    const mockUser = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'test@example.com',
        role: 'citizen',
        kycLevel: 1,
        permissions: {
            healthcare: ['read', 'book_appointment'],
            agriculture: ['read'],
            urban: ['read']
        }
    };

    describe('Token Generation', () => {
        test('should generate valid access token', () => {
            const token = generateAccessToken(mockUser);
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
        });

        test('should generate valid refresh token', () => {
            const { token, expiresAt } = generateRefreshToken(mockUser);
            expect(token).toBeDefined();
            expect(expiresAt).toBeInstanceOf(Date);
        });

        test('should include correct claims in access token', () => {
            const token = generateAccessToken(mockUser);
            const result = verifyAccessToken(token);

            expect(result.valid).toBe(true);
            expect(result.payload.userId).toBe(mockUser._id.toString());
            expect(result.payload.email).toBe(mockUser.email);
            expect(result.payload.role).toBe(mockUser.role);
            expect(result.payload.tokenType).toBe('access');
        });

        test('should include SSO permissions in token', () => {
            const token = generateAccessToken(mockUser);
            const result = verifyAccessToken(token);

            expect(result.payload.permissions).toBeDefined();
            expect(result.payload.permissions.healthcare).toContain('read');
            expect(result.payload.permissions.agriculture).toContain('read');
            expect(result.payload.permissions.urban).toContain('read');
        });
    });

    describe('Token Verification', () => {
        test('should verify valid access token', () => {
            const token = generateAccessToken(mockUser);
            const result = verifyAccessToken(token);

            expect(result.valid).toBe(true);
            expect(result.payload).toBeDefined();
        });

        test('should verify valid refresh token', () => {
            const { token } = generateRefreshToken(mockUser);
            const result = verifyRefreshToken(token);

            expect(result.valid).toBe(true);
            expect(result.payload).toBeDefined();
        });

        test('should reject invalid token', () => {
            const result = verifyAccessToken('invalid.token.here');
            expect(result.valid).toBe(false);
        });

        test('should reject malformed token', () => {
            const result = verifyAccessToken('not-a-jwt');
            expect(result.valid).toBe(false);
        });
    });

    describe('Token Expiration', () => {
        test('should reject expired access token', () => {
            // Create token with past expiration
            const expiredToken = jwt.sign(
                { userId: '123', tokenType: 'access' },
                process.env.JWT_ACCESS_SECRET,
                { expiresIn: '-1h' } // Already expired
            );

            const result = verifyAccessToken(expiredToken);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('expired');
        });

        test('should reject expired refresh token', () => {
            const expiredToken = jwt.sign(
                { userId: '123', tokenType: 'refresh' },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '-1h' }
            );

            const result = verifyRefreshToken(expiredToken);
            expect(result.valid).toBe(false);
        });
    });

    describe('Token Type Confusion', () => {
        test('should reject refresh token as access token', () => {
            const { token: refreshToken } = generateRefreshToken(mockUser);

            // Try to use refresh token as access token
            // This should fail because it's signed with different secret
            // OR if same secret, should fail due to tokenType check
            const result = verifyAccessToken(refreshToken);
            expect(result.valid).toBe(false);
        });

        test('should reject access token as refresh token', () => {
            const accessToken = generateAccessToken(mockUser);

            // Try to use access token as refresh token
            const result = verifyRefreshToken(accessToken);
            expect(result.valid).toBe(false);
        });

        test('should validate tokenType claim', () => {
            const token = generateAccessToken(mockUser);
            const result = verifyAccessToken(token);

            expect(result.payload.tokenType).toBe('access');
        });
    });

    describe('Token Tampering', () => {
        test('should reject token with modified payload', () => {
            const token = generateAccessToken(mockUser);
            const parts = token.split('.');

            // Decode payload, modify it, re-encode (without valid signature)
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
            payload.role = 'admin'; // Try to elevate privileges
            const modifiedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

            const tamperedToken = `${parts[0]}.${modifiedPayload}.${parts[2]}`;

            const result = verifyAccessToken(tamperedToken);
            expect(result.valid).toBe(false);
        });

        test('should reject token with invalid signature', () => {
            const result = verifyAccessToken(jwtAttacks.tamperedToken);
            expect(result.valid).toBe(false);
        });
    });

    describe('Algorithm Confusion Attack', () => {
        test('should reject none algorithm attack', () => {
            // Tokens with alg: none should be rejected
            const result = verifyAccessToken(jwtAttacks.noneAlgorithm);
            expect(result.valid).toBe(false);
        });

        test('should require HS256 algorithm', () => {
            const token = generateAccessToken(mockUser);
            const decoded = jwt.decode(token, { complete: true });
            expect(decoded.header.alg).toBe('HS256');
        });
    });

    describe('Issuer and Audience Validation', () => {
        test('should include correct issuer', () => {
            const token = generateAccessToken(mockUser);
            const decoded = jwt.decode(token);
            expect(decoded.iss).toBe('service-delivery-platform');
        });

        test('should include correct audience', () => {
            const token = generateAccessToken(mockUser);
            const decoded = jwt.decode(token);
            expect(decoded.aud).toBe('citizen-portal');
        });

        test('should reject token with wrong issuer', () => {
            const wrongIssuerToken = jwt.sign(
                { userId: '123', tokenType: 'access', iss: 'evil-issuer' },
                process.env.JWT_ACCESS_SECRET,
                { audience: 'citizen-portal' }
            );

            const result = verifyAccessToken(wrongIssuerToken);
            expect(result.valid).toBe(false);
        });
    });
});

describe('Permission Checking', () => {
    describe('Role-based Permissions', () => {
        test('should grant all permissions to admin', () => {
            const adminPayload = {
                role: 'admin',
                permissions: {}
            };

            expect(hasPermission(adminPayload, 'healthcare', 'admin')).toBe(true);
            expect(hasPermission(adminPayload, 'agriculture', 'delete')).toBe(true);
            expect(hasPermission(adminPayload, 'urban', 'anything')).toBe(true);
        });

        test('should check specific permissions for non-admin', () => {
            const citizenPayload = {
                role: 'citizen',
                permissions: {
                    healthcare: ['read', 'book_appointment'],
                    agriculture: ['read'],
                    urban: ['read']
                }
            };

            expect(hasPermission(citizenPayload, 'healthcare', 'read')).toBe(true);
            expect(hasPermission(citizenPayload, 'healthcare', 'book_appointment')).toBe(true);
            expect(hasPermission(citizenPayload, 'healthcare', 'admin')).toBe(false);
        });
    });

    describe('Wildcard Permissions', () => {
        test('should honor wildcard permission', () => {
            const providerPayload = {
                role: 'provider',
                permissions: {
                    healthcare: ['*']
                }
            };

            expect(hasPermission(providerPayload, 'healthcare', 'any_action')).toBe(true);
        });
    });

    describe('Cross-Sector Permissions', () => {
        test('should validate permissions per sector', () => {
            const userPayload = {
                role: 'citizen',
                permissions: {
                    healthcare: ['read'],
                    agriculture: ['read', 'request_advisory'],
                    urban: ['read']
                }
            };

            // Has permission in agriculture
            expect(hasPermission(userPayload, 'agriculture', 'request_advisory')).toBe(true);

            // Doesn't have permission in healthcare
            expect(hasPermission(userPayload, 'healthcare', 'request_advisory')).toBe(false);
        });
    });
});
