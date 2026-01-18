/**
 * Service Registry Routes
 */

const express = require('express');
const router = express.Router();
const ServiceRegistry = require('../services/ServiceRegistry');

router.get('/services', async (req, res) => {
    try {
        const services = await ServiceRegistry.getAllServices();
        res.json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, host, port, version } = req.body;
        await ServiceRegistry.register({ name, host, port, version });
        res.json({ success: true, message: `Service ${name} registered` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/deregister/:name', async (req, res) => {
    try {
        await ServiceRegistry.deregister(req.params.name);
        res.json({ success: true, message: `Service ${req.params.name} deregistered` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
