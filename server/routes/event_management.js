const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateUser } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateEvent = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location').trim().notEmpty().withMessage('Location is required')
    .isLength({ max: 255 }).withMessage('Location must be less than 255 characters'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').isISO8601().withMessage('Valid end date is required')
    .custom((end_date, { req }) => {
      if (new Date(end_date) <= new Date(req.body.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('max_volunteers').optional().isInt({ min: 1 }).withMessage('Max volunteers must be a positive number')
];

// Get all events
router.get('/', async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, u.email as organizer_email, u.first_name, u.last_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      ORDER BY e.start_date DESC
    `);
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching events' 
    });
  }
});

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, u.email as organizer_email, u.first_name, u.last_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.start_date > NOW() AND e.status = 'active'
      ORDER BY e.start_date ASC
    `);
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching upcoming events' 
    });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, u.email as organizer_email, u.first_name, u.last_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.id = ?
    `, [req.params.id]);

    if (events.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // Get volunteer count for this event
    const [volunteerCount] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved
      FROM event_volunteers 
      WHERE event_id = ?
    `, [req.params.id]);

    const eventData = {
      ...events[0],
      volunteers: {
        total: volunteerCount[0].total || 0,
        approved: volunteerCount[0].approved || 0
      }
    };

    res.json({ success: true, data: eventData });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching event' 
    });
  }
});

// Create new event
router.post('/', authenticateUser, validateEvent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      start_date,
      end_date,
      location,
      required_skills,
      max_volunteers,
      status
    } = req.body;

    // Insert the event into the database
    const [result] = await pool.query(
      `INSERT INTO events (
        title,
        description,
        start_date,
        end_date,
        location,
        organizer_id,
        required_skills,
        max_volunteers,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        title,
        description,
        new Date(start_date),
        new Date(end_date),
        location,
        req.user.id,
        typeof required_skills === 'object' ? JSON.stringify(required_skills) : required_skills,
        parseInt(max_volunteers),
        status || 'active'
      ]
    );

    // Get the created event with organizer details
    const [event] = await pool.query(
      `SELECT e.*, u.email as organizer_email, u.first_name, u.last_name
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE e.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event[0]
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: error.sqlMessage || 'Error creating event',
      error: error.message
    });
  }
});

// Update event
router.put('/:id', authenticateUser, validateEvent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const eventId = req.params.id;
    const {
      title,
      description,
      start_date,
      end_date,
      location,
      required_skills,
      max_volunteers,
      status
    } = req.body;

    // Check if user is the event organizer
    const [events] = await pool.query(
      'SELECT organizer_id FROM events WHERE id = ?',
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (events[0].organizer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only event organizers can update this event'
      });
    }

    // Update the event
    const [result] = await pool.query(
      `UPDATE events
       SET 
         title = ?,
         description = ?,
         start_date = ?,
         end_date = ?,
         location = ?,
         required_skills = ?,
         max_volunteers = ?,
         status = ?,
         updated_at = NOW()
       WHERE id = ?`,
      [
        title,
        description,
        new Date(start_date),
        new Date(end_date),
        location,
        typeof required_skills === 'object' ? JSON.stringify(required_skills) : required_skills,
        parseInt(max_volunteers),
        status,
        eventId
      ]
    );

    // Get the updated event
    const [updatedEvent] = await pool.query(
      `SELECT e.*, u.email as organizer_email, u.first_name, u.last_name
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE e.id = ?`,
      [eventId]
    );

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent[0]
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
});

// Delete event
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const eventId = req.params.id;

    // Check if user is the event organizer
    const [events] = await pool.query(
      'SELECT organizer_id FROM events WHERE id = ?',
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (events[0].organizer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only event organizers can delete this event'
      });
    }

    // Delete the event
    const [result] = await pool.query(
      'DELETE FROM events WHERE id = ?',
      [eventId]
    );

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
});

// Get events by organizer ID (My Events)
router.get('/organizer/:id', authenticateUser, async (req, res) => {
  try {
    const organizerId = req.params.id;

    // Verify request is from the organizer
    if (organizerId != req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own events'
      });
    }

    const [events] = await pool.query(`
      SELECT e.*, 
        (SELECT COUNT(*) FROM event_volunteers WHERE event_id = e.id) as total_volunteers,
        (SELECT COUNT(*) FROM event_volunteers WHERE event_id = e.id AND status = 'approved') as approved_volunteers
      FROM events e
      WHERE e.organizer_id = ?
      ORDER BY e.start_date DESC
    `, [organizerId]);

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organizer events',
      error: error.message
    });
  }
});

// Get events statistics for dashboard
router.get('/stats/dashboard', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get event stats
    const [eventStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_events,
        SUM(CASE WHEN start_date > NOW() THEN 1 ELSE 0 END) as upcoming_events,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_events
      FROM events
      WHERE organizer_id = ?
    `, [userId]);

    // Get volunteer stats
    const [volunteerStats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT ev.event_id) as events_volunteered,
        SUM(CASE WHEN ev.status = 'approved' THEN 1 ELSE 0 END) as approved_applications,
        SUM(ev.hours_contributed) as total_hours
      FROM event_volunteers ev
      WHERE ev.volunteer_id = ?
    `, [userId]);

    res.json({
      success: true,
      data: {
        events: eventStats[0],
        volunteering: volunteerStats[0]
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

module.exports = router; 