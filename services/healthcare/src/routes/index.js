/**
 * Routes Index - Aggregate all routes
 */

const express = require('express');
const router = express.Router();

const healthRoutes = require('./health');
const departmentRoutes = require('./department');
const doctorRoutes = require('./doctor');
const patientRoutes = require('./patient');
const appointmentRoutes = require('./appointment');

// Health check
router.use('/health', healthRoutes);

// API routes
router.use('/departments', departmentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);

module.exports = router;
