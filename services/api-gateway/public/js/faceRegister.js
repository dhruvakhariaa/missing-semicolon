/**
 * Face Registration Handler - External JS to bypass CSP
 * Handles 5-position face capture: Front, Left, Right, Up, Down
 */

(function () {
    'use strict';

    const positions = [
        { name: 'Front', icon: '😐', msg: 'Look straight at the camera' },
        { name: 'Left', icon: '👈', msg: 'Turn head slightly LEFT' },
        { name: 'Right', icon: '👉', msg: 'Turn head slightly RIGHT' },
        { name: 'Up', icon: '👆', msg: 'Tilt head slightly UP' },
        { name: 'Down', icon: '👇', msg: 'Tilt head DOWN' }
    ];

    let stream = null;

    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    async function doFaceRegistration() {
        const video = document.getElementById('faceRegisterVideo');
        const canvas = document.getElementById('faceRegisterCanvas');
        const overlay = document.getElementById('faceRegisterOverlay');
        const statusEl = document.getElementById('faceRegisterStatus');
        const progressEl = document.getElementById('captureProgress');
        const countEl = document.getElementById('captureCount');
        const btn = document.getElementById('startFaceRegisterBtn');

        console.log('🚀 Face registration started');

        // Get access token from kyc.js global
        if (typeof accessToken === 'undefined' || !accessToken) {
            alert('Session expired. Please sign up again.');
            location.reload();
            return;
        }

        console.log('✓ Access token found');

        btn.disabled = true;
        btn.classList.add('loading');
        overlay.style.display = 'block';
        progressEl.style.display = 'block';
        countEl.textContent = '0';

        try {
            // Start camera
            statusEl.textContent = '📷 Starting camera...';
            console.log('📷 Requesting camera access...');

            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            video.srcObject = stream;
            console.log('✓ Camera stream obtained');

            // Wait for video ready
            await new Promise((res, rej) => {
                video.onloadedmetadata = () => {
                    video.play().then(() => {
                        console.log('✓ Video playing');
                        res();
                    }).catch(rej);
                };
                setTimeout(() => rej(new Error('Camera timeout')), 10000);
            });

            // Setup canvas
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            console.log(`✓ Canvas ready: ${canvas.width}x${canvas.height}`);

            statusEl.textContent = '✅ Camera ready! Prepare for 5 positions...';
            await sleep(2000);

            // Capture 5 positions
            const images = [];
            for (let i = 0; i < 5; i++) {
                const pos = positions[i];

                // Show position instruction
                statusEl.textContent = `${pos.icon} ${pos.msg}`;
                await sleep(1500);

                // Countdown
                for (let c = 3; c > 0; c--) {
                    statusEl.textContent = `${pos.icon} ${pos.name}: ${c}...`;
                    await sleep(700);
                }

                // Capture
                statusEl.textContent = `📸 Capturing ${pos.name}...`;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const img = canvas.toDataURL('image/jpeg', 0.75);

                if (img && img.length > 5000) {
                    images.push(img);
                    countEl.textContent = i + 1;
                    console.log(`✓ Captured ${pos.name}: ${img.length} bytes`);
                } else {
                    throw new Error(`Failed to capture ${pos.name}`);
                }

                await sleep(400);
            }

            // Stop camera
            stream.getTracks().forEach(t => t.stop());
            stream = null;
            console.log('✓ Camera stopped');

            // Send to API
            statusEl.textContent = '⏳ Processing face data...';
            console.log('📤 Sending', images.length, 'images to API...');

            const res = await fetch('/api/face/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accessToken
                },
                body: JSON.stringify({ images: images })
            });

            const data = await res.json();
            console.log('📥 API Response:', data);

            if (data.success) {
                statusEl.textContent = '🎉 Face registered successfully!';
                if (typeof showSuccess === 'function') {
                    showSuccess('Face registered! 3FA is now enabled. Please login.');
                }
                setTimeout(() => {
                    if (typeof goToSection === 'function') goToSection(0);
                    if (typeof switchTab === 'function') switchTab('login');
                    if (typeof storedEmail !== 'undefined' && storedEmail) {
                        const emailEl = document.getElementById('loginEmail');
                        if (emailEl) emailEl.value = storedEmail;
                    }
                }, 2000);
            } else {
                throw new Error(data.error?.message || 'Registration failed');
            }
        } catch (err) {
            console.error('❌ Face registration error:', err);
            if (stream) stream.getTracks().forEach(t => t.stop());
            if (typeof showError === 'function') {
                showError(err.message || 'Face registration failed');
            } else {
                alert('Error: ' + (err.message || 'Face registration failed'));
            }
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
            overlay.style.display = 'none';
        }
    }

    // Attach handler on DOM ready
    function init() {
        const btn = document.getElementById('startFaceRegisterBtn');
        if (btn) {
            btn.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                doFaceRegistration();
            };
            console.log('✓ Face registration handler attached to button');
        } else {
            console.warn('⚠ startFaceRegisterBtn not found');
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
