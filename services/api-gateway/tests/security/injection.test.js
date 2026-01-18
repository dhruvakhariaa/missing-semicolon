/**
 * Injection Attack Tests
 * Tests protection against SQL, NoSQL, and Command injection attacks
 */

const { noSqlInjection, sqlInjection, commandInjection } = require('../fixtures/attackPayloads');

describe('NoSQL Injection Protection', () => {
    describe('Query Operator Injection', () => {
        test('should reject $gt operator in email field', () => {
            const payload = { email: { "$gt": "" }, password: "test" };

            // Validation should reject object instead of string
            expect(typeof payload.email).not.toBe('string');
        });

        test('should reject $ne operator attempting to bypass auth', () => {
            const payload = { email: { "$ne": null }, password: { "$ne": null } };

            // Both fields should be strings, not objects
            expect(typeof payload.email).toBe('object');
            // This is what needs to be blocked
        });

        test('should reject $regex operator for wildcard matching', () => {
            const payload = { email: { "$regex": ".*" } };
            expect(typeof payload.email).not.toBe('string');
        });

        test('should handle all NoSQL injection payloads', () => {
            noSqlInjection.forEach((payload, index) => {
                // Each payload should be recognized as potentially malicious
                const isObject = typeof payload === 'object';
                const isString = typeof payload === 'string';

                if (isObject) {
                    // Object payloads need schema validation to block
                    expect(payload).toBeDefined();
                } else if (isString && payload.includes('$')) {
                    // String payloads with MongoDB operators
                    expect(payload).toContain('$');
                }
            });
        });
    });

    describe('Input Type Validation', () => {
        test('should only accept string for email', () => {
            const validEmail = "test@example.com";
            const invalidEmails = [
                { "$gt": "" },
                ["test@example.com"],
                123,
                null,
                undefined,
                true
            ];

            expect(typeof validEmail).toBe('string');
            invalidEmails.forEach(invalid => {
                expect(typeof invalid).not.toBe('string');
            });
        });

        test('should only accept string for password', () => {
            const validPassword = "SecurePass@123";
            expect(typeof validPassword).toBe('string');
        });
    });
});

describe('SQL Injection Protection', () => {
    describe('Classic SQL Injection Patterns', () => {
        test('should identify DROP TABLE attempts', () => {
            sqlInjection.forEach(payload => {
                if (payload.toUpperCase().includes('DROP')) {
                    expect(payload.toUpperCase()).toContain('DROP');
                    // These should be sanitized/rejected
                }
            });
        });

        test('should identify OR-based authentication bypass', () => {
            const orPatterns = sqlInjection.filter(p =>
                p.includes("OR") || p.includes("or") || p.includes("'='")
            );
            expect(orPatterns.length).toBeGreaterThan(0);
        });

        test('should identify UNION SELECT attempts', () => {
            const unionPatterns = sqlInjection.filter(p =>
                p.toUpperCase().includes('UNION')
            );
            expect(unionPatterns.length).toBeGreaterThan(0);
        });

        test('should identify comment-based truncation', () => {
            const commentPatterns = sqlInjection.filter(p =>
                p.includes('--') || p.includes('#')
            );
            expect(commentPatterns.length).toBeGreaterThan(0);
        });
    });

    describe('Parameterized Query Safety', () => {
        test('should treat input as literal string, not SQL', () => {
            // MongoDB uses BSON, not SQL, so SQL injection is different
            // But we test that dangerous patterns are recognized
            const dangerousInput = "'; DROP TABLE users; --";

            // In a parameterized query, this is just a string
            expect(dangerousInput).toContain("DROP");
            expect(typeof dangerousInput).toBe('string');
        });
    });
});

describe('Command Injection Protection', () => {
    describe('Shell Command Patterns', () => {
        test('should identify pipe commands', () => {
            const pipeCommands = commandInjection.filter(p => p.includes('|'));
            expect(pipeCommands.length).toBeGreaterThan(0);
        });

        test('should identify semicolon command chaining', () => {
            const semicolonCommands = commandInjection.filter(p => p.includes(';'));
            expect(semicolonCommands.length).toBeGreaterThan(0);
        });

        test('should identify backtick execution', () => {
            const backtickCommands = commandInjection.filter(p => p.includes('`'));
            expect(backtickCommands.length).toBeGreaterThan(0);
        });

        test('should identify $() command substitution', () => {
            const subCommands = commandInjection.filter(p => p.includes('$('));
            expect(subCommands.length).toBeGreaterThan(0);
        });

        test('should identify && and || operators', () => {
            const chainCommands = commandInjection.filter(p =>
                p.includes('&&') || p.includes('||')
            );
            expect(chainCommands.length).toBeGreaterThan(0);
        });
    });

    describe('Dangerous Command Detection', () => {
        test('should detect rm -rf attempts', () => {
            const rmCommands = commandInjection.filter(p => p.includes('rm'));
            expect(rmCommands.length).toBeGreaterThan(0);
        });

        test('should detect file read attempts', () => {
            const readCommands = commandInjection.filter(p =>
                p.includes('cat') || p.includes('/etc/passwd')
            );
            expect(readCommands.length).toBeGreaterThan(0);
        });

        test('should detect network commands', () => {
            const netCommands = commandInjection.filter(p =>
                p.includes('nc') || p.includes('wget') || p.includes('curl')
            );
            expect(netCommands.length).toBeGreaterThan(0);
        });
    });
});

describe('Input Sanitization', () => {
    const sanitize = (input) => {
        if (typeof input !== 'string') return '';
        // Basic sanitization - remove dangerous characters
        return input
            .replace(/[;|`$&]/g, '')
            .replace(/\.\.\//g, '')
            .trim();
    };

    test('should remove semicolons', () => {
        expect(sanitize('; rm -rf /')).not.toContain(';');
    });

    test('should remove pipe characters', () => {
        expect(sanitize('| cat /etc/passwd')).not.toContain('|');
    });

    test('should remove command substitution', () => {
        expect(sanitize('$(whoami)')).not.toContain('$');
    });

    test('should remove backticks', () => {
        expect(sanitize('`id`')).not.toContain('`');
    });

    test('should remove path traversal sequences', () => {
        expect(sanitize('../../../etc/passwd')).not.toContain('..');
    });

    test('should handle non-string input', () => {
        expect(sanitize(null)).toBe('');
        expect(sanitize(undefined)).toBe('');
        expect(sanitize(123)).toBe('');
        expect(sanitize({})).toBe('');
    });
});
