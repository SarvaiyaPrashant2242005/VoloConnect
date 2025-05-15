const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateUser } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware for volunteer application
const validateVolunteerApplication = [
  body('event_id').isInt().withMessage('Valid event ID is required'),
  body('skills').isArray().withMessage('Skills must be an array of strings'),
  body('available_hours').notEmpty().withMessage('Available hours are required'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
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

    const { event_id, skills, available_hours, special_needs, notes } = req.body;
    const volunteer_id = req.user.id;

    // Check if event exists and is still accepting volunteers
    const [events] = await pool.query(
      `SELECT id, max_volunteers, status, start_date, end_date,
        (SELECT COUNT(*) FROM event_volunteers WHERE event_id = events.id AND status = 'approved') as current_volunteers
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
    
    // Check if event already started
    if (new Date(event.start_date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This event has already started and is no longer accepting volunteers'
      });
    }
    
    // Check if event is at capacity
    if (event.current_volunteers >= event.max_volunteers) {
      return res.status(400).json({
        success: false,
        message: 'Event has reached maximum volunteer capacity'
      });
    }

    // Check if already applied
    const [existingApplication] = await pool.query(
      'SELECT id FROM event_volunteers WHERE event_id = ? AND volunteer_id = ?',
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
        event_id,
        volunteer_id,
        JSON.stringify(skills),
        available_hours,
        special_needs || null,
        notes || null
      ]
    );

    // Get the created application with user and event details
    const [application] = await pool.query(
      `SELECT 
        ev.*,
        e.title as event_title,
        e.start_date,
        e.end_date,
        u.first_name,
        u.last_name,
        u.email
       FROM event_volunteers ev
       JOIN events e ON ev.event_id = e.id
       JOIN users u ON ev.volunteer_id = u.id
       WHERE ev.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Volunteer application submitted successfully',
      data: {
        id: application[0].id,
        event_id: application[0].event_id,
        event_title: application[0].event_title,
        start_date: application[0].start_date,
        end_date: application[0].end_date,
        volunteer_id: application[0].volunteer_id,
        volunteer_name: `${application[0].first_name} ${application[0].last_name}`,
        volunteer_email: application[0].email,
        skills: JSON.parse(application[0].skills || '[]'),
        available_hours: application[0].available_hours,
        special_needs: application[0].special_needs,
        notes: application[0].notes,
        status: application[0].status,
        created_at: application[0].created_at
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
        e.max_volunteers,
        u.first_name as organizer_first_name,
        u.last_name as organizer_last_name
      FROM event_volunteers ev
      JOIN events e ON ev.event_id = e.id
      JOIN users u ON e.organizer_id = u.id
      WHERE ev.volunteer_id = ?
      ORDER BY e.start_date DESC`,
      [userId]
    );

    // Format response data
    const formattedHistory = history.map(event => ({
      id: event.id,
      event_id: event.event_id,
      title: event.title,
      description: event.description,
      location: event.location,
      start_date: event.start_date,
      end_date: event.end_date,
      status: event.status,
      feedback: event.feedback,
      hours_contributed: event.hours_contributed,
      skills: JSON.parse(event.skills || '[]'),
      available_hours: event.available_hours,
      special_needs: event.special_needs,
      notes: event.notes,
      organizer: {
        id: event.organizer_id,
        name: `${event.organizer_first_name} ${event.organizer_last_name}`
      },
      created_at: event.created_at
    }));

    res.json({
      success: true,
      count: formattedHistory.length,
      data: formattedHistory
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
      [event_id]
    );

    // Format the response data
    const formattedVolunteers = volunteers.map(vol => ({
      id: vol.id,
      event_id: vol.event_id,
      volunteer_id: vol.volunteer_id,
      first_name: vol.first_name,
      last_name: vol.last_name,
      email: vol.email,
      phone: vol.phone,
      skills: JSON.parse(vol.skills || '[]'),
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

// Update volunteer status (approve/reject)
router.put('/event/:event_id/volunteer/:volunteer_id', authenticateUser, async (req, res) => {
  try {
    const event_id = req.params.event_id;
    const volunteer_id = req.params.volunteer_id;
    const { status, feedback } = req.body;

    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

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
        message: 'Only event organizers can update volunteer status'
      });
    }

    // Check if volunteer exists for this event
    const [volunteers] = await pool.query(
      'SELECT id FROM event_volunteers WHERE id = ? AND event_id = ?',
      [volunteer_id, event_id]
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
      [status, feedback || null, volunteer_id, event_id]
    );

    // Get updated volunteer data
    const [updatedVolunteer] = await pool.query(
      `SELECT ev.*, u.first_name, u.last_name, u.email
       FROM event_volunteers ev
       JOIN users u ON ev.volunteer_id = u.id
       WHERE ev.id = ?`,
      [volunteer_id]
    );

    res.json({
      success: true,
      message: 'Volunteer status updated successfully',
      data: {
        id: updatedVolunteer[0].id,
        status: updatedVolunteer[0].status,
        feedback: updatedVolunteer[0].feedback,
        volunteer_name: `${updatedVolunteer[0].first_name} ${updatedVolunteer[0].last_name}`,
        updated_at: updatedVolunteer[0].updated_at
      }
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

// Approve a volunteer
router.put('/event/:event_id/volunteer/:volunteer_id/approve', authenticateUser, async (req, res) => {
  try {
    const event_id = req.params.event_id;
    const volunteer_id = req.params.volunteer_id;
    const { feedback } = req.body || {};

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
        message: 'Only event organizers can approve volunteers'
      });
    }

    // Check if volunteer exists for this event
    const [volunteers] = await pool.query(
      'SELECT id FROM event_volunteers WHERE id = ? AND event_id = ?',
      [volunteer_id, event_id]
    );

    if (volunteers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found for this event'
      });
    }

    // Update volunteer status to approved
    const [result] = await pool.query(
      `UPDATE event_volunteers 
       SET status = 'approved', feedback = ?, updated_at = NOW()
       WHERE id = ? AND event_id = ?`,
      [feedback || null, volunteer_id, event_id]
    );

    res.json({
      success: true,
      message: 'Volunteer approved successfully'
    });
  } catch (error) {
    console.error('Error approving volunteer:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving volunteer',
      error: error.message
    });
  }
});

// Reject a volunteer
router.put('/event/:event_id/volunteer/:volunteer_id/reject', authenticateUser, async (req, res) => {
  try {
    const event_id = req.params.event_id;
    const volunteer_id = req.params.volunteer_id;
    const { feedback } = req.body || {};

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
        message: 'Only event organizers can reject volunteers'
      });
    }

    // Check if volunteer exists for this event
    const [volunteers] = await pool.query(
      'SELECT id FROM event_volunteers WHERE id = ? AND event_id = ?',
      [volunteer_id, event_id]
    );

    if (volunteers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found for this event'
      });
    }

    // Update volunteer status to rejected
    const [result] = await pool.query(
      `UPDATE event_volunteers 
       SET status = 'rejected', feedback = ?, updated_at = NOW()
       WHERE id = ? AND event_id = ?`,
      [feedback || null, volunteer_id, event_id]
    );

    res.json({
      success: true,
      message: 'Volunteer rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting volunteer:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting volunteer',
      error: error.message
    });
  }
});

// Update volunteer hours
router.put('/event/:event_id/volunteer/:volunteer_id/hours', authenticateUser, async (req, res) => {
  try {
    const event_id = req.params.event_id;
    const volunteer_id = req.params.volunteer_id;
    const { hours_contributed } = req.body;

    if (!hours_contributed && hours_contributed !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Hours contributed is required'
      });
    }

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
        message: 'Only event organizers can update volunteer hours'
      });
    }

    // Check if volunteer exists for this event
    const [volunteers] = await pool.query(
      'SELECT id FROM event_volunteers WHERE id = ? AND event_id = ?',
      [volunteer_id, event_id]
    );

    if (volunteers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found for this event'
      });
    }

    // Update volunteer hours
    const [result] = await pool.query(
      `UPDATE event_volunteers 
       SET hours_contributed = ?, updated_at = NOW()
       WHERE id = ? AND event_id = ?`,
      [parseFloat(hours_contributed), volunteer_id, event_id]
    );

    res.json({
      success: true,
      message: 'Volunteer hours updated successfully'
    });
  } catch (error) {
    console.error('Error updating volunteer hours:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating volunteer hours',
      error: error.message
    });
  }
});

// Get volunteer stats
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get volunteer statistics from database
    const [stats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM events WHERE organizer_id = ?) as total_events_organized,
        (SELECT COUNT(*) FROM event_volunteers WHERE volunteer_id = ?) as total_events_volunteered,
        (SELECT COALESCE(SUM(hours_contributed), 0) FROM event_volunteers WHERE volunteer_id = ?) as total_hours_contributed,
        (SELECT COUNT(*) FROM event_volunteers ve 
         JOIN events e ON ve.event_id = e.id 
         WHERE ve.volunteer_id = ? AND e.start_date > CURRENT_TIMESTAMP AND ve.status = 'approved') as upcoming_events
    `, [userId, userId, userId, userId]);

    // Calculate any additional stats
    const [skillStats] = await pool.query(`
      SELECT ev.skills
      FROM event_volunteers ev
      WHERE ev.volunteer_id = ? AND ev.status IN ('approved', 'completed')
    `, [userId]);

    // Get unique skills used
    const uniqueSkills = new Set();
    skillStats.forEach(record => {
      try {
        const skills = JSON.parse(record.skills || '[]');
        skills.forEach(skill => uniqueSkills.add(skill));
      } catch (e) {
        console.error('Error parsing skills:', e);
      }
    });

    res.json({
      success: true,
      data: {
        ...stats[0],
        skills_utilized: uniqueSkills.size
      }
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

module.exports = router; 