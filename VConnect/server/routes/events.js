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
router.post('/', authenticateUser, validateEvent, async (req, res) => {
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
    organizer_email
  } = req.body;

  try {
    let organizer_id = null;
    let status = 'approved'; // Default status

    // If organizer email is provided, find the organizer and set status to pending
    if (organizer_email) {
      const [organizers] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [organizer_email]
      );

      if (organizers.length === 0) {
        return res.status(404).json({ message: 'Organizer not found' });
      }

      organizer_id = organizers[0].id;
      status = 'pending';
    }

    // Set organizer_id to the authenticated user's ID if no organizer_email is provided
    if (!organizer_id) {
      organizer_id = req.user.id;
    }

    const [result] = await pool.query(`
      INSERT INTO events (
        title, description, location, start_date, end_date,
        max_volunteers, status, organizer_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      description,
      location,
      start_date,
      end_date,
      max_volunteers || null,
      status,
      organizer_id
    ]);

    res.status(201).json({
      message: 'Event created successfully',
      eventId: result.insertId
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
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

module.exports = router; 