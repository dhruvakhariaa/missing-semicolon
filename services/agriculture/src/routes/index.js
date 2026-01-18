const express = require('express');
const farmerRoutes = require('./farmerRoutes');
const advisoryRoutes = require('./advisoryRoutes');
const chatbotRoutes = require('./chatbotRoutes');
const contentRoutes = require('./contentRoutes');

const router = express.Router();

router.use('/farmers', farmerRoutes);
router.use('/advisories', advisoryRoutes);
router.use('/chat', chatbotRoutes);
router.use('/', contentRoutes); // /schemes and /weather

module.exports = router;
