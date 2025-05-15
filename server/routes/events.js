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
  body('max_volunteers').optional().isInt({ min: 1 }).withMessage('Max volunteers must be a positive number'),
  body('organizer_email').optional().isEmail().withMessage('Valid organizer email is required')
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
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
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
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(events[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event' });
  }
});

// Create new event
router.post('/', authenticateUser, async (req, res) => {
  try {
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

    // Basic validation
    if (!title || !description || !start_date || !end_date || !location || !max_volunteers) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // First, verify that the user exists in the database
    const [users] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid organizer ID. Please log in again.'
      });
    }

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
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        new Date(start_date),
        new Date(end_date),
        location,
        users[0].id, // Use the verified user ID
        required_skills,
        parseInt(max_volunteers),
        status || 'active'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      eventId: result.insertId
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    location,
    start_date,
    end_date,
    max_volunteers,
    status
  } = req.body;

  try {
    const [result] = await pool.query(`
      UPDATE events
      SET title = ?, description = ?, location = ?, start_date = ?,
          end_date = ?, max_volunteers = ?, status = ?
      WHERE id = ?
    `, [
      title,
      description,
      location,
      start_date,
      end_date,
      max_volunteers || null,
      status,
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
});

// Delete event
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM events WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

// Get event statistics
router.get('/events/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const statsQuery = `
      WITH user_stats AS (
        SELECT 
          COUNT(DISTINCT e.id) as organized_events,
          COUNT(DISTINCT ve.event_id) as joined_events,
          COUNT(DISTINCT CASE WHEN e.date > CURRENT_TIMESTAMP THEN e.id END) as upcoming_events,
          SUM(CASE WHEN ve.status = 'completed' THEN ve.hours_contributed ELSE 0 END) as total_hours
        FROM users u
        LEFT JOIN events e ON u.id = e.organizer_id
        LEFT JOIN volunteer_events ve ON u.id = ve.volunteer_id
        WHERE u.id = $1
      ),
      total_stats AS (
        SELECT 
          COUNT(*) as total_events,
          COUNT(DISTINCT CASE WHEN date > CURRENT_TIMESTAMP THEN id END) as active_events
        FROM events
      )
      SELECT 
        us.*,
        ts.total_events,
        ts.active_events
      FROM user_stats us, total_stats ts
    `;

    const result = await pool.query(statsQuery, [userId]);
    
    // Format the stats data
    const stats = {
      organized_events: parseInt(result.rows[0].organized_events) || 0,
      joined_events: parseInt(result.rows[0].joined_events) || 0,
      upcoming_events: parseInt(result.rows[0].upcoming_events) || 0,
      total_hours: parseFloat(result.rows[0].total_hours) || 0,
      total_events: parseInt(result.rows[0].total_events) || 0,
      active_events: parseInt(result.rows[0].active_events) || 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event statistics',
      error: error.message
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    // Get total events
    const totalEventsQuery = await pool.query('SELECT COUNT(*) as total FROM events');
    
    // Get active events
    const activeEventsQuery = await pool.query(
      "SELECT COUNT(*) as active FROM events WHERE status = 'active'"
    );
    
    // Get completed events
    const completedEventsQuery = await pool.query(
      "SELECT COUNT(*) as completed FROM events WHERE status = 'completed'"
    );
    
    // Get total volunteers (unique volunteers across all events)
    const totalVolunteersQuery = await pool.query(
      'SELECT COUNT(DISTINCT volunteer_id) as total FROM event_volunteers'
    );

    const stats = {
      totalEvents: parseInt(totalEventsQuery.rows[0].total),
      activeEvents: parseInt(activeEventsQuery.rows[0].active),
      completedEvents: parseInt(completedEventsQuery.rows[0].completed),
      totalVolunteers: parseInt(totalVolunteersQuery.rows[0].total)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Volunteer for an event
router.post('/:id/volunteer', authenticateUser, async (req, res) => {
  try {
    const eventId = req.params.id;
    const volunteerId = req.user.id;
    const { availableHours, specialNeeds, notes, skills } = req.body;

    // Check if event exists and is active
    const [events] = await pool.query(
      `SELECT id, max_volunteers, status,
        (SELECT COUNT(*) FROM event_volunteers WHERE event_id = events.id AND status = 'approved') as current_volunteers
       FROM events 
       WHERE id = ? AND status = 'active'`,
      [eventId]
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
      'SELECT id FROM event_volunteers WHERE event_id = ? AND volunteer_id = ?',
      [eventId, volunteerId]
    );

    if (existingApplication.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already volunteered for this event'
      });
    }

    // Insert volunteer application
    const [result] = await pool.query(
      `INSERT INTO event_volunteers (
        event_id,
        volunteer_id,
        skills,
        available_hours,
        special_needs,
        notes,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        eventId,
        volunteerId,
        skills,
        availableHours,
        specialNeeds || null,
        notes || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Volunteer application submitted successfully',
      data: {
        id: result.insertId,
        event_id: eventId,
        volunteer_id: volunteerId,
        status: 'pending'
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

// Get volunteers for a specific event (organizer only)
router.get('/:id/volunteers', authenticateUser, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    
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

    if (events[0].organizer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only event organizers can view volunteer list'
      });
    }

    // Get volunteers with their details
    const [volunteers] = await pool.query(
      `SELECT 
        ev.id, 
        ev.event_id, 
        ev.volunteer_id, 
        ev.skills, 
        ev.available_hours, 
        ev.special_needs, 
        ev.notes, 
        ev.status, 
        ev.feedback, 
        ev.hours_contributed, 
        ev.created_at,
        u.first_name, 
        u.last_name, 
        u.email, 
        u.phone
      FROM event_volunteers ev
      JOIN users u ON ev.volunteer_id = u.id
      WHERE ev.event_id = ?
      ORDER BY ev.created_at DESC`,
      [eventId]
    );

    // Format the response data
    const formattedVolunteers = volunteers.map(vol => ({
      id: vol.id,
      event_id: vol.event_id,
      volunteer_id: vol.volunteer_id,
      volunteer_name: `${vol.first_name} ${vol.last_name}`,
      volunteer_email: vol.email,
      volunteer_phone: vol.phone,
      skills: vol.skills ? JSON.parse(vol.skills) : [],
      available_hours: vol.available_hours,
      special_needs: vol.special_needs,
      notes: vol.notes,
      status: vol.status,
      feedback: vol.feedback,
      hours_contributed: vol.hours_contributed,
      created_at: vol.created_at
    }));

    res.json({
      success: true,
      count: formattedVolunteers.length,
      data: formattedVolunteers
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

// Update volunteer status and feedback
router.put('/:id/volunteers/:volunteerId', authenticateUser, async (req, res) => {
  try {
    const eventId = req.params.id;
    const volunteerId = req.params.volunteerId;
    const userId = req.user.id;
    const { status, feedback } = req.body;
    
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

    if (events[0].organizer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only event organizers can update volunteer status'
      });
    }

    // Check if volunteer exists for this event
    const [volunteers] = await pool.query(
      'SELECT id FROM event_volunteers WHERE id = ? AND event_id = ?',
      [volunteerId, eventId]
    );

    if (volunteers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found for this event'
      });
    }

    // Update volunteer status and feedback
    const [result] = await pool.query(
      `UPDATE event_volunteers 
       SET status = ?, feedback = ?, updated_at = NOW()
       WHERE id = ? AND event_id = ?`,
      [status, feedback || null, volunteerId, eventId]
    );

    res.json({
      success: true,
      message: 'Volunteer status updated successfully'
    });
  } catch (error) {
    console.error('Error updating volunteer status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating volunteer status',
      error: error.message
    });
  }
});

module.exports = router; 