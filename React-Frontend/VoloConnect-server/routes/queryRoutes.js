// routes/queryRoutes.js
const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

// Create a new query
router.post('/', queryController.createQuery);

// Answer a query
router.put('/:id/answer', queryController.answerQuery);

// Get a specific query by ID
router.get('/:id', queryController.getQueryById);

// Delete a query
router.delete('/:id', queryController.deleteQuery);

// Get all queries for a specific event
router.get('/event/:eventId', queryController.getQueriesByEvent);

// Get all queries by a specific user
router.get('/user/:userId', queryController.getQueriesByUser);

module.exports = router;