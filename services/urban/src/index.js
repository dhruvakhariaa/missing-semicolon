require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'urban',
        timestamp: new Date().toISOString()
    });
});

// Placeholder routes
app.get('/api/permits', (req, res) => {
    res.json({
        message: 'Urban service - Permits endpoint (stub implementation)',
        data: []
    });
});

app.get('/api/infrastructure', (req, res) => {
    res.json({
        message: 'Urban service - Infrastructure endpoint (stub implementation)',
        data: []
    });
});

app.listen(PORT, () => {
    console.log(`Urban Service running on port ${PORT}`);
});

module.exports = app;
