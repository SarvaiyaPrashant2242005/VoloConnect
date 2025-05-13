// services/queryService.js - Event query-related database operations
const { pool } = require('../config/db');
const eventService = require('./eventService');

// Create a new query for an event
const createEventQuery = async (eventId, userId, message) => {
  try {
    // First check if the event exists
    const event = await eventService.getEventById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Mock user name for the query
    const mockUserNames = ['Alex Smith', 'Jamie Johnson', 'Taylor Brown', 'Jordan Wilson'];
    const userName = mockUserNames[Math.floor(Math.random() * mockUserNames.length)];
    
    const queryId = `query-${Date.now()}`;
    await pool.query(
      'INSERT INTO queries (id, eventId, userId, userName, message) VALUES (?, ?, ?, ?, ?)',
      [queryId, eventId, userId, userName, message]
    );
    
    const [rows] = await pool.query('SELECT * FROM queries WHERE id = ?', [queryId]);
    return rows[0];
  } catch (error) {
    console.error(`Error creating query for event ${eventId}:`, error);
    throw error;
  }
};

// Respond to an event query
const respondToEventQuery = async (queryId, response) => {
  try {
    // First check if the query exists
    const [existingQuery] = await pool.query('SELECT * FROM queries WHERE id = ?', [queryId]);
    if (existingQuery.length === 0) {
      throw new Error('Query not found');
    }
    
    const respondedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await pool.query(
      'UPDATE queries SET response = ?, respondedAt = ? WHERE id = ?',
      [response, respondedAt, queryId]
    );
    
    const [rows] = await pool.query('SELECT * FROM queries WHERE id = ?', [queryId]);
    return rows[0];
  } catch (error) {
    console.error(`Error responding to query ${queryId}:`, error);
    throw error;
  }
};

// Get all queries for a specific event
const getEventQueries = async (eventId) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM queries WHERE eventId = ? ORDER BY createdAt DESC',
      [eventId]
    );
    
    return rows;
  } catch (error) {
    console.error(`Error getting queries for event ${eventId}:`, error);
    throw error;
  }
};

// Get all queries created by a specific user
const getUserQueries = async (userId) => {
  try {
    const [rows] = await pool.query(
      `SELECT q.*, e.name as eventName
       FROM queries q
       JOIN events e ON q.eventId = e.id
       WHERE q.userId = ?
       ORDER BY q.createdAt DESC`,
      [userId]
    );
    
    return rows;
  } catch (error) {
    console.error(`Error getting queries for user ${userId}:`, error);
    throw error;
  }
};

// Get all queries for events organized by a specific user
const getOrganizerQueries = async (userId) => {
  try {
    const [rows] = await pool.query(
      `SELECT q.*, e.name as eventName
       FROM queries q
       JOIN events e ON q.eventId = e.id
       WHERE e.organizerId = ?
       ORDER BY q.createdAt DESC`,
      [userId]
    );
    
    return rows;
  } catch (error) {
    console.error(`Error getting organizer queries for user ${userId}:`, error);
    throw error;
  }
};

module.exports = {
  createEventQuery,
  respondToEventQuery,
  getEventQueries,
  getUserQueries,
  getOrganizerQueries
};