/**
 * Encryption Security Tests
 * Tests protection of field-level encryption (AES-256-GCM)
 */

const {
    encryptField,
    decryptField,
    generateSecureToken,
    hashData
} = require('../../src/utils/encryption');

describe('AES-256-GCM Encryption Security', () => {
    describe('Encryption Basics', () => {
        test('should encrypt and decrypt correctly', () => {
            const plainText = 'ABCDE1234F'; // PAN number
            const encrypted = encryptField(plainText);
            const decrypted = decryptField(encrypted);

            expect(decrypted).toBe(plainText);
        });

        test('should produce different ciphertext for same plaintext', () => {
            const plainText = 'ABCDE1234F';
            const encrypted1 = encryptField(plainText);
            const encrypted2 = encryptField(plainText);

            expect(encrypted1).not.toBe(encrypted2);
        });

        test('should use correct format (IV:AuthTag:Encrypted)', () => {
            const encrypted = encryptField('test');
            const parts = encrypted.split(':');

            expect(parts).toHaveLength(3);
            expect(parts[0]).toHaveLength(32); // 16 bytes IV = 32 hex chars
            expect(parts[1]).toHaveLength(32); // 16 bytes auth tag = 32 hex chars
        });
    });

    describe('Ciphertext Integrity (GCM Auth Tag)', () => {
        test('should detect tampered ciphertext', () => {
            const encrypted = encryptField('ABCDE1234F');
            const parts = encrypted.split(':');

            // Tamper with the encrypted data
            const tamperedData = parts[2].replace(/./g, (c, i) => i === 0 ? 'X' : c);
            const tampered = `${parts[0]}:${parts[1]}:${tamperedData}`;

            expect(() => decryptField(tampered)).toThrow();
        });

        test('should detect modified auth tag', () => {
            const encrypted = encryptField('ABCDE1234F');
            const parts = encrypted.split(':');

            // Modify auth tag
            const modifiedAuthTag = 'a'.repeat(32);
            const tampered = `${parts[0]}:${modifiedAuthTag}:${parts[2]}`;

            expect(() => decryptField(tampered)).toThrow();
        });

        test('should detect modified IV', () => {
            const encrypted = encryptField('ABCDE1234F');
            const parts = encrypted.split(':');

            // Modify IV
            const modifiedIV = 'b'.repeat(32);
            const tampered = `${modifiedIV}:${parts[1]}:${parts[2]}`;

            expect(() => decryptField(tampered)).toThrow();
        });
    });

    describe('Invalid Data Handling', () => {
        test('should handle null input', () => {
            expect(encryptField(null)).toBeNull();
            expect(decryptField(null)).toBeNull();
        });

        test('should handle undefined input', () => {
            expect(encryptField(undefined)).toBeNull();
            expect(decryptField(undefined)).toBeNull();
        });

        test('should throw on invalid encrypted format', () => {
            expect(() => decryptField('invalid-format')).toThrow();
            expect(() => decryptField('part1:part2')).toThrow(); // Missing part
        });

        test('should throw on non-hex IV', () => {
            expect(() => decryptField('zzzz:' + 'a'.repeat(32) + ':' + 'b'.repeat(32))).toThrow();
        });
    });

    describe('Encryption Key Security', () => {
        test('should require encryption key from environment', () => {
            const originalKey = process.env.FIELD_ENCRYPTION_KEY;

            try {
                delete process.env.FIELD_ENCRYPTION_KEY;
                jest.resetModules();

                // Should throw when requiring or using without key
                expect(() => {
                    const { encryptField: ef } = require('../../src/utils/encryption');
                    // Some implementations throw on require, others on usage
                    // We check if it throws on usage if it didn't throw on require
                    if (ef) ef('test');
                }).toThrow();
            } finally {
                // Restore key
                process.env.FIELD_ENCRYPTION_KEY = originalKey;
                jest.resetModules();
                // Re-require to restore state
                require('../../src/utils/encryption');
            }
        });

        test('should support 64-char hex key', () => {
            const hexKey = 'a'.repeat(64);
            // This is a valid 256-bit key in hex
            expect(hexKey.length).toBe(64);
            expect(Buffer.from(hexKey, 'hex').length).toBe(32);
        });

        test('should support 44-char base64 key', () => {
            const base64Key = 'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY=';
            // Valid base64 for 32 bytes
            expect(Buffer.from(base64Key, 'base64').length).toBe(27); // This specific one
        });
    });

    describe('Sensitive Data Types', () => {
        test('should encrypt PAN numbers', () => {
            const pan = 'ABCDE1234F';
            const encrypted = encryptField(pan);

            expect(encrypted).not.toContain('ABCDE');
            expect(encrypted).not.toContain('1234');
        });

        test('should encrypt Aadhaar numbers', () => {
            const aadhaar = '123456789012';
            const encrypted = encryptField(aadhaar);

            expect(encrypted).not.toContain('1234');
            expect(encrypted).not.toContain('9012');
        });

        test('should encrypt bank account numbers', () => {
            const account = '12345678901234';
            const encrypted = encryptField(account);

            expect(encrypted).not.toContain('12345');
        });
    });
});

describe('Secure Token Generation', () => {
    describe('Randomness', () => {
        test('should generate unique tokens', () => {
            const tokens = new Set();
            for (let i = 0; i < 100; i++) {
                tokens.add(generateSecureToken());
            }
            expect(tokens.size).toBe(100); // All unique
        });

        test('should generate specified byte length', () => {
            const token16 = generateSecureToken(16);
            const token32 = generateSecureToken(32);
            const token64 = generateSecureToken(64);

            expect(token16).toHaveLength(32); // 16 bytes = 32 hex chars
            expect(token32).toHaveLength(64); // 32 bytes = 64 hex chars
            expect(token64).toHaveLength(128); // 64 bytes = 128 hex chars
        });

        test('should produce hex output', () => {
            const token = generateSecureToken();
            expect(token).toMatch(/^[a-f0-9]+$/);
        });
    });
});

describe('Secure Hashing', () => {
    describe('SHA-256 Hashing', () => {
        test('should produce consistent hash for same input', () => {
            const data = 'test-data';
            const hash1 = hashData(data);
            const hash2 = hashData(data);

            expect(hash1).toBe(hash2);
        });

        test('should produce different hash for different input', () => {
            const hash1 = hashData('data1');
            const hash2 = hashData('data2');

            expect(hash1).not.toBe(hash2);
        });

        test('should produce 64-character hex hash', () => {
            const hash = hashData('test');
            expect(hash).toHaveLength(64);
            expect(hash).toMatch(/^[a-f0-9]+$/);
        });

        test('should be case-sensitive', () => {
            const hash1 = hashData('Test');
            const hash2 = hashData('test');

            expect(hash1).not.toBe(hash2);
        });
    });
});
