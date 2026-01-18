/**
 * KYC Service - Aadhaar & PAN Verification via Razorpay
 * 
 * This service handles:
 * 1. Aadhaar OTP initiation and verification
 * 2. PAN card validation
 * 3. Identity name matching (Aadhaar vs PAN)
 * 
 * Security: All identity data is encrypted using AES-256-GCM before storage.
 */

const logger = require('../utils/logger');

// Razorpay Configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate Aadhaar number format (12 digits)
 */
function validateAadhaarFormat(aadhaar) {
    if (!aadhaar || typeof aadhaar !== 'string') return false;
    const cleaned = aadhaar.replace(/\s/g, '');
    return /^\d{12}$/.test(cleaned);
}

/**
 * Validate PAN number format (XXXXX0000X)
 */
function validatePanFormat(pan) {
    if (!pan || typeof pan !== 'string') return false;
    const cleaned = pan.toUpperCase().trim();
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleaned);
}

// ============================================
// FUZZY NAME MATCHING (Levenshtein Distance)
// ============================================

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }
    return dp[m][n];
}

/**
 * Calculate name similarity score (0-100%)
 */
function calculateNameSimilarity(name1, name2) {
    if (!name1 || !name2) return 0;

    // Normalize: uppercase, remove extra spaces, remove common prefixes
    const normalize = (name) => {
        return name
            .toUpperCase()
            .replace(/\s+/g, ' ')
            .replace(/\b(MR|MRS|MS|DR|SHRI|SMT|KUMAR|KUMARI)\b/g, '')
            .trim();
    };

    const normalized1 = normalize(name1);
    const normalized2 = normalize(name2);

    if (normalized1 === normalized2) return 100;

    const distance = levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;

    return Math.round(similarity);
}

/**
 * Check if two names match sufficiently (>= 85% similarity)
 */
function namesMatch(aadhaarName, panName, threshold = 85) {
    const similarity = calculateNameSimilarity(aadhaarName, panName);
    logger.info(`Name matching: "${aadhaarName}" vs "${panName}" => ${similarity}% similarity`);
    return {
        match: similarity >= threshold,
        similarity,
        aadhaarName,
        panName
    };
}

// ============================================
// RAZORPAY API INTEGRATION (MOCK FOR TEST MODE)
// ============================================

/**
 * Initiate Aadhaar OTP verification
 * In production, this calls Razorpay's /kyc/aadhaar/otp endpoint
 */
async function initiateAadhaarOtp(aadhaarNumber) {
    if (!validateAadhaarFormat(aadhaarNumber)) {
        throw new Error('Invalid Aadhaar format. Must be 12 digits.');
    }

    logger.info(`Initiating Aadhaar OTP for: XXXX-XXXX-${aadhaarNumber.slice(-4)}`);

    // TEST MODE: Simulate Razorpay response
    // In production, replace with actual API call
    if (process.env.NODE_ENV !== 'production' || !RAZORPAY_KEY_ID) {
        return {
            success: true,
            request_id: `req_${Date.now()}_test`,
            message: 'OTP sent to registered mobile number (TEST MODE)',
            masked_mobile: 'XXXXXX9876'
        };
    }

    // PRODUCTION: Call Razorpay API
    // const response = await fetch(`${RAZORPAY_BASE_URL}/kyc/aadhaar/otp`, {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ aadhaar_number: aadhaarNumber })
    // });
    // return await response.json();
}

/**
 * Verify Aadhaar OTP and get identity data
 * 
 * DEMO SCENARIOS (based on last 4 digits of Aadhaar):
 * - Ends with 1111: Perfect match (VARUN PATEL)
 * - Ends with 2222: Minor mismatch (VARUN KUMAR PATEL) - will pass fuzzy match
 * - Ends with 3333: FRAUD - Different person (SURESH SHARMA) - will fail
 * - Ends with 4444: FRAUD - Completely different (PRIYA SINGH) - will fail
 * - Default: Normal scenario (VARUN PATEL)
 */
