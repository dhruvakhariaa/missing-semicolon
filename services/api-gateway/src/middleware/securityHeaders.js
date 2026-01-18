/**
 * Security Headers Middleware
 * Protection against common web vulnerabilities
 */

const securityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Force HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Content Security Policy - Allow inline scripts and Google Fonts for dashboard
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; connect-src 'self';");

    // Don't leak referrer info
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Disable browser features we don't use
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // Prevent caching of sensitive responses
    if (req.path.includes('/api/auth')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }

    next();
};

module.exports = { securityHeaders };
