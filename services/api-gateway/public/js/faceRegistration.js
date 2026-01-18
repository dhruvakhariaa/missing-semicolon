/**
 * Face Registration Module for KYC Portal
 * Robust 5-position face capture: Front, Left, Right, Up, Down
 */

const FaceRegistration = {
    stream: null,
    video: null,
    canvas: null,
    ctx: null,
    images: [],

    positions: [
        { name: 'Front', icon: '😐', instruction: 'Look straight at the camera' },
        { name: 'Left', icon: '👈', instruction: 'Turn your head slightly LEFT' },
        { name: 'Right', icon: '👉', instruction: 'Turn your head slightly RIGHT' },
        { name: 'Up', icon: '👆', instruction: 'Tilt your head slightly UP' },
        { name: 'Down', icon: '👇', instruction: 'Tilt your head slightly DOWN' }
    ],

    async init(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.images = [];
    },

    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });

            this.video.srcObject = this.stream;

            // Wait for video to be ready
            return new Promise((resolve, reject) => {
                this.video.onloadedmetadata = () => {
                    this.video.play()
                        .then(() => {
                            // Set canvas size
                            this.canvas.width = this.video.videoWidth || 640;
                            this.canvas.height = this.video.videoHeight || 480;
                            resolve(true);
                        })
                        .catch(reject);
                };
                this.video.onerror = () => reject(new Error('Video error'));
                setTimeout(() => reject(new Error('Camera timeout')), 15000);
            });
        } catch (err) {
            console.error('Camera start error:', err);
            throw new Error('Could not access camera. Please allow camera permission.');
        }
    },

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    },

    captureFrame() {
        if (!this.video || !this.ctx) {
            throw new Error('Video not initialized');
        }

        // Draw current video frame to canvas
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        // Convert to JPEG with moderate quality to reduce size
        const imageData = this.canvas.toDataURL('image/jpeg', 0.8);

        // Validate the image
        if (!imageData || imageData.length < 5000) {
            throw new Error('Invalid image captured');
        }

        return imageData;
    },

    async captureAllPositions(statusCallback, countCallback) {
        this.images = [];

        for (let i = 0; i < this.positions.length; i++) {
            const pos = this.positions[i];

            // Show instruction
            statusCallback(`${pos.icon} ${pos.instruction}`);
            countCallback(i);

            // Wait for user to position
            await this.sleep(2000);

            // Countdown
            for (let sec = 3; sec > 0; sec--) {
                statusCallback(`${pos.icon} ${pos.name} - Capturing in ${sec}...`);
                await this.sleep(800);
            }

            // Capture
            statusCallback(`📸 Capturing ${pos.name}...`);
            const image = this.captureFrame();
            this.images.push(image);
            countCallback(i + 1);

            console.log(`Captured position ${i + 1}: ${pos.name}, size: ${image.length}`);

            await this.sleep(500);
        }

        return this.images;
    },

    getImages() {
        return [...this.images];
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Make available globally
window.FaceRegistration = FaceRegistration;