async function verifyAadhaarOtp(requestId, otp, aadhaarNumber = '') {
    if (!otp || otp.length !== 6) {
        throw new Error('Invalid OTP format. Must be 6 digits.');
    }

    logger.info(`Verifying Aadhaar OTP for request: ${requestId}`);

    // TEST MODE: Simulate verification with different scenarios
    if (process.env.NODE_ENV !== 'production' || !RAZORPAY_KEY_ID) {
        // Determine scenario based on Aadhaar ending
        const lastFour = aadhaarNumber.slice(-4);
        let aadhaarName = 'VARUN PATEL'; // Default

        // Demo scenarios for testing fraud detection
        if (lastFour === '1111') {
            aadhaarName = 'VARUN PATEL';  // Perfect match
            logger.info('DEMO: Scenario 1 - Perfect match');
        } else if (lastFour === '2222') {
            aadhaarName = 'VARUN KUMAR PATEL';  // Minor variation - will pass
            logger.info('DEMO: Scenario 2 - Minor name variation (should PASS)');
        } else if (lastFour === '3333') {
            aadhaarName = 'SURESH SHARMA';  // Different person - FRAUD
            logger.info('DEMO: Scenario 3 - FRAUD DETECTED (different person)');
        } else if (lastFour === '4444') {
            aadhaarName = 'PRIYA SINGH';  // Completely different - FRAUD
            logger.info('DEMO: Scenario 4 - FRAUD DETECTED (completely different person)');
        }

        return {
            success: true,
            verified: true,
            aadhaar_data: {
                name: aadhaarName,
                dob: '1995-05-10',
                gender: lastFour === '4444' ? 'F' : 'M',
                address: 'Gujarat, India',
                masked_aadhaar: `XXXX-XXXX-${lastFour || '1234'}`
            }
        };
    }

    // PRODUCTION: Call Razorpay verification API
}

/**
 * Validate PAN card and get holder name
 */
async function validatePan(panNumber) {
    if (!validatePanFormat(panNumber)) {
        throw new Error('Invalid PAN format. Must be like ABCDE1234F.');
    }

    logger.info(`Validating PAN: ${panNumber.slice(0, 2)}XXX${panNumber.slice(-2)}`);

    // TEST MODE: Simulate PAN validation
    if (process.env.NODE_ENV !== 'production' || !RAZORPAY_KEY_ID) {
        return {
            success: true,
            valid: true,
            pan_data: {
                name: 'VARUN P PATEL',  // This would come from NSDL
                pan: panNumber.toUpperCase(),
                status: 'VALID'
            }
        };
    }

    // PRODUCTION: Call Razorpay PAN verification API
}

// ============================================
// COMPLETE KYC VERIFICATION FLOW
// ============================================

/**
 * Complete KYC verification: Aadhaar + PAN + Name Matching
 */
async function performKycVerification(user, aadhaarNumber, panNumber, otp, requestId) {
    const results = {
        aadhaar: null,
        pan: null,
        nameMatch: null,
        success: false,
        kycLevel: 0
    };

    try {
        // Step 1: Verify Aadhaar OTP
        const aadhaarResult = await verifyAadhaarOtp(requestId, otp, aadhaarNumber);
        if (!aadhaarResult.verified) {
            throw new Error('Aadhaar OTP verification failed');
        }
        results.aadhaar = aadhaarResult.aadhaar_data;

        // Step 2: Validate PAN
        const panResult = await validatePan(panNumber);
        if (!panResult.valid) {
            throw new Error('PAN validation failed');
        }
        results.pan = panResult.pan_data;

        // Step 3: Cross-check names (Fuzzy matching)
        const nameMatchResult = namesMatch(
            results.aadhaar.name,
            results.pan.name
        );
        results.nameMatch = nameMatchResult;

        if (!nameMatchResult.match) {
            throw new Error(`Identity mismatch: Aadhaar name "${results.aadhaar.name}" does not match PAN name "${results.pan.name}" (${nameMatchResult.similarity}% similarity)`);
        }

        // Step 4: Update user KYC level
        logger.info(`Updating KYC for user ${user.email}: Setting Aadhaar and PAN...`);
        user.setAadhaarNumber(aadhaarNumber);
        user.setPanNumber(panNumber);
        user.aadhaarVerified = true;
        user.panVerified = true;
        user.kycLevel = 2; // Fully verified

        logger.info(`Saving user to MongoDB: kycLevel=${user.kycLevel}, aadhaarVerified=${user.aadhaarVerified}, panVerified=${user.panVerified}`);
        const savedUser = await user.save();
        logger.info(`User saved successfully! New kycLevel: ${savedUser.kycLevel}`);

        results.success = true;
        results.kycLevel = 2;

        logger.info(`KYC completed for user ${user.email}: Level ${results.kycLevel}`);

    } catch (error) {
        logger.error(`KYC verification failed: ${error.message}`);
        results.error = error.message;
    }

    return results;
}

module.exports = {
    validateAadhaarFormat,
    validatePanFormat,
    calculateNameSimilarity,
    namesMatch,
    initiateAadhaarOtp,
    verifyAadhaarOtp,
    validatePan,
    performKycVerification
};
