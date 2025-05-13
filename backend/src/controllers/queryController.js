// controllers/queryController.js - Query controller
const queryService = require('../services/queryService');
const eventService = require('../services/eventService');
const { pool } = require('../config/db');

// Get all queries for a specific event
const getEventQueries = async (req, res) => {
  try {
    const queries = await queryService.getEventQueries(req.params.eventId);
    res.json(queries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get queries asked by the authenticated user
const getUserQueries = async (req, res) => {
  try {
    const queries = await queryService.getUserQueries(req.user.id);
    res.json(queries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get queries for events organized by the authenticated user
const getOrganizerQueries = async (req, res) => {
  try {
    const queries = await queryService.getOrganizerQueries(req.user.id);
    res.json(queries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new query for an event
const createEventQuery = async (req, res) => {
  try {
    const { eventId, message } = req.body;
    if (!eventId || !message) {
      return res.status(400).json({ error: 'Event ID and message are required' });
    }
    
    const query = await queryService.createEventQuery(eventId, req.user.id, message);
    res.status(201).json(query);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Respond to a query
const respondToEventQuery = async (req, res) => {
  try {
    const { response } = req.body;
    if (!response) {
      return res.status(400).json({ error: 'Response is required' });
    }
    
    // Verify that the user is the organizer of the event
    const [queryResult] = await pool.query(
      `SELECT e.organizerId, q.eventId
       FROM queries q
       JOIN events e ON q.eventId = e.id
       WHERE q.id = ?`,
      [req.params.id]
    );
    
    if (queryResult.length === 0) {
      return res.status(404).json({ error: 'Query not found' });
    }
    
    if (queryResult[0].organizerId !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to respond to this query' });
    }
    
    const updatedQuery = await queryService.respondToEventQuery(req.params.id, response);
    res.json(updatedQuery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getEventQueries,
  getUserQueries,
  getOrganizerQueries,
  createEventQuery,
  respondToEventQuery
};