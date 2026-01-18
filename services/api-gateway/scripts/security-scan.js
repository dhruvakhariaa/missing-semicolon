#!/usr/bin/env node

/**
 * Security Scan Script
 * Runs all security tests and generates a comprehensive report
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI colors for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bold: '\x1b[1m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.bold}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}`)
};

// Security scan results
const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    checks: []
};

// Helper to run command and capture output
function runCommand(command, options = {}) {
    try {
        const output = execSync(command, {
            encoding: 'utf8',
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options
        });
        return { success: true, output };
    } catch (error) {
        return { success: false, error: error.message, output: error.stdout || '' };
    }
}

// Check 1: Run security tests
function runSecurityTests() {
    log.header('🔒 Running Security Tests');

    const result = spawnSync('npm', ['run', 'test:security', '--', '--passWithNoTests'], {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'inherit'
    });

    if (result.status === 0) {
        log.success('All security tests passed');
        results.passed++;
        results.checks.push({ name: 'Security Tests', status: 'PASS' });
    } else {
        log.error('Some security tests failed');
        results.failed++;
        results.checks.push({ name: 'Security Tests', status: 'FAIL' });
    }
}

// Check 2: npm audit
function runNpmAudit() {
    log.header('📦 Running npm audit');

    const result = runCommand('npm audit --json', { silent: true });

    try {
        const audit = JSON.parse(result.output || '{}');
        const vulnerabilities = audit.metadata?.vulnerabilities || {};

        const critical = vulnerabilities.critical || 0;
        const high = vulnerabilities.high || 0;
        const moderate = vulnerabilities.moderate || 0;
        const low = vulnerabilities.low || 0;

        console.log(`  Critical: ${critical}`);
        console.log(`  High: ${high}`);
        console.log(`  Moderate: ${moderate}`);
        console.log(`  Low: ${low}`);

        if (critical > 0 || high > 0) {
            log.error(`Found ${critical} critical and ${high} high vulnerabilities`);
            results.failed++;
            results.checks.push({
                name: 'npm audit',
                status: 'FAIL',
                details: `${critical} critical, ${high} high vulnerabilities`
            });
        } else if (moderate > 0) {
            log.warn(`Found ${moderate} moderate vulnerabilities`);
            results.warnings++;
            results.checks.push({
                name: 'npm audit',
                status: 'WARN',
                details: `${moderate} moderate vulnerabilities`
            });
        } else {
            log.success('No high-severity vulnerabilities found');
            results.passed++;
            results.checks.push({ name: 'npm audit', status: 'PASS' });
        }
    } catch (e) {
        log.warn('Could not parse npm audit output');
        results.warnings++;
    }
}

// Check 3: Environment variables
function checkEnvironmentVariables() {
    log.header('🔑 Checking Environment Variables');

    const requiredVars = [
        'JWT_ACCESS_SECRET',
        'JWT_REFRESH_SECRET',
        'FIELD_ENCRYPTION_KEY'
    ];

    const missing = [];
    const weak = [];

    for (const varName of requiredVars) {
        const value = process.env[varName];
        if (!value) {
            missing.push(varName);
        } else if (value.length < 32) {
            weak.push(varName);
        }
    }

    if (missing.length > 0) {
        log.error(`Missing required variables: ${missing.join(', ')}`);
        results.failed++;
        results.checks.push({
            name: 'Environment Variables',
            status: 'FAIL',
            details: `Missing: ${missing.join(', ')}`
        });
    } else if (weak.length > 0) {
        log.warn(`Weak secrets detected: ${weak.join(', ')}`);
        results.warnings++;
        results.checks.push({
            name: 'Environment Variables',
            status: 'WARN',
            details: `Weak: ${weak.join(', ')}`
        });
    } else {
        log.success('All required environment variables are set');
        results.passed++;
        results.checks.push({ name: 'Environment Variables', status: 'PASS' });
    }
}

// Check 4: Security headers in code
function checkSecurityMiddleware() {
    log.header('🛡️ Checking Security Middleware');

    const indexPath = path.join(process.cwd(), 'src', 'index.js');

    if (!fs.existsSync(indexPath)) {
        log.warn('Could not find src/index.js');
        return;
    }

    const content = fs.readFileSync(indexPath, 'utf8');

    const checks = [
        { name: 'Helmet', pattern: /helmet/i },
        { name: 'Rate Limiter', pattern: /rateLimiter/i },
        { name: 'CORS', pattern: /cors/i },
    ];

    let allPresent = true;

    for (const check of checks) {
        if (check.pattern.test(content)) {
            log.success(`${check.name} middleware found`);
        } else {
            log.error(`${check.name} middleware NOT found`);
            allPresent = false;
        }
    }

    if (allPresent) {
        results.passed++;
        results.checks.push({ name: 'Security Middleware', status: 'PASS' });
    } else {
        results.failed++;
        results.checks.push({ name: 'Security Middleware', status: 'FAIL' });
    }
}

// Check 5: Sensitive data exposure
function checkSensitiveDataExposure() {
    log.header('🔍 Checking for Sensitive Data Exposure');

    const sensitivePatterns = [
        { name: 'Hardcoded passwords', pattern: /password\s*[:=]\s*['"][^'"]+['"]/gi },
        { name: 'Hardcoded API keys', pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi },
        { name: 'Hardcoded secrets', pattern: /secret\s*[:=]\s*['"][^'"]+['"]/gi },
    ];

    const srcDir = path.join(process.cwd(), 'src');
    const issues = [];

    function scanDirectory(dir) {
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                scanDirectory(filePath);
            } else if (file.endsWith('.js')) {
                const content = fs.readFileSync(filePath, 'utf8');

                for (const { name, pattern } of sensitivePatterns) {
                    const matches = content.match(pattern);
                    if (matches) {
                        // Exclude environment variable references
                        const realMatches = matches.filter(m =>
                            !m.includes('process.env') &&
                            !m.includes('test') &&
                            !m.includes('example')
                        );
                        if (realMatches.length > 0) {
                            issues.push({ file: filePath, type: name, count: realMatches.length });
                        }
                    }
                }
            }
        }
    }

    scanDirectory(srcDir);

    if (issues.length > 0) {
        for (const issue of issues) {
            log.warn(`${issue.type} found in ${path.relative(process.cwd(), issue.file)}`);
        }
        results.warnings += issues.length;
        results.checks.push({
            name: 'Sensitive Data Scan',
            status: 'WARN',
            details: `${issues.length} potential issues`
        });
    } else {
        log.success('No obvious sensitive data exposure found');
        results.passed++;
        results.checks.push({ name: 'Sensitive Data Scan', status: 'PASS' });
    }
}

// Generate report
function generateReport() {
    log.header('📊 Security Scan Report');

    console.log(`\n${colors.bold}Summary:${colors.reset}`);
    console.log(`  ${colors.green}✓ Passed:${colors.reset} ${results.passed}`);
    console.log(`  ${colors.yellow}⚠ Warnings:${colors.reset} ${results.warnings}`);
    console.log(`  ${colors.red}✗ Failed:${colors.reset} ${results.failed}`);

    console.log(`\n${colors.bold}Checks:${colors.reset}`);
    for (const check of results.checks) {
        const statusColor = check.status === 'PASS' ? colors.green :
            check.status === 'WARN' ? colors.yellow : colors.red;
        const statusIcon = check.status === 'PASS' ? '✓' :
            check.status === 'WARN' ? '⚠' : '✗';
        console.log(`  ${statusColor}${statusIcon}${colors.reset} ${check.name}${check.details ? ` - ${check.details}` : ''}`);
    }

    // Generate JSON report
    const reportPath = path.join(process.cwd(), 'security-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
            passed: results.passed,
            warnings: results.warnings,
            failed: results.failed
        },
        checks: results.checks
    }, null, 2));

    console.log(`\n${colors.blue}ℹ${colors.reset} Full report saved to: ${reportPath}`);

    // Return exit code
    if (results.failed > 0) {
        console.log(`\n${colors.red}${colors.bold}Security scan FAILED${colors.reset}`);
        return 1;
    } else if (results.warnings > 0) {
        console.log(`\n${colors.yellow}${colors.bold}Security scan completed with warnings${colors.reset}`);
        return 0;
    } else {
        console.log(`\n${colors.green}${colors.bold}Security scan PASSED${colors.reset}`);
        return 0;
    }
}

// Main execution
function main() {
    console.log(`\n${colors.bold}${colors.magenta}🔐 Service Delivery Platform - Security Scanner${colors.reset}`);
    console.log(`${colors.cyan}Running comprehensive security checks...${colors.reset}\n`);

    // Load environment variables
    require('dotenv').config();

    // Run all checks
    checkEnvironmentVariables();
    checkSecurityMiddleware();
    checkSensitiveDataExposure();
    runNpmAudit();
    runSecurityTests();

    // Generate and return report
    const exitCode = generateReport();
    process.exit(exitCode);
}

main();
