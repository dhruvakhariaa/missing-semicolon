/**
 * KYC Portal JavaScript
 * Government Identity Verification Flow
 * 
 * Flow: Login → Email OTP → Face Verify (3FA) → KYC (Aadhaar/PAN) → Aadhaar OTP → Success
 * Signup: Register → Face Register (optional) → Login
 */

const API_BASE = '/api';
let accessToken = null;
let kycRequestId = null;
let storedAadhaar = null;
let storedPan = null;
let storedEmail = null;  // For email OTP verification

// Face Auth State
let faceVerifyToken = null;
let faceVerifyUserId = null;
let pendingFaceAuth = false;
let faceVideoStream = null;

// Tab switching
function switchTab(tab) {
    const btns = document.querySelectorAll('.tab-switch button');
    btns.forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
    hideAlerts();
}

// Format Aadhaar with spaces
function formatAadhaar(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 12) value = value.slice(0, 12);
    input.value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
}

// Handle Email OTP input
function handleEmailOtpInput(input, index) {
    const inputs = document.querySelectorAll('.email-otp-input');
    if (input.value && index < 5) {
        inputs[index + 1].focus();
    }
}

// Handle Aadhaar OTP input
function handleOtpInput(input, index) {
    const inputs = document.querySelectorAll('.otp-input');
    if (input.value && index < 5) {
        inputs[index + 1].focus();
    }
}

// Get Email OTP value
function getEmailOtp() {
    const inputs = document.querySelectorAll('.email-otp-input');
    return Array.from(inputs).map(i => i.value).join('');
}

// Get Aadhaar OTP value
function getOtp() {
    const inputs = document.querySelectorAll('.otp-input');
    return Array.from(inputs).map(i => i.value).join('');
}

// Show/hide alerts
function showError(message) {
    const el = document.getElementById('errorAlert');
    el.textContent = message;
    el.classList.add('show');
    document.getElementById('successAlert').classList.remove('show');
}

function showSuccess(message) {
    const el = document.getElementById('successAlert');
    el.textContent = message;
    el.classList.add('show');
    document.getElementById('errorAlert').classList.remove('show');
}

function hideAlerts() {
    document.getElementById('errorAlert').classList.remove('show');
    document.getElementById('successAlert').classList.remove('show');
}

// Section names for extended face auth flow
const SECTIONS = ['section-auth', 'section-email-otp', 'section-face-verify', 'section-face-register', 'section-identity', 'section-otp', 'section-success'];
const STEP_IDS = ['step1', 'step2', 'step3', 'step4'];

// Navigate to section (handles all navigation)
function goToSection(sectionIndex) {
    // Hide all sections
    SECTIONS.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(SECTIONS[sectionIndex]);
    if (targetSection) targetSection.classList.add('active');

    // Update step indicators based on section
    // Mapping: section 0 = step 1, section 1-2 = step 2, section 3 = step 3, section 4 = step 4
    const sectionToStep = [0, 1, 1, 2, 3]; // Which step indicator for each section
    const currentStep = sectionToStep[sectionIndex];

    STEP_IDS.forEach((stepId, i) => {
        const stepEl = document.getElementById(stepId);
        stepEl.classList.remove('active', 'completed');

        if (i < currentStep) {
            stepEl.classList.add('completed');
        } else if (i === currentStep) {
            stepEl.classList.add('active');
        }
    });

    hideAlerts();
}

// Legacy goToStep for backwards compatibility (maps to sections)
function goToStep(step) {
    // Map old step numbers to new section indices
    const stepToSection = { 1: 0, 2: 2, 3: 3, 4: 4 };
    goToSection(stepToSection[step] || step - 1);
}

// Navigate to previous section
function goToPreviousSection(sectionIndex) {
    // Clear OTP fields when going back
    document.querySelectorAll('.email-otp-input').forEach(input => input.value = '');
    document.querySelectorAll('.otp-input').forEach(input => input.value = '');

    goToSection(sectionIndex);
}

