const express = require('express');
const { getAdvisories, createAdvisory } = require('../controllers/advisoryController');

const router = express.Router();

router.get('/', getAdvisories);
router.post('/', createAdvisory);

module.exports = router;
