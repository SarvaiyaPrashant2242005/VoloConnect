// services/eventService.js - Event-related database operations
const { pool } = require('../config/db');

// Get all events from the database
const getAllEvents = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM events ORDER BY date ASC');
    return rows;
  } catch (error) {
    console.error('Error getting all events:', error);
    throw error;
  }
};

// Get a single event by ID
const getEventById = async (eventId) => {
  try {
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`Error getting event with ID ${eventId}:`, error);
    throw error;
  }
};

// Get events created by a specific user
const getEventsByUser = async (userId) => {
  try {
    const [rows] = await pool.query('SELECT * FROM events WHERE organizerId = ? ORDER BY date ASC', [userId]);
    return rows;
  } catch (error) {
    console.error(`Error getting events for user ${userId}:`, error);
    throw error;
  }
};

// Create a new event
const createEvent = async (eventData, userId) => {
  try {
    const newEvent = {
      id: `event-${Date.now()}`,
      ...eventData,
      organizerId: userId,
      volunteersJoined: 0
    };
    
    await pool.query(
      'INSERT INTO events (id, name, description, date, location, category, volunteersRequired, volunteersJoined, organizerId, posterUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newEvent.id, newEvent.name, newEvent.description, newEvent.date, newEvent.location, newEvent.category, newEvent.volunteersRequired, newEvent.volunteersJoined, newEvent.organizerId, newEvent.posterUrl]
    );
    
    return newEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an existing event
const updateEvent = async (eventId, eventData) => {
  try {
    // First check if the event exists
    const event = await getEventById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Build the update query dynamically based on provided fields
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(eventData)) {
      if (key !== 'id' && key !== 'organizerId' && key !== 'createdAt') { // Skip these properties
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    // Add the eventId for the WHERE clause
    values.push(eventId);
    
    await pool.query(
      `UPDATE events SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Return the updated event
    return await getEventById(eventId);
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    throw error;
  }
};

// Delete an event
const deleteEvent = async (eventId) => {
  try {
    // First check if the event exists
    const event = await getEventById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Due to foreign key constraints, we don't need to manually delete associated participants and queries
    // They will be automatically deleted due to ON DELETE CASCADE
    
    await pool.query('DELETE FROM events WHERE id = ?', [eventId]);
    return true;
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error);
    throw error;
  }
};

// Join an event
const joinEvent = async (eventId, userId) => {
  try {
    // First check if the event exists
    const event = await getEventById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Check if already joined
    const [existingParticipant] = await pool.query(
      'SELECT * FROM participants WHERE eventId = ? AND userId = ?',
      [eventId, userId]
    );
    
    if (existingParticipant.length > 0) {
      throw new Error('You have already joined this event');
    }
    
    // Check if event is full
    if (event.volunteersJoined >= event.volunteersRequired) {
      throw new Error('Event is already full');
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update event volunteersJoined count
      await connection.query(
        'UPDATE events SET volunteersJoined = volunteersJoined + 1 WHERE id = ?',
        [eventId]
      );
      
      // Add to participants
      const participantId = `participant-${Date.now()}`;
      await connection.query(
        'INSERT INTO participants (id, eventId, userId) VALUES (?, ?, ?)',
        [participantId, eventId, userId]
      );
      
      await connection.commit();
      connection.release();
      
      return {
        id: participantId,
        eventId,
        userId,
        joinedAt: new Date().toISOString()
      };
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error(`Error joining event ${eventId}:`, error);
    throw error;
  }
};

// Leave an event
const leaveEvent = async (eventId, userId) => {
  try {
    // First check if the event exists
    const event = await getEventById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Check if user has joined
    const [existingParticipant] = await pool.query(
      'SELECT * FROM participants WHERE eventId = ? AND userId = ?',
      [eventId, userId]
    );
    
    if (existingParticipant.length === 0) {
      throw new Error('You have not joined this event');
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update event volunteersJoined count
      await connection.query(
        'UPDATE events SET volunteersJoined = GREATEST(0, volunteersJoined - 1) WHERE id = ?',
        [eventId]
      );
      
      // Remove from participants
      await connection.query(
        'DELETE FROM participants WHERE eventId = ? AND userId = ?',
        [eventId, userId]
      );
      
      await connection.commit();
      connection.release();
      
      return true;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error(`Error leaving event ${eventId}:`, error);
    throw error;
  }
};

// Get events joined by a user
const getJoinedEvents = async (userId) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.* 
       FROM events e
       JOIN participants p ON e.id = p.eventId
       WHERE p.userId = ?
       ORDER BY e.date ASC`,
      [userId]
    );
    
    return rows;
  } catch (error) {
    console.error(`Error getting joined events for user ${userId}:`, error);
    throw error;
  }
};

// Check if a user has joined an event
const hasJoinedEvent = async (eventId, userId) => {
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM participants WHERE eventId = ? AND userId = ?',
      [eventId, userId]
    );
    
    return rows[0].count > 0;
  } catch (error) {
    console.error(`Error checking if user ${userId} has joined event ${eventId}:`, error);
    throw error;
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  getEventsByUser,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getJoinedEvents,
  hasJoinedEvent
};