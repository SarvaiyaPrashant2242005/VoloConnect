// services/participantService.js - Participant-related database operations
const { pool } = require('../config/db');

// Get all volunteers for an event
const getEventVolunteers = async (eventId) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.userId, p.joinedAt, u.username, u.email
       FROM participants p
       JOIN users u ON p.userId = u.id
       WHERE p.eventId = ?
       ORDER BY p.joinedAt ASC`,
      [eventId]
    );
    
    return rows;
  } catch (error) {
    console.error(`Error getting volunteers for event ${eventId}:`, error);
    throw error;
  }
};

module.exports = {
  getEventVolunteers
};