// Set loading state
function setLoading(btn, loading) {
    if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// API: Login - Step 1: Send credentials, get OTP sent to email
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');

    if (!email || !password) {
        showError('Please enter email and password');
        return;
    }

    storedEmail = email;  // Store for OTP verification
    setLoading(btn, true);

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success && data.data.pendingOtp) {
            // OTP sent to email - show email OTP section
            document.getElementById('maskedEmail').textContent = storedEmail;  // Show full email
            showSuccess('Verification code sent to your email!');
            // Reset resend state and start cooldown
            resendsRemaining = 3;
            // Notify parent window (live-monitor) of user email for alerts
            if (window.parent !== window) {
                window.parent.postMessage({ userEmail: storedEmail }, '*');
            }
            setTimeout(() => {
                goToSection(1);  // Go to email OTP section
                startResendCooldown(60);  // Start 60 second cooldown
            }, 500);
        } else if (data.success && data.data.accessToken) {
            // Direct login (fallback for old behavior)
            accessToken = data.data.accessToken;
            showSuccess('Login successful!');
            setTimeout(() => goToSection(2), 500);  // Go to identity section
        } else {
            showError(data.error?.message || 'Login failed');
        }
    } catch (err) {
        showError('Connection error. Please try again.');
    }

    setLoading(btn, false);
}

// API: Verify Email OTP - Step 2: Verify email OTP and get tokens
async function verifyEmailOtp() {
    const otp = getEmailOtp();
    const btn = document.getElementById('verifyEmailOtpBtn');

    if (otp.length !== 6) {
        showError('Please enter complete 6-digit verification code');
        return;
    }

    setLoading(btn, true);

    try {
        const res = await fetch(`${API_BASE}/auth/verify-login-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: storedEmail, otp })
        });

        const data = await res.json();

        if (data.success) {
            // Check if face auth is required (3FA)
            if (data.data.pendingFaceAuth) {
                // Store face verification token for 3FA
                faceVerifyToken = data.data.faceVerifyToken;
                faceVerifyUserId = data.data.userId;
                pendingFaceAuth = true;
                showSuccess('Email verified! Face verification required...');
                setTimeout(() => goToSection(2), 500);  // Go to face verify section
            } else {
                // No face auth - proceed directly to KYC
                accessToken = data.data.accessToken;
                showSuccess('Email verified! Proceeding to KYC...');
                setTimeout(() => goToSection(4), 500);  // Go to identity section (index 4)
            }
        } else {
            showError(data.error?.message || 'Invalid verification code');
        }
    } catch (err) {
        showError('Connection error. Please try again.');
    }

    setLoading(btn, false);
}

// Resend OTP countdown timer
let resendCooldown = 0;
let resendInterval = null;
let resendsRemaining = 3;

function startResendCooldown(seconds = 60) {
    resendCooldown = seconds;
    const countdownEl = document.getElementById('resendCountdown');
    const timerEl = document.getElementById('resendTimer');
    const resendBtn = document.getElementById('resendOtpBtn');

    // Hide resend button during cooldown
    resendBtn.style.display = 'none';
    timerEl.style.display = 'block';

    if (resendInterval) clearInterval(resendInterval);

    resendInterval = setInterval(() => {
        resendCooldown--;
        if (resendCooldown <= 0) {
            clearInterval(resendInterval);
            // Show resend button
            if (resendsRemaining > 0) {
                timerEl.style.display = 'none';
                resendBtn.style.display = 'block';
            } else {
                countdownEl.textContent = 'No resends remaining';
            }
        } else {
            countdownEl.textContent = `Wait ${resendCooldown}s`;
        }
    }, 1000);
}

// API: Resend OTP to email
async function resendEmailOtp() {
    const btn = document.getElementById('resendOtpBtn');

    if (resendsRemaining <= 0) {
        showError('Maximum resend attempts reached. Please login again.');
        return;
    }

    setLoading(btn, true);

    try {
        const res = await fetch(`${API_BASE}/auth/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: storedEmail })
        });

        const data = await res.json();

        if (data.success) {
            resendsRemaining = data.data.resendsRemaining;
            document.getElementById('resendsRemaining').textContent = `(${resendsRemaining} remaining)`;
            showSuccess('New verification code sent to your email!');
            // Clear OTP inputs
            document.querySelectorAll('.email-otp-input').forEach(input => input.value = '');
            document.querySelectorAll('.email-otp-input')[0].focus();
            // Start cooldown
            startResendCooldown(60);
        } else {
            showError(data.error?.message || 'Failed to resend code');
        }
    } catch (err) {
        showError('Connection error. Please try again.');
    }

    setLoading(btn, false);
}

