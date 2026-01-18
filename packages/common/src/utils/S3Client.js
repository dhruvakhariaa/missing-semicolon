const Minio = require('minio');
const logger = require('./logger');

class S3Client {
    constructor() {
        this.client = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'minio',
            port: parseInt(process.env.MINIO_PORT) || 9000,
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
        });
    }

    /**
     * Generate presigned URL for file upload (PUT)
     */
    async generatePresignedPutUrl(bucket, objectName, expiry = 3600) {
        try {
            const url = await this.client.presignedPutObject(bucket, objectName, expiry);
            logger.info(`Generated presigned PUT URL for ${bucket}/${objectName}`);
            return url;
        } catch (error) {
            logger.error('Failed to generate presigned PUT URL:', error);
            throw error;
        }
    }

    /**
     * Generate presigned URL for file download (GET)
     */
    async generatePresignedGetUrl(bucket, objectName, expiry = 3600) {
        try {
            const url = await this.client.presignedGetObject(bucket, objectName, expiry);
            return url;
        } catch (error) {
            logger.error('Failed to generate presigned GET URL:', error);
            throw error;
        }
    }

    /**
     * Get public URL (for buckets with anonymous read access)
     */
    getPublicUrl(bucket, objectName) {
        const endpoint = process.env.MINIO_PUBLIC_ENDPOINT || `http://localhost:9000`;
        return `${endpoint}/${bucket}/${objectName}`;
    }
}

module.exports = S3Client;
