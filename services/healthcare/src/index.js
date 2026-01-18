require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'healthcare',
        timestamp: new Date().toISOString()
    });
});

// Placeholder routes
app.get('/api/patients', (req, res) => {
    res.json({
        message: 'Healthcare service - Patient endpoint (stub implementation)',
        data: []
    });
});

app.get('/api/appointments', (req, res) => {
    res.json({
        message: 'Healthcare service - Appointments endpoint (stub implementation)',
        data: []
    });
});

app.listen(PORT, () => {
    console.log(`Healthcare Service running on port ${PORT}`);
});

module.exports = app;
