require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'monitoring',
        timestamp: new Date().toISOString()
    });
});

// Placeholder routes
app.get('/api/metrics', (req, res) => {
    res.json({
        message: 'Monitoring service - Metrics endpoint (stub implementation)',
        data: {
            cpu: 0,
            memory: 0,
            uptime: process.uptime()
        }
    });
});

app.get('/api/logs', (req, res) => {
    res.json({
        message: 'Monitoring service - Logs endpoint (stub implementation)',
        data: []
    });
});

app.listen(PORT, () => {
    console.log(`Monitoring Service running on port ${PORT}`);
});

module.exports = app;
