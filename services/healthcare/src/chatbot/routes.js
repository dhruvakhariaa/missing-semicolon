const express = require('express');
const router = express.Router();
const chatController = require('./controller');

// Chat endpoint
router.post('/', chatController.chat);

// Clear history endpoint
router.post('/clear', chatController.clearChat);

module.exports = router;