// API: Signup
async function handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const btn = document.getElementById('signupBtn');

    if (!name || !email || !password) {
        showError('Please fill all fields');
        return;
    }

    setLoading(btn, true);

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (data.success) {
            // Store token for face registration
            accessToken = data.data.accessToken;
            storedEmail = email;
            showSuccess('Account created! Register your face for 3FA security.');
            // Navigate to face registration section
            setTimeout(() => goToSection(3), 500);  // Go to face register section (index 3)
        } else {
            showError(data.error?.message || 'Registration failed');
        }
    } catch (err) {
        showError('Connection error. Please try again.');
    }

    setLoading(btn, false);
}

// API: Initiate KYC - Step 3: Send Aadhaar/PAN for OTP
async function initiateKyc() {
    const aadhaar = document.getElementById('aadhaarNumber').value.replace(/\s/g, '');
    const pan = document.getElementById('panNumber').value.toUpperCase();
    const btn = document.getElementById('initiateKycBtn');

    if (aadhaar.length !== 12) {
        showError('Aadhaar must be 12 digits');
        return;
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
        showError('Invalid PAN format (e.g., ABCDE1234F)');
        return;
    }

    storedAadhaar = aadhaar;
    storedPan = pan;

    setLoading(btn, true);

    try {
        const res = await fetch(`${API_BASE}/kyc/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ aadhaarNumber: aadhaar })
        });

        const data = await res.json();

        if (data.success) {
            kycRequestId = data.data.request_id;
            document.getElementById('maskedMobile').textContent = data.data.masked_mobile;
            showSuccess('OTP sent to your Aadhaar-linked mobile!');
            setTimeout(() => goToSection(3), 500);  // Go to Aadhaar OTP section
        } else {
            showError(data.error?.message || 'Failed to send OTP');
        }
    } catch (err) {
        showError('Connection error. Please try again.');
    }

    setLoading(btn, false);
}

// API: Verify KYC - Step 4: Verify Aadhaar OTP
async function verifyKyc() {
    const otp = getOtp();
    const btn = document.getElementById('verifyKycBtn');

    if (otp.length !== 6) {
        showError('Please enter complete 6-digit OTP');
        return;
    }

    setLoading(btn, true);

    try {
        const res = await fetch(`${API_BASE}/kyc/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                aadhaarNumber: storedAadhaar,
                panNumber: storedPan,
                otp: otp,
                requestId: kycRequestId
            })
        });

        const data = await res.json();

        if (data.success) {
            document.getElementById('nameSimilarity').textContent =
                data.data.nameMatch.similarity + '%';
            document.getElementById('kycBadge').textContent =
                `KYC Level ${data.data.kycLevel} ✓`;
            goToSection(4);  // Go to success section
        } else {
            showError(data.error?.message || 'Verification failed');
        }
    } catch (err) {
        showError('Connection error. Please try again.');
    }

    setLoading(btn, false);
}

