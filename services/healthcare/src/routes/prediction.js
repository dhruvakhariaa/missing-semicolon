/**
 * Disease Prediction Routes
 * Bridges Node.js backend to Python AI service
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

const PYTHON_AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * GET /api/healthcare/ai/health
 * Health check for AI service
 */
router.get('/health', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_AI_URL}/health`, { timeout: 5000 });
        res.json({
            success: true,
            ...response.data
        });
    } catch (error) {
        res.json({
            success: false,
            status: 'unavailable',
            error: 'AI service not reachable'
        });
    }
});

/**
 * GET /api/healthcare/ai/symptoms
 * Get all available symptoms
 */
router.get('/symptoms', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_AI_URL}/symptoms`, { timeout: 10000 });
        res.json(response.data);
    } catch (error) {
        console.error('AI Symptoms Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch symptoms from AI service'
        });
    }
});

/**
 * GET /api/healthcare/ai/diseases
 * Get all predictable diseases
 */
router.get('/diseases', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_AI_URL}/diseases`, { timeout: 10000 });
        res.json(response.data);
    } catch (error) {
        console.error('AI Diseases Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch diseases from AI service'
        });
    }
});

/**
 * POST /api/healthcare/ai/predict
 * Predict disease from symptoms
 */
router.post('/predict', async (req, res) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide at least one symptom'
            });
        }

        const response = await axios.post(
            `${PYTHON_AI_URL}/predict`,
            { symptoms },
            { timeout: 30000 }
        );

        res.json(response.data);
    } catch (error) {
        console.error('AI Prediction Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to get prediction from AI service'
        });
    }
});

/**
 * GET /api/healthcare/ai/metadata
 * Get model metadata
 */
router.get('/metadata', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_AI_URL}/metadata`, { timeout: 5000 });
        res.json(response.data);
    } catch (error) {
        console.error('AI Metadata Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch model metadata'
        });
    }
});

module.exports = router;
