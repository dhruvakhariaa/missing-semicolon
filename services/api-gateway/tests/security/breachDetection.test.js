/**
 * Breach Detection & Password Checker Tests
 * Tests protection against known breached passwords and common passwords
 */

const {
    isCommonPassword,
    isSimilarToUserInfo,
    checkBreachedPassword,
    validatePasswordSecurity,
    getPasswordHashParts
} = require('../../src/utils/passwordChecker');

describe('Common Password Detection', () => {
    describe('isCommonPassword', () => {
        test('should detect common passwords', () => {
            const commonPasswords = [
                'password', '123456', 'qwerty', 'admin', 'letmein',
                'welcome', 'monkey', 'dragon', 'master', 'login'
            ];

            commonPasswords.forEach(password => {
                expect(isCommonPassword(password)).toBe(true);
            });
        });

        test('should be case-insensitive', () => {
            expect(isCommonPassword('PASSWORD')).toBe(true);
            expect(isCommonPassword('Password')).toBe(true);
            expect(isCommonPassword('pAsSwOrD')).toBe(true);
        });

        test('should accept strong passwords', () => {
            const strongPasswords = [
                'XkE#9m2$vPq!',
                'MyUniqueP@ss2024!',
                'Tr0ub4dor&3',
                'correct-horse-battery-staple'
            ];

            strongPasswords.forEach(password => {
                expect(isCommonPassword(password)).toBe(false);
            });
        });

        test('should handle invalid input', () => {
            expect(isCommonPassword(null)).toBe(true);
            expect(isCommonPassword(undefined)).toBe(true);
            expect(isCommonPassword('')).toBe(true);
            expect(isCommonPassword(123)).toBe(true);
        });
    });
});

describe('User Info Similarity Detection', () => {
    describe('isSimilarToUserInfo', () => {
        const userInfo = {
            email: 'john.doe@example.com',
            name: 'John Doe',
            phone: '9876543210'
        };

        test('should detect password containing email username', () => {
            expect(isSimilarToUserInfo('john.doe123', userInfo)).toBe(true);
            expect(isSimilarToUserInfo('johndoe2024', userInfo)).toBe(true);
        });

        test('should detect password containing name', () => {
            expect(isSimilarToUserInfo('John123!', userInfo)).toBe(true);
            expect(isSimilarToUserInfo('DoeFamily!', userInfo)).toBe(true);
        });

        test('should detect password containing phone number', () => {
            expect(isSimilarToUserInfo('9876543210', userInfo)).toBe(true);
            expect(isSimilarToUserInfo('pass9876543210', userInfo)).toBe(true);
        });

        test('should accept passwords not related to user info', () => {
            expect(isSimilarToUserInfo('XkE#9m2$vPq!', userInfo)).toBe(false);
            expect(isSimilarToUserInfo('RandomP@ss2024!', userInfo)).toBe(false);
        });

        test('should handle missing user info fields', () => {
            expect(isSimilarToUserInfo('StrongP@ss123', {})).toBe(false);
            expect(isSimilarToUserInfo('StrongP@ss123', { email: null })).toBe(false);
        });
    });
});

describe('Breach Detection (HaveIBeenPwned)', () => {
    describe('getPasswordHashParts', () => {
        test('should generate correct SHA-1 hash parts', () => {
            const parts = getPasswordHashParts('password');
            expect(parts.prefix).toHaveLength(5);
            expect(parts.suffix).toHaveLength(35);
            expect(parts.prefix + parts.suffix).toHaveLength(40);
        });

        test('should generate uppercase hex', () => {
            const parts = getPasswordHashParts('test');
            expect(parts.prefix).toMatch(/^[A-F0-9]+$/);
            expect(parts.suffix).toMatch(/^[A-F0-9]+$/);
        });

        test('should be deterministic', () => {
            const parts1 = getPasswordHashParts('password');
            const parts2 = getPasswordHashParts('password');
            expect(parts1.prefix).toBe(parts2.prefix);
            expect(parts1.suffix).toBe(parts2.suffix);
        });
    });

    describe('checkBreachedPassword', () => {
        test('should detect known breached passwords', async () => {
            const result = await checkBreachedPassword('password');
            expect(result.breached).toBe(true);
            expect(result.count).toBeGreaterThan(0);
        });

        test('should detect 123456 as breached', async () => {
            const result = await checkBreachedPassword('123456');
            expect(result.breached).toBe(true);
            expect(result.count).toBeGreaterThan(1000000); // Very common
        });

        test('should accept unique passwords as not breached', async () => {
            const result = await checkBreachedPassword('XkE#9m2$vPq!UniqueValue');
            expect(result.breached).toBe(false);
        });
    });
});

describe('Comprehensive Password Validation', () => {
    describe('validatePasswordSecurity', () => {
        test('should reject common passwords', async () => {
            const result = await validatePasswordSecurity('password');
            expect(result.safe).toBe(false);
            expect(result.issues).toContain('Password is too common');
        });

        test('should reject passwords similar to user info', async () => {
            const userInfo = { email: 'john@example.com', name: 'John' };
            const result = await validatePasswordSecurity('John123!', userInfo);
            expect(result.safe).toBe(false);
            expect(result.issues.some(i => i.includes('similar'))).toBe(true);
        });

        test('should reject breached passwords', async () => {
            const result = await validatePasswordSecurity('123456');
            expect(result.safe).toBe(false);
            expect(result.issues.some(i => i.includes('breach'))).toBe(true);
        });

        test('should accept strong, unique passwords', async () => {
            const result = await validatePasswordSecurity('X8k#mP2$qVr!2024');
            expect(result.safe).toBe(true);
            expect(result.issues).toHaveLength(0);
        });

        test('should return multiple issues for very weak passwords', async () => {
            const userInfo = { name: 'Password User' };
            const result = await validatePasswordSecurity('password', userInfo);
            expect(result.issues.length).toBeGreaterThanOrEqual(2);
        });
    });
});

describe('K-Anonymity Security', () => {
    test('should only send first 5 chars of hash (k-anonymity)', () => {
        const { prefix } = getPasswordHashParts('mySecretPassword');
        // Only prefix is sent to API, protecting the actual password
        expect(prefix).toHaveLength(5);
    });

    test('should not expose full hash', () => {
        const parts = getPasswordHashParts('password');
        // The API receives only prefix, we check suffix locally
        const fullHash = parts.prefix + parts.suffix;
        expect(fullHash).not.toBe(parts.prefix); // Suffix is kept private
    });
});