// Initialize event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Tab switch buttons
    document.querySelectorAll('.tab-switch button').forEach((btn, index) => {
        btn.addEventListener('click', function () {
            switchTab(index === 0 ? 'login' : 'signup');
        });
    });

    // Login button
    document.getElementById('loginBtn').addEventListener('click', handleLogin);

    // Signup button
    document.getElementById('signupBtn').addEventListener('click', handleSignup);

    // Email OTP inputs - auto-advance
    document.querySelectorAll('.email-otp-input').forEach((input, index) => {
        input.addEventListener('input', function () {
            handleEmailOtpInput(this, index);
        });
    });

    // Verify Email OTP button
    document.getElementById('verifyEmailOtpBtn').addEventListener('click', verifyEmailOtp);

    // Resend OTP button
    document.getElementById('resendOtpBtn').addEventListener('click', resendEmailOtp);

    // Back from Email OTP to Login
    document.getElementById('backToLoginFromEmailOtp').addEventListener('click', function () {
        goToPreviousSection(0);
    });

    // Aadhaar input formatting
    document.getElementById('aadhaarNumber').addEventListener('input', function () {
        formatAadhaar(this);
    });

    // Initiate KYC button
    document.getElementById('initiateKycBtn').addEventListener('click', initiateKyc);

    // Aadhaar OTP inputs - auto-advance
    document.querySelectorAll('.otp-input').forEach((input, index) => {
        input.addEventListener('input', function () {
            handleOtpInput(this, index);
        });
    });

    // Verify KYC button
    document.getElementById('verifyKycBtn').addEventListener('click', verifyKyc);

    // Go Back buttons
    document.getElementById('backToLoginBtn').addEventListener('click', function () {
        goToPreviousSection(1);  // Go back to email OTP section (or auth if no email OTP)
    });

    document.getElementById('backToIdentityBtn').addEventListener('click', function () {
        goToPreviousSection(4);  // Go back to identity input (now index 4)
    });

    // Face Auth Event Listeners
    // NOTE: Face registration is handled by inline script in kyc.html for reliability
    document.getElementById('startFaceVerifyBtn')?.addEventListener('click', startFaceVerification);
    document.getElementById('retryFaceVerifyBtn')?.addEventListener('click', retryFaceVerification);
    document.getElementById('skipFaceVerifyBtn')?.addEventListener('click', skipFaceVerification);
    // startFaceRegisterBtn is handled by inline script in kyc.html
    document.getElementById('skipFaceRegisterBtn')?.addEventListener('click', skipFaceRegistration);
});

// ============================================================
// Face Authentication Functions
// ============================================================

// Stop any running video stream
function stopVideoStream() {
    if (faceVideoStream) {
        faceVideoStream.getTracks().forEach(track => track.stop());
        faceVideoStream = null;
    }
}

// Start face verification process
async function startFaceVerification() {
    const btn = document.getElementById('startFaceVerifyBtn');
    const video = document.getElementById('faceVerifyVideo');
    const canvas = document.getElementById('faceVerifyCanvas');
    const overlay = document.getElementById('faceVerifyOverlay');
    const statusEl = document.getElementById('faceVerifyStatus');

    setLoading(btn, true);
    hideAlerts();

    try {
        // Start camera
        faceVideoStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' }
        });
        video.srcObject = faceVideoStream;
        await video.play();

        // Set canvas dimensions
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Wait for user to position face
        statusEl.textContent = 'Position your face...';
        overlay.style.display = 'block';
        await sleep(2000);

        // Capture frame
        statusEl.textContent = 'Capturing...';
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = canvas.toDataURL('image/jpeg', 0.9);

        // Verify with API
        statusEl.textContent = 'Verifying face...';
        const verifyRes = await fetch(`${API_BASE}/face/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image,
                userId: faceVerifyUserId,
                faceVerifyToken
            })
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success && verifyData.data?.verified) {
            // Face verified - complete login
            statusEl.textContent = 'Face verified! Completing login...';

            const completeRes = await fetch(`${API_BASE}/auth/complete-face-auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: faceVerifyUserId,
                    faceVerifyToken
                })
            });

            const completeData = await completeRes.json();

            if (completeData.success) {
                accessToken = completeData.data.accessToken;
                stopVideoStream();
                showSuccess('3FA Login successful! Proceeding to KYC...');
                setTimeout(() => goToSection(4), 500);  // Go to identity section
            } else {
                throw new Error(completeData.error?.message || 'Login failed');
            }
        } else {
            throw new Error(verifyData.error?.message || 'Face verification failed');
        }
    } catch (err) {
        stopVideoStream();
        overlay.style.display = 'none';
        showError(err.message || 'Face verification failed. Please try again.');
        document.getElementById('retryFaceVerifyBtn').style.display = 'block';
    }

    setLoading(btn, false);
}

// Retry face verification
function retryFaceVerification() {
    document.getElementById('retryFaceVerifyBtn').style.display = 'none';
    document.getElementById('faceVerifyOverlay').style.display = 'none';
    startFaceVerification();
}

