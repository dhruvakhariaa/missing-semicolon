module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    setupFilesAfterEnv: ['./tests/setup.js'],
    testTimeout: 30000,
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    collectCoverageFrom: [
        'src/utils/**/*.js',
        'src/middleware/**/*.js',
        '!**/node_modules/**'
    ],
    // Coverage thresholds for security-critical code only
    coverageThreshold: {
        'src/utils/encryption.js': { branches: 70, functions: 80, lines: 80 },
        'src/utils/jwt.js': { branches: 50, functions: 80, lines: 80 },
        'src/utils/passwordChecker.js': { branches: 80, functions: 90, lines: 90 },
        'src/middleware/securityHeaders.js': { functions: 100, lines: 100 }
    }
};
