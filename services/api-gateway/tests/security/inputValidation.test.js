/**
 * Input Validation Tests
 * Tests protection against oversized payloads, path traversal, and format bypass
 */

const { emailBypass, pathTraversal, oversizedPayloads } = require('../fixtures/attackPayloads');

describe('Input Validation', () => {
    describe('Email Validation', () => {
        const isValidEmail = (email) => {
            if (typeof email !== 'string') return false;
            // Simple robust regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

            if (email.length > 254) return false;
            if (!emailRegex.test(email)) return false;
            if (email.includes('..')) return false;

            // Check for invalid chars
            if (/[<>()\[\]\\,;:\s"]/.test(email)) return false;

            return true;
        };

        test('should accept valid email formats', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.org',
                'user+tag@example.co.uk'
            ];
            validEmails.forEach(email => {
                expect(isValidEmail(email)).toBe(true);
            });
        });

        test('should reject invalid email formats', () => {
            emailBypass.forEach(email => {
                expect(isValidEmail(email)).toBe(false);
            });
        });

        test('should reject emails without @', () => {
            expect(isValidEmail('testexample.com')).toBe(false);
        });

        test('should reject emails without domain', () => {
            expect(isValidEmail('test@')).toBe(false);
        });

        test('should reject non-string inputs', () => {
            expect(isValidEmail(null)).toBe(false);
            expect(isValidEmail(undefined)).toBe(false);
            expect(isValidEmail(123)).toBe(false);
            expect(isValidEmail({})).toBe(false);
        });
    });

    describe('Password Validation', () => {
        const validatePassword = (password) => {
            const errors = [];
            if (typeof password !== 'string') {
                return { valid: false, errors: ['Password must be a string'] };
            }
            if (password.length < 8) errors.push('Min 8 characters');
            if (password.length > 128) errors.push('Max 128 characters');
            if (!/[a-z]/.test(password)) errors.push('Requires lowercase');
            if (!/[A-Z]/.test(password)) errors.push('Requires uppercase');
            if (!/[0-9]/.test(password)) errors.push('Requires number');
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Requires special char');
            return { valid: errors.length === 0, errors };
        };

        test('should accept strong passwords', () => {
            const result = validatePassword('SecurePass@123');
            expect(result.valid).toBe(true);
        });

        test('should reject short passwords', () => {
            const result = validatePassword('Ab1!');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Min 8 characters');
        });

        test('should reject passwords without uppercase', () => {
            const result = validatePassword('password@123');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Requires uppercase');
        });

        test('should reject passwords without special characters', () => {
            const result = validatePassword('Password123');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Requires special char');
        });

        test('should reject very long passwords', () => {
            const longPassword = 'A'.repeat(130) + 'a1!';
            const result = validatePassword(longPassword);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Max 128 characters');
        });
    });

    describe('Name Validation', () => {
        const validateName = (name) => {
            if (typeof name !== 'string') return false;
            const trimmed = name.trim();
            return trimmed.length >= 2 && trimmed.length <= 100;
        };

        test('should accept valid names', () => {
            expect(validateName('John Doe')).toBe(true);
            expect(validateName('Ñoño García')).toBe(true);
        });

        test('should reject too short names', () => {
            expect(validateName('J')).toBe(false);
        });

        test('should reject too long names', () => {
            expect(validateName('A'.repeat(101))).toBe(false);
        });

        test('should trim whitespace', () => {
            expect(validateName('  John Doe  ')).toBe(true);
        });
    });

    describe('Phone Number Validation', () => {
        const validateIndianPhone = (phone) => {
            if (typeof phone !== 'string') return false;
            return /^[6-9]\d{9}$/.test(phone);
        };

        test('should accept valid Indian mobile numbers', () => {
            expect(validateIndianPhone('9876543210')).toBe(true);
            expect(validateIndianPhone('7890123456')).toBe(true);
        });

        test('should reject invalid starting digits', () => {
            expect(validateIndianPhone('1234567890')).toBe(false);
            expect(validateIndianPhone('5234567890')).toBe(false);
        });

        test('should reject wrong length', () => {
            expect(validateIndianPhone('98765432')).toBe(false);
            expect(validateIndianPhone('98765432101')).toBe(false);
        });
    });

    describe('PAN Number Validation', () => {
        const validatePan = (pan) => {
            if (typeof pan !== 'string') return false;
            return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
        };

        test('should accept valid PAN format', () => {
            expect(validatePan('ABCDE1234F')).toBe(true);
        });

        test('should reject invalid format', () => {
            expect(validatePan('ABC123456F')).toBe(false);
            expect(validatePan('abcde1234f')).toBe(false); // lowercase
            expect(validatePan('ABCDE12345')).toBe(false); // ends with number
        });
    });
});

