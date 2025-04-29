// routes/index.js
const express = require('express');
const router = express.Router();

// Import all route files
const userRoutes = require('./userRoutes');
const eventRoutes = require('./eventRoutes');
const requestRoutes = require('./requestRoutes');
const volunteerRoutes = require('./volunteerRoutes');
const queryRoutes = require('./queryRoutes');
const skillRoutes = require('./skillRoutes');

// Use the routes with appropriate prefixes
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/requests', requestRoutes);
router.use('/assignments', volunteerRoutes);
router.use('/queries', queryRoutes);
router.use('/skills', skillRoutes);

module.exports = router;