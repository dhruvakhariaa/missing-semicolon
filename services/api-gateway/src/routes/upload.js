/**
 * Upload Routes - Presigned URL generation for file uploads
 */
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// MinIO client (simplified for now, will use @sdp/common later)
const Minio = require('minio');
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'minio',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
});

const BUCKETS = {
    agriculture: 'agriculture-uploads',
    healthcare: 'healthcare-documents',
    urban: 'urban-evidence'
};

/**
 * POST /api/upload/presigned-url
 * Generate presigned URL for file upload
 */
router.post('/presigned-url', async (req, res) => {
    try {
        const { service, fileName, contentType } = req.body;

        if (!BUCKETS[service]) {
            return res.status(400).json({
                success: false,
                error: 'Invalid service. Must be: agriculture, healthcare, or urban'
            });
        }

        const extension = fileName?.split('.').pop() || 'bin';
        const objectName = `uploads/${Date.now()}-${uuidv4()}.${extension}`;
        const bucket = BUCKETS[service];

        const uploadUrl = await minioClient.presignedPutObject(bucket, objectName, 3600);
        const publicUrl = `http://${process.env.MINIO_PUBLIC_HOST || 'localhost'}:9000/${bucket}/${objectName}`;

        logger.info(`Generated presigned URL for ${bucket}/${objectName}`);

        res.json({
            success: true,
            data: {
                uploadUrl,
                publicUrl,
                objectName,
                bucket,
                expiresIn: 3600
            }
        });
    } catch (error) {
        logger.error('Failed to generate presigned URL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate upload URL'
        });
    }
});

module.exports = router;
