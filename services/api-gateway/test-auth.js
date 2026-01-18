/**
 * Authentication Test Script
 * 
 * Tests all security features we implemented:
 * 1. Password hashing (Argon2id/bcrypt)
 * 2. Field encryption (AES-256-GCM)
 * 3. JWT token generation and verification
 * 4. Password strength validation
 * 
 * Run with: node test-auth.js
 */

require('dotenv').config();

// Set test environment variables if not set
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret-for-testing-only-change-in-production-64bytes';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-for-testing-only-change-in-production-64bytes';
process.env.FIELD_ENCRYPTION_KEY = process.env.FIELD_ENCRYPTION_KEY || 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';

const { hashPassword, verifyPassword, validatePasswordStrength } = require('./src/utils/password');
const { encryptField, decryptField, generateSecureToken } = require('./src/utils/encryption');
const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, hasPermission } = require('./src/utils/jwt');

console.log('\n' + '='.repeat(60));
console.log('🔐 AUTHENTICATION SECURITY TEST');
console.log('='.repeat(60) + '\n');

async function runTests() {
    let passed = 0;
    let failed = 0;

    // =============================================
    // TEST 1: Password Strength Validation
    // =============================================
    console.log('📋 TEST 1: Password Strength Validation');
    console.log('-'.repeat(40));

    // Weak password
    const weakResult = validatePasswordStrength('password');
    console.log('  Weak password "password":');
    console.log(`    Valid: ${weakResult.valid ? '❌ (should be false)' : '✅ (correctly rejected)'}`);
    console.log(`    Errors: ${weakResult.errors.join(', ')}`);
    if (!weakResult.valid) passed++; else failed++;

    // Strong password
    const strongResult = validatePasswordStrength('SecurePass@123');
    console.log('  Strong password "SecurePass@123":');
    console.log(`    Valid: ${strongResult.valid ? '✅ (accepted)' : '❌ (should be valid)'}`);
    if (strongResult.valid) passed++; else failed++;

    console.log();

    // =============================================
    // TEST 2: Password Hashing
    // =============================================
    console.log('🔑 TEST 2: Password Hashing (Argon2id/bcrypt)');
    console.log('-'.repeat(40));

    const password = 'MySecurePassword@123';
    console.log(`  Original password: "${password}"`);

    const startHash = Date.now();
    const hashedPassword = await hashPassword(password);
    const hashTime = Date.now() - startHash;

    console.log(`  Hashed password: "${hashedPassword.substring(0, 50)}..."`);
    console.log(`  Hash time: ${hashTime}ms (intentionally slow for security)`);

    // Verify correct password
    const correctVerify = await verifyPassword(password, hashedPassword);
    console.log(`  Verify correct password: ${correctVerify ? '✅ MATCH' : '❌ FAILED'}`);
    if (correctVerify) passed++; else failed++;

    // Verify wrong password
    const wrongVerify = await verifyPassword('WrongPassword', hashedPassword);
    console.log(`  Verify wrong password: ${!wrongVerify ? '✅ REJECTED (correct behavior)' : '❌ ACCEPTED (security issue!)'}`);
    if (!wrongVerify) passed++; else failed++;

    console.log();

    // =============================================
    // TEST 3: Field Encryption (AES-256-GCM)
    // =============================================
    console.log('🔒 TEST 3: Field Encryption (AES-256-GCM)');
    console.log('-'.repeat(40));

    const panNumber = 'ABCDE1234F';
    console.log(`  Original PAN: "${panNumber}"`);

    const encryptedPAN = encryptField(panNumber);
    console.log(`  Encrypted PAN: "${encryptedPAN}"`);
    console.log(`  (Format: IV:AuthTag:EncryptedData)`);

    const decryptedPAN = decryptField(encryptedPAN);
    console.log(`  Decrypted PAN: "${decryptedPAN}"`);

    const encryptionWorks = decryptedPAN === panNumber;
    console.log(`  Encryption/Decryption: ${encryptionWorks ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (encryptionWorks) passed++; else failed++;

    // Verify each encryption is unique (random IV)
    const encryptedPAN2 = encryptField(panNumber);
    const uniqueEncryption = encryptedPAN !== encryptedPAN2;
    console.log(`  Unique encryption each time: ${uniqueEncryption ? '✅ YES (secure)' : '❌ NO (insecure!)'}`);
    if (uniqueEncryption) passed++; else failed++;

    console.log();

    // =============================================
    // TEST 4: JWT Token Generation & SSO
    // =============================================
    console.log('🎫 TEST 4: JWT Token Generation (SSO)');
    console.log('-'.repeat(40));

    // Mock user with SSO permissions
    const mockUser = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'varun@example.com',
        role: 'citizen',
        kycLevel: 1,
        permissions: {
            healthcare: ['read', 'book_appointment'],
            agriculture: ['read', 'request_advisory'],
            urban: ['read', 'file_complaint']
        }
    };

    console.log('  User:', mockUser.email);
    console.log('  Role:', mockUser.role);
    console.log('  Permissions:');
    console.log('    - Healthcare:', mockUser.permissions.healthcare.join(', '));
    console.log('    - Agriculture:', mockUser.permissions.agriculture.join(', '));
    console.log('    - Urban:', mockUser.permissions.urban.join(', '));

    // Generate access token
    const accessToken = generateAccessToken(mockUser);
    console.log(`\n  Access Token: ${accessToken.substring(0, 50)}...`);
    console.log(`  Token length: ${accessToken.length} characters`);

    // Verify access token
    const verifyResult = verifyAccessToken(accessToken);
    console.log(`  Token valid: ${verifyResult.valid ? '✅ YES' : '❌ NO'}`);
    if (verifyResult.valid) passed++; else failed++;

    if (verifyResult.valid) {
        console.log(`  Decoded userId: ${verifyResult.payload.userId}`);
        console.log(`  Decoded role: ${verifyResult.payload.role}`);
    }

    // Test SSO permissions
    console.log('\n  🔗 SSO Permission Checks:');
    const canBookHealthcare = hasPermission(verifyResult.payload, 'healthcare', 'book_appointment');
    const canFileComplaint = hasPermission(verifyResult.payload, 'urban', 'file_complaint');
    const canAdminHealthcare = hasPermission(verifyResult.payload, 'healthcare', 'admin');

    console.log(`    Can book healthcare appointment: ${canBookHealthcare ? '✅ YES' : '❌ NO'}`);
    console.log(`    Can file urban complaint: ${canFileComplaint ? '✅ YES' : '❌ NO'}`);
    console.log(`    Can admin healthcare (should fail): ${!canAdminHealthcare ? '✅ DENIED (correct)' : '❌ ALLOWED (wrong!)'}`);

    if (canBookHealthcare && canFileComplaint && !canAdminHealthcare) passed++; else failed++;

    console.log();

    // =============================================
    // TEST 5: Refresh Token
    // =============================================
    console.log('🔄 TEST 5: Refresh Token');
    console.log('-'.repeat(40));

    const { token: refreshToken, expiresAt } = generateRefreshToken(mockUser);
    console.log(`  Refresh Token: ${refreshToken.substring(0, 50)}...`);
    console.log(`  Expires At: ${expiresAt.toISOString()}`);

    const refreshVerify = verifyRefreshToken(refreshToken);
    console.log(`  Refresh token valid: ${refreshVerify.valid ? '✅ YES' : '❌ NO'}`);
    if (refreshVerify.valid) passed++; else failed++;

    console.log();

    // =============================================
    // TEST 6: Invalid Token Detection
    // =============================================
    console.log('🚫 TEST 6: Invalid Token Detection');
    console.log('-'.repeat(40));

    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.invalid';
    const invalidResult = verifyAccessToken(invalidToken);
    console.log(`  Invalid token rejected: ${!invalidResult.valid ? '✅ YES (correct)' : '❌ NO (security issue!)'}`);
    console.log(`  Error message: "${invalidResult.error}"`);
    if (!invalidResult.valid) passed++; else failed++;

    console.log();

    // =============================================
    // TEST 7: Secure Token Generation
    // =============================================
    console.log('🎲 TEST 7: Secure Random Token Generation');
    console.log('-'.repeat(40));

    const token1 = generateSecureToken(32);
    const token2 = generateSecureToken(32);
    console.log(`  Token 1: ${token1}`);
    console.log(`  Token 2: ${token2}`);
    console.log(`  Tokens are unique: ${token1 !== token2 ? '✅ YES' : '❌ NO (insecure!)'}`);
    console.log(`  Token length: ${token1.length} hex chars (${token1.length / 2} bytes)`);
    if (token1 !== token2 && token1.length === 64) passed++; else failed++;

    console.log();

    // =============================================
    // Summary
    // =============================================
    console.log('='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  Total: ${passed + failed}`);
    console.log();

    if (failed === 0) {
        console.log('🎉 ALL TESTS PASSED! Authentication system is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Please check the errors above.');
    }

    console.log('\n' + '='.repeat(60));
    console.log('📝 NEXT STEPS:');
    console.log('='.repeat(60));
    console.log('1. Start MongoDB: docker-compose up mongodb');
    console.log('2. Start Redis: docker-compose up redis');
    console.log('3. Create .env file with your secrets');
    console.log('4. Run: cd services/api-gateway && npm run dev');
    console.log('5. Test API endpoints with curl or Postman');
    console.log('='.repeat(60) + '\n');
}

// Run tests
runTests().catch(console.error);
