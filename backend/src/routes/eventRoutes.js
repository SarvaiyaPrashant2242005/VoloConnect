// routes/eventRoutes.js - Event-related API routes
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const participantController = require('../controllers/participantController');
const { authenticateToken } = require('../middlewares/auth');

// Get all events
router.get('/', eventController.getAllEvents);

// Get a single event by ID
router.get('/:id', eventController.getEventById);

// Get events created by the authenticated user
router.get('/user/organized', authenticateToken, eventController.getEventsByUser);

// Get events joined by the authenticated user
router.get('/user/joined', authenticateToken, eventController.getJoinedEvents);

// Create a new event
router.post('/', authenticateToken, eventController.createEvent);

// Update an event
router.put('/:id', authenticateToken, eventController.updateEvent);

// Delete an event
router.delete('/:id', authenticateToken, eventController.deleteEvent);

// Join an event
router.post('/:id/join', authenticateToken, eventController.joinEvent);

// Leave an event
router.delete('/:id/join', authenticateToken, eventController.leaveEvent);

// Check if the authenticated user has joined an event
router.get('/:id/joined', authenticateToken, eventController.hasJoinedEvent);

// Get all volunteers for an event
router.get('/:id/volunteers', participantController.getEventVolunteers);

module.exports = router;