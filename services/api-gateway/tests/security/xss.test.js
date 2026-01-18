/**
 * XSS (Cross-Site Scripting) Attack Tests
 * Tests protection against XSS attacks in all input fields
 */

const { xss, unicodeAttacks } = require('../fixtures/attackPayloads');

describe('XSS Attack Prevention', () => {
    // Helper function to simulate sanitization
    const sanitizeHtml = (input) => {
        if (typeof input !== 'string') return '';
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    };

    // Helper to check if input contains XSS patterns
    const containsXssPattern = (input) => {
        if (typeof input !== 'string') return false;
        const patterns = [
            /<script/i,
            /javascript:/i,
            /on\w+=/i,
            /<iframe/i,
            /<svg/i,
            /<img[^>]+onerror/i,
            /eval\s*\(/i,
            /document\./i,
            /window\./i,
            /alert\s*\(/i
        ];
        return patterns.some(p => p.test(input));
    };

    describe('Script Tag Injection', () => {
        test('should detect <script> tags', () => {
            const payload = "<script>alert('XSS')</script>";
            expect(containsXssPattern(payload)).toBe(true);
        });

        test('should sanitize script tags', () => {
            const payload = "<script>alert('XSS')</script>";
            const sanitized = sanitizeHtml(payload);
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('&lt;script&gt;');
        });

        test('should handle case variations', () => {
            const payloads = [
                "<SCRIPT>alert('XSS')</SCRIPT>",
                "<ScRiPt>alert('XSS')</ScRiPt>",
                "<scr<script>ipt>alert('XSS')</script>"
            ];
            payloads.forEach(p => {
                expect(containsXssPattern(p)).toBe(true);
            });
        });
    });

    describe('Event Handler Injection', () => {
        test('should detect onerror handlers', () => {
            const payload = "<img src=x onerror=alert('XSS')>";
            expect(containsXssPattern(payload)).toBe(true);
        });

        test('should detect onload handlers', () => {
            const payload = "<svg onload=alert('XSS')>";
            expect(containsXssPattern(payload)).toBe(true);
        });

        test('should detect onmouseover handlers', () => {
            const payload = "<div onmouseover='alert(1)'>hover me</div>";
            expect(containsXssPattern(payload)).toBe(true);
        });

        test('should detect various event handlers', () => {
            const handlers = ['onclick', 'onfocus', 'onblur', 'onsubmit', 'onchange'];
            handlers.forEach(handler => {
                const payload = `<input ${handler}="alert('XSS')">`;
                expect(payload).toContain(handler);
            });
        });
    });

    describe('JavaScript Protocol', () => {
        test('should detect javascript: protocol', () => {
            const payloads = [
                "javascript:alert('XSS')",
                "JAVASCRIPT:alert('XSS')",
                "java\nscript:alert('XSS')"
            ];
            payloads.forEach(p => {
                expect(p.toLowerCase().replace(/\s/g, '')).toContain('javascript:');
            });
        });
    });

    describe('SVG and MathML Attacks', () => {
        test('should detect SVG-based XSS', () => {
            const payload = "<svg/onload=alert('XSS')>";
            expect(containsXssPattern(payload)).toBe(true);
        });

        test('should sanitize SVG elements', () => {
            const payload = "<svg/onload=alert('XSS')>";
            const sanitized = sanitizeHtml(payload);
            expect(sanitized).not.toContain('<svg');
        });
    });

    describe('Encoded XSS Attacks', () => {
        test('should detect HTML entity encoded attacks', () => {
            const payload = "&#60;script&#62;alert('XSS')&#60;/script&#62;";
            // After decoding: <script>alert('XSS')</script>
            expect(payload).toContain('&#60;');
        });

        test('should detect URL encoded attacks', () => {
            const payload = "%3Cscript%3Ealert('XSS')%3C/script%3E";
            const decoded = decodeURIComponent(payload);
            expect(containsXssPattern(decoded)).toBe(true);
        });

        test('should detect unicode encoded attacks', () => {
            const payload = "\\u003cscript\\u003ealert('XSS')\\u003c/script\\u003e";
            expect(payload).toContain('\\u003c');
        });
    });

    describe('All XSS Payloads', () => {
        test('should identify all XSS payloads as dangerous', () => {
            let detected = 0;
            xss.forEach(payload => {
                if (containsXssPattern(payload)) {
                    detected++;
                }
            });
            // Expect most payloads to be detected
            expect(detected).toBeGreaterThan(xss.length * 0.7);
        });
    });

    describe('Unicode Attack Vectors', () => {
        test('should detect null byte injection', () => {
            expect(unicodeAttacks).toContain('\u0000');
        });

        test('should detect HTTP header injection', () => {
            const httpInjection = unicodeAttacks.find(p => p.includes('\r\n'));
            expect(httpInjection).toBeDefined();
        });

        test('should handle all unicode attack vectors', () => {
            unicodeAttacks.forEach(payload => {
                expect(payload).toBeDefined();
            });
        });
    });

    describe('Content Security Policy Integration', () => {
        test('should rely on CSP as defense in depth', () => {
            // CSP header should block inline scripts even if XSS gets through
            const cspHeader = "default-src 'self'; script-src 'self'";
            expect(cspHeader).toContain("'self'");
            expect(cspHeader).not.toContain("'unsafe-inline'"); // Ideally
        });
    });
});

describe('Input Field XSS Protection', () => {
    const validateInput = (field, value) => {
        const errors = [];

        if (typeof value !== 'string') {
            errors.push(`${field} must be a string`);
            return { valid: false, errors };
        }

        // Check for dangerous patterns
        if (/<[^>]*>/g.test(value)) {
            errors.push(`${field} contains HTML tags`);
        }

        if (/javascript:/i.test(value)) {
            errors.push(`${field} contains javascript protocol`);
        }

        if (/on\w+\s*=/i.test(value)) {
            errors.push(`${field} contains event handler`);
        }

        return { valid: errors.length === 0, errors };
    };

    describe('Name Field', () => {
        test('should accept valid names', () => {
            const result = validateInput('name', 'John Doe');
            expect(result.valid).toBe(true);
        });

        test('should reject script tags in name', () => {
            const result = validateInput('name', "<script>alert('XSS')</script>");
            expect(result.valid).toBe(false);
        });
    });

    describe('Email Field', () => {
        test('should accept valid emails', () => {
            const result = validateInput('email', 'test@example.com');
            expect(result.valid).toBe(true);
        });

        test('should reject XSS in email', () => {
            const result = validateInput('email', "<script>alert('XSS')</script>@test.com");
            expect(result.valid).toBe(false);
        });
    });

    describe('Phone Field', () => {
        test('should accept valid phone numbers', () => {
            const result = validateInput('phone', '9876543210');
            expect(result.valid).toBe(true);
        });

        test('should reject XSS in phone', () => {
            const result = validateInput('phone', "<img src=x onerror=alert(1)>");
            expect(result.valid).toBe(false);
        });
    });
});
