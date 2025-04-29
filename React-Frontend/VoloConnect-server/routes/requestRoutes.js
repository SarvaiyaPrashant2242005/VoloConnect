// routes/requestRoutes.js
const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

// Create a new request
router.post('/', requestController.createRequest);

// Get a specific request by ID
router.get('/:id', requestController.getRequestById);

// Update request status
router.put('/:id/status', requestController.updateRequestStatus);

// Delete a request
router.delete('/:id', requestController.deleteRequest);

// Get all requests for a specific event
router.get('/event/:eventId', requestController.getRequestsByEvent);

// Get all requests by a specific user
router.get('/user/:userId', requestController.getRequestsByUser);

module.exports = router;