// Skip face verification (proceed without face auth for this login)
function skipFaceVerification() {
    stopVideoStream();
    // This will only work if the backend allows skipping (which it doesn't normally)
    // For demo purposes, show an error explaining face auth is required
    showError('Face verification is required for accounts with 3FA enabled. Please complete face verification.');
}

// Start face registration after signup
async function startFaceRegistration() {
    const btn = document.getElementById('startFaceRegisterBtn');
    const video = document.getElementById('faceRegisterVideo');
    const canvas = document.getElementById('faceRegisterCanvas');
    const overlay = document.getElementById('faceRegisterOverlay');
    const statusEl = document.getElementById('faceRegisterStatus');
    const progressEl = document.getElementById('captureProgress');
    const countEl = document.getElementById('captureCount');

    // Check if we have an access token
    if (!accessToken) {
        showError('Session expired. Please sign up again.');
        setTimeout(() => goToSection(0), 1000);
        return;
    }

    setLoading(btn, true);
    hideAlerts();
    overlay.style.display = 'block';
    progressEl.style.display = 'block';

    try {
        // Use FaceRegistration module if available, otherwise fallback
        if (window.FaceRegistration) {
            await window.FaceRegistration.init(video, canvas);

            statusEl.textContent = 'Starting camera...';
            await window.FaceRegistration.startCamera();

            statusEl.textContent = 'Camera ready! Get ready to capture 5 positions...';
            await sleep(2000);

            // Capture all 5 positions with guided instructions
            const images = await window.FaceRegistration.captureAllPositions(
                (msg) => { statusEl.textContent = msg; },
                (count) => { countEl.textContent = count; }
            );

            console.log('All images captured:', images.length);

            // Stop camera
            window.FaceRegistration.stopCamera();

            // Send to API
            statusEl.textContent = 'Processing face data...';

            const res = await fetch(`${API_BASE}/face/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ images })
            });

            const data = await res.json();
            console.log('Face registration response:', data);

            if (data.success) {
                showSuccess('🎉 Face registered! 3FA is now enabled. Please login.');
                if (storedEmail) {
                    document.getElementById('loginEmail').value = storedEmail;
                }
                setTimeout(() => {
                    goToSection(0);
                    switchTab('login');
                }, 2000);
            } else {
                throw new Error(data.error?.message || 'Face registration failed');
            }
        } else {
            // Fallback: simple capture without module
            statusEl.textContent = 'Starting camera...';

            faceVideoStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            video.srcObject = faceVideoStream;

            await new Promise((resolve, reject) => {
                video.onloadedmetadata = () => video.play().then(resolve).catch(reject);
                setTimeout(() => reject(new Error('Timeout')), 10000);
            });

            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;

            const images = [];
            const ctx = canvas.getContext('2d');
            const positions = ['Front 😐', 'Left 👈', 'Right 👉', 'Up 👆', 'Down 👇'];

            for (let i = 0; i < 5; i++) {
                statusEl.textContent = `Position ${i + 1}: ${positions[i]} - Hold for 3 seconds...`;
                countEl.textContent = i;
                await sleep(3000);

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const img = canvas.toDataURL('image/jpeg', 0.8);
                images.push(img);
                countEl.textContent = i + 1;
            }

            stopVideoStream();

            statusEl.textContent = 'Processing...';
            const res = await fetch(`${API_BASE}/face/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ images })
            });

            const data = await res.json();
            if (data.success) {
                showSuccess('Face registered! 3FA enabled.');
                setTimeout(() => { goToSection(0); switchTab('login'); }, 1500);
            } else {
                throw new Error(data.error?.message || 'Registration failed');
            }
        }
    } catch (err) {
        console.error('Face registration error:', err);
        if (window.FaceRegistration) window.FaceRegistration.stopCamera();
        stopVideoStream();
        overlay.style.display = 'none';
        progressEl.style.display = 'none';
        showError(err.message || 'Face registration failed. Please try again.');
    }

    setLoading(btn, false);
}

// Skip face registration - continue to login
function skipFaceRegistration() {
    stopVideoStream();
    showSuccess('Face registration skipped. You can register later.');
    setTimeout(() => {
        goToSection(0);  // Go back to login
        switchTab('login');
    }, 1000);
}

// Utility: Sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
