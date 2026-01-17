const express = require('express');
const { getSchemes, getWeather } = require('../controllers/contentController');

const router = express.Router();

router.get('/schemes', getSchemes);
router.get('/weather', getWeather);

module.exports = router;
