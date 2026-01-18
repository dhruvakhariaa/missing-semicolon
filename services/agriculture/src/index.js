require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'agriculture',
        timestamp: new Date().toISOString()
    });
});

// Placeholder routes
app.get('/api/crops', (req, res) => {
    res.json({
        message: 'Agriculture service - Crops endpoint (stub implementation)',
        data: []
    });
});

app.get('/api/farmers', (req, res) => {
    res.json({
        message: 'Agriculture service - Farmers endpoint (stub implementation)',
        data: []
    });
});

app.listen(PORT, () => {
    console.log(`Agriculture Service running on port ${PORT}`);
});

module.exports = app;
