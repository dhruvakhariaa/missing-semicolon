require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5005;

app.get('/', (req, res) => res.json({ status: 'Monitoring Service Running' }));

app.listen(PORT, () => {
    console.log(`Monitoring Service running on port ${PORT}`);
});
