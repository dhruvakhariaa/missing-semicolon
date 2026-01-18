/**
 * Face Capture Module
 * 
 * Handles webcam access, face capture, and API integration for
 * face registration and verification in the Government KYC Portal.
 * 
 * @version 1.0.0
 */

const FaceCapture = (function () {
    'use strict';

    // Configuration
    const config = {
        minQuality: 0.6,
        samplesRequired: 5,
        captureInterval: 1500,  // ms between captures
        videoWidth: 640,
        videoHeight: 480
    };

    // State
    let videoStream = null;
    let videoElement = null;
    let canvasElement = null;
    let isCapturing = false;

    /**
     * Initialize webcam access
     * @param {string} videoElementId - ID of video element
     * @param {string} canvasElementId - ID of canvas element
     * @returns {Promise<boolean>}
     */
    async function initialize(videoElementId, canvasElementId) {
        videoElement = document.getElementById(videoElementId);
        canvasElement = document.getElementById(canvasElementId);

        if (!videoElement || !canvasElement) {
            console.error('Video or canvas element not found');
            return false;
        }

        try {
            videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: config.videoWidth },
                    height: { ideal: config.videoHeight },
                    facingMode: 'user'
                }
            });

            videoElement.srcObject = videoStream;
            await videoElement.play();

            // Set canvas dimensions
            canvasElement.width = videoElement.videoWidth || config.videoWidth;
            canvasElement.height = videoElement.videoHeight || config.videoHeight;

            return true;
        } catch (error) {
            console.error('Failed to access camera:', error);
            throw new Error(getCameraErrorMessage(error));
        }
    }

    /**
     * Get user-friendly camera error message
     */
    function getCameraErrorMessage(error) {
        if (error.name === 'NotAllowedError') {
            return 'Camera access denied. Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
            return 'No camera found. Please connect a camera and try again.';
        } else if (error.name === 'NotReadableError') {
            return 'Camera is in use by another application. Please close other apps using the camera.';
        }
        return 'Failed to access camera. Please try again.';
    }

    /**
     * Capture a single frame from the video
     * @returns {string} Base64 encoded JPEG image
     */
    function captureFrame() {
        if (!videoElement || !canvasElement) {
            throw new Error('Face capture not initialized');
        }

        const ctx = canvasElement.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

        // Convert to base64 JPEG (good compression for face images)
        return canvasElement.toDataURL('image/jpeg', 0.9);
    }

    /**
     * Capture multiple samples for face registration
     * @param {function} onProgress - Callback for progress updates
     * @returns {Promise<string[]>} Array of base64 images
     */
    async function captureRegistrationSamples(onProgress) {
        const samples = [];
        isCapturing = true;

        for (let i = 0; i < config.samplesRequired && isCapturing; i++) {
            // Wait for interval
            if (i > 0) {
                await sleep(config.captureInterval);
            }

            // Capture frame
            const image = captureFrame();
            samples.push(image);

            // Report progress
            if (onProgress) {
                onProgress({
                    current: i + 1,
                    total: config.samplesRequired,
                    message: `Sample ${i + 1}/${config.samplesRequired} captured`
                });
            }
        }

        isCapturing = false;
        return samples;
    }

    /**
     * Stop capturing
     */
    function stopCapture() {
        isCapturing = false;
    }

    /**
     * Stop webcam and release resources
     */
    function stop() {
        isCapturing = false;

        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }

        if (videoElement) {
            videoElement.srcObject = null;
        }
    }

    /**
     * Register face with the API
     * @param {string[]} images - Array of 5 base64 images
     * @param {string} accessToken - JWT access token
     * @returns {Promise<Object>}
     */
    async function registerFace(images, accessToken) {
        const response = await fetch('/api/face/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ images })
        });

        return await response.json();
    }

    /**
     * Verify face with the API
     * @param {string} image - Base64 image
     * @param {string} userId - User ID
     * @param {string} faceVerifyToken - Temporary face verification token
     * @returns {Promise<Object>}
     */
    async function verifyFace(image, userId, faceVerifyToken) {
        const response = await fetch('/api/face/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image, userId, faceVerifyToken })
        });

        return await response.json();
    }

    /**
     * Complete 3FA login after face verification
     * @param {string} userId - User ID
     * @param {string} faceVerifyToken - Face verification token
     * @returns {Promise<Object>}
     */
    async function completeFaceAuth(userId, faceVerifyToken) {
        const response = await fetch('/api/auth/complete-face-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, faceVerifyToken })
        });

        return await response.json();
    }

    /**
     * Get face auth status
     * @param {string} accessToken - JWT access token
     * @returns {Promise<Object>}
     */
    async function getFaceAuthStatus(accessToken) {
        const response = await fetch('/api/face/status', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return await response.json();
    }

    /**
     * Disable face auth
     * @param {string} accessToken - JWT access token
     * @returns {Promise<Object>}
     */
    async function disableFaceAuth(accessToken) {
        const response = await fetch('/api/face/disable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return await response.json();
    }

    /**
     * Utility: Sleep for specified milliseconds
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Full face registration flow with UI feedback
     * @param {Object} options - Configuration options
     * @returns {Promise<Object>}
     */
    async function startRegistrationFlow(options) {
        const {
            videoElementId,
            canvasElementId,
            accessToken,
            onProgress,
            onError,
            onSuccess
        } = options;

        try {
            // Initialize camera
            onProgress?.({ stage: 'init', message: 'Starting camera...' });
            await initialize(videoElementId, canvasElementId);

            // Wait for user to position face
            onProgress?.({ stage: 'ready', message: 'Position your face in the frame. Capturing in 3 seconds...' });
            await sleep(3000);

            // Capture samples
            onProgress?.({ stage: 'capture', message: 'Hold still - capturing face samples...' });
            const images = await captureRegistrationSamples((progress) => {
                onProgress?.({
                    stage: 'capture',
                    current: progress.current,
                    total: progress.total,
                    message: progress.message
                });
            });

            // Register with API
            onProgress?.({ stage: 'register', message: 'Processing face data...' });
            const result = await registerFace(images, accessToken);

            // Cleanup
            stop();

            if (result.success) {
                onSuccess?.(result);
            } else {
                onError?.(result.error);
            }

            return result;

        } catch (error) {
            stop();
            const errorObj = { code: 'REGISTRATION_ERROR', message: error.message };
            onError?.(errorObj);
            return { success: false, error: errorObj };
        }
    }

    /**
     * Full face verification flow for login
     * @param {Object} options - Configuration options
     * @returns {Promise<Object>}
     */
    async function startVerificationFlow(options) {
        const {
            videoElementId,
            canvasElementId,
            userId,
            faceVerifyToken,
            onProgress,
            onError,
            onSuccess
        } = options;

        try {
            // Initialize camera
            onProgress?.({ stage: 'init', message: 'Starting camera...' });
            await initialize(videoElementId, canvasElementId);

            // Wait for user to position face
            onProgress?.({ stage: 'ready', message: 'Look at the camera...' });
            await sleep(2000);

            // Capture single frame
            onProgress?.({ stage: 'capture', message: 'Verifying...' });
            const image = captureFrame();

            // Verify with API
            const verifyResult = await verifyFace(image, userId, faceVerifyToken);

            if (!verifyResult.success || !verifyResult.data?.verified) {
                stop();
                const error = verifyResult.error || { code: 'FACE_MISMATCH', message: 'Face verification failed' };
                onError?.(error);
                return { success: false, error };
            }

            // Complete login - get JWT tokens
            onProgress?.({ stage: 'complete', message: 'Completing login...' });
            const loginResult = await completeFaceAuth(userId, faceVerifyToken);

            // Cleanup
            stop();

            if (loginResult.success) {
                onSuccess?.(loginResult);
            } else {
                onError?.(loginResult.error);
            }

            return loginResult;

        } catch (error) {
            stop();
            const errorObj = { code: 'VERIFICATION_ERROR', message: error.message };
            onError?.(errorObj);
            return { success: false, error: errorObj };
        }
    }

    // Public API
    return {
        initialize,
        captureFrame,
        captureRegistrationSamples,
        stopCapture,
        stop,
        registerFace,
        verifyFace,
        completeFaceAuth,
        getFaceAuthStatus,
        disableFaceAuth,
        startRegistrationFlow,
        startVerificationFlow
    };

})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FaceCapture;
}
