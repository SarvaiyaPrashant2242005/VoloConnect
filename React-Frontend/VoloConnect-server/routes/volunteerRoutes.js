// routes/volunteerRoutes.js
const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');

// Assign a volunteer to an event
router.post('/', volunteerController.assignVolunteer);

// Get a specific assignment by ID
router.get('/:id', volunteerController.getAssignmentById);

// Update an assignment
router.put('/:id', volunteerController.updateAssignment);

// Delete an assignment
router.delete('/:id', volunteerController.deleteAssignment);

// Get all assignments for a specific event
router.get('/event/:eventId', volunteerController.getAssignmentsByEvent);

// Get all assignments for a specific user
router.get('/user/:userId', volunteerController.getAssignmentsByUser);

module.exports = router;