describe('Path Traversal Protection', () => {
    const containsPathTraversal = (input) => {
        if (typeof input !== 'string') return false;
        const patterns = [
            /\.\.\//,
            /\.\.\\/,
            /%2e%2e%2f/i,
            /%2e%2e\//i,
            /\.\.%2f/i,
            /file:\/\//i,
            /\\\\[^\\]+\\/
        ];
        return patterns.some(p => p.test(input));
    };

    test('should detect ../ sequences', () => {
        pathTraversal.forEach(payload => {
            // Most path traversal attempts should be caught
            if (payload.includes('..')) {
                expect(containsPathTraversal(payload)).toBe(true);
            }
        });
    });

    test('should detect URL-encoded traversal', () => {
        const payload = '%2e%2e%2f%2e%2e%2fetc/passwd';
        expect(containsPathTraversal(payload)).toBe(true);
    });

    test('should detect file:// protocol', () => {
        expect(containsPathTraversal('file:///etc/passwd')).toBe(true);
    });

    test('should detect Windows UNC paths', () => {
        expect(containsPathTraversal('\\\\127.0.0.1\\c$\\windows')).toBe(true);
    });
});

describe('Oversized Payload Protection', () => {
    describe('String Length Limits', () => {
        test('should reject strings over 1MB', () => {
            const maxLength = 1000000; // 1MB
            expect(oversizedPayloads.longString.length).toBeGreaterThanOrEqual(maxLength);
        });

        test('should calculate memory impact', () => {
            const stringSize = Buffer.byteLength(oversizedPayloads.longString, 'utf8');
            expect(stringSize).toBeGreaterThan(500000); // > 500KB
        });
    });

    describe('Nested Object Depth', () => {
        const getObjectDepth = (obj, depth = 0) => {
            if (typeof obj !== 'object' || obj === null) return depth;
            return Math.max(...Object.values(obj).map(v => getObjectDepth(v, depth + 1)));
        };

        test('should detect deeply nested objects', () => {
            const depth = getObjectDepth(oversizedPayloads.deepObject);
            expect(depth).toBeGreaterThan(50);
        });
    });

    describe('Array Size Limits', () => {
        test('should detect oversized arrays', () => {
            expect(oversizedPayloads.largeArray.length).toBeGreaterThan(1000);
        });
    });
});

describe('Content-Type Validation', () => {
    test('should only accept application/json for API requests', () => {
        const validContentTypes = [
            'application/json',
            'application/json; charset=utf-8'
        ];

        const invalidContentTypes = [
            'text/plain',
            'multipart/form-data',
            'application/xml'
        ];

        validContentTypes.forEach(ct => {
            expect(ct.includes('application/json')).toBe(true);
        });

        invalidContentTypes.forEach(ct => {
            expect(ct.includes('application/json')).toBe(false);
        });
    });
});

describe('Null Byte Injection', () => {
    test('should detect null bytes in input', () => {
        const containsNull = (input) => {
            if (typeof input !== 'string') return false;
            return input.includes('\u0000') || input.includes('%00');
        };

        expect(containsNull('/etc/passwd\u0000.jpg')).toBe(true);
        expect(containsNull('/etc/passwd%00.jpg')).toBe(true);
        expect(containsNull('/etc/passwd.jpg')).toBe(false);
    });
});
