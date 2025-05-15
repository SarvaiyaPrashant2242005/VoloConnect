const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateUser } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const excel = require('exceljs');
const path = require('path');

// Validation middleware for volunteer application
const validateVolunteerApplication = [
  body('event_id').isInt().withMessage('Valid event ID is required'),
  body('skills').isArray().withMessage('Skills must be an array of strings'),
  body('availability').isArray().withMessage('Availability must be an array of time slots'),
  body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters')
];

// Apply to volunteer for an event
router.post('/apply', authenticateUser, validateVolunteerApplication, async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { event_id, skills, availability, message } = req.body;
    const volunteer_id = req.user.id;

    // Check if event exists and is still accepting volunteers
    const [events] = await pool.query(
      `SELECT id, max_volunteers, status,
        (SELECT COUNT(*) FROM volunteer_events WHERE event_id = events.id AND status = 'approved') as current_volunteers
       FROM events 
       WHERE id = ? AND status = 'active'`,
      [event_id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or not active'
      });
    }

    const event = events[0];
    if (event.current_volunteers >= event.max_volunteers) {
      return res.status(400).json({
        success: false,
        message: 'Event has reached maximum volunteer capacity'
      });
    }

    // Check if already applied
    const [existingApplication] = await pool.query(
      'SELECT id FROM volunteer_events WHERE event_id = ? AND volunteer_id = ?',
      [event_id, volunteer_id]
    );

    if (existingApplication.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this event'
      });
    }

    // Insert volunteer application
    const [result] = await pool.query(
      `INSERT INTO volunteer_events (
        event_id,
        volunteer_id,
        skills,
        availability,
        message,
        status,
        hours_contributed,
        applied_at
      ) VALUES (?, ?, ?, ?, ?, 'pending', 0, NOW())`,
      [
        event_id,
        volunteer_id,
        JSON.stringify(skills),
        JSON.stringify(availability),
        message
      ]
    );

    // Get the created application with user and event details
    const [application] = await pool.query(
      `SELECT 
        ve.*,
        e.title as event_title,
        u.first_name,
        u.last_name,
        u.email
       FROM volunteer_events ve
       JOIN events e ON ve.event_id = e.id
       JOIN users u ON ve.volunteer_id = u.id
       WHERE ve.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Volunteer application submitted successfully',
      data: {
        id: application[0].id,
        event_id: application[0].event_id,
        event_title: application[0].event_title,
        volunteer_id: application[0].volunteer_id,
        volunteer_name: `${application[0].first_name} ${application[0].last_name}`,
        volunteer_email: application[0].email,
        skills: JSON.parse(application[0].skills),
        availability: JSON.parse(application[0].availability),
        message: application[0].message,
        status: application[0].status,
        applied_at: application[0].applied_at
      }
    });

  } catch (error) {
    console.error('Error submitting volunteer application:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting volunteer application',
      error: error.message
    });
  }
});

// Get volunteers for an event (organizer only)
router.get('/event/:event_id', authenticateUser, async (req, res) => {
  try {
    const event_id = req.params.event_id;

    // Check if user is the event organizer
    const [event] = await pool.query(
      'SELECT organizer_id FROM events WHERE id = ?',
      [event_id]
    );

    if (event.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event[0].organizer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only event organizers can view volunteer list'
      });
    }

    // Get volunteers with their details
    const [volunteers] = await pool.query(
      `SELECT 
        ve.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM volunteer_events ve
      JOIN users u ON ve.volunteer_id = u.id
      WHERE ve.event_id = ?
      ORDER BY ve.applied_at DESC`,
      [event_id]
    );

    res.json({
      success: true,
      data: volunteers
    });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching volunteers',
      error: error.message
    });
  }
});

// Get volunteer stats
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get volunteer statistics from database
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM events WHERE organizer_id = ?) as total_events,
        (SELECT COUNT(*) FROM volunteer_events WHERE volunteer_id = ?) as events_joined,
        (SELECT COALESCE(SUM(hours_contributed), 0) FROM volunteer_events WHERE volunteer_id = ?) as hours_contributed,
        (SELECT COUNT(*) FROM volunteer_events ve 
         JOIN events e ON ve.event_id = e.id 
         WHERE ve.volunteer_id = ? AND e.start_date > CURRENT_TIMESTAMP) as upcoming_events
    `;

    const [result] = await pool.query(statsQuery, [userId, userId, userId, userId]);
    
    res.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching volunteer statistics',
      error: error.message
    });
  }
});

// Get volunteer history for the authenticated user
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all volunteer events for this user with event details
    const [history] = await pool.query(
      `SELECT 
        ev.id,
        ev.event_id,
        ev.skills,
        ev.available_hours,
        ev.special_needs,
        ev.notes,
        ev.status,
        ev.feedback,
        ev.hours_contributed,
        ev.created_at,
        e.title,
        e.description,
        e.location,
        e.start_date,
        e.end_date,
        e.organizer_id,
        e.max_volunteers
      FROM event_volunteers ev
      JOIN events e ON ev.event_id = e.id
      WHERE ev.volunteer_id = ?
      ORDER BY e.start_date DESC`,
      [userId]
    );

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error fetching volunteer history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching volunteer history',
      error: error.message
    });
  }
});

module.exports = router;