// routes/queryRoutes.js - Query-related API routes
const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');
const { authenticateToken } = require('../middlewares/auth');

// Get all queries for a specific event
router.get('/event/:eventId', queryController.getEventQueries);

// Get queries asked by the authenticated user
router.get('/user', authenticateToken, queryController.getUserQueries);

// Get queries for events organized by the authenticated user
router.get('/organizer', authenticateToken, queryController.getOrganizerQueries);

// Create a new query for an event
router.post('/', authenticateToken, queryController.createEventQuery);

// Respond to a query
router.put('/:id/respond', authenticateToken, queryController.respondToEventQuery);

module.exports = router;