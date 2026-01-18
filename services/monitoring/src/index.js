require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

app.get('/', (req, res) => res.json({ status: 'Monitoring Service Running' }));

app.get('/health', (req, res) => res.json({ status: 'UP', service: 'Monitoring Service' }));

app.listen(PORT, () => {
    console.log(`Monitoring Service running on port ${PORT}`);
});
