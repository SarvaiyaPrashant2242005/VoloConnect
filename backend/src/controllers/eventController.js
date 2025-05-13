// controllers/eventController.js - Event controller
const eventService = require('../services/eventService');

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single event by ID
const getEventById = async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get events created by the authenticated user
const getEventsByUser = async (req, res) => {
  try {
    const events = await eventService.getEventsByUser(req.user.id);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get events joined by the authenticated user
const getJoinedEvents = async (req, res) => {
  try {
    const events = await eventService.getJoinedEvents(req.user.id);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new event
const createEvent = async (req, res) => {
  try {
    const event = await eventService.createEvent(req.body, req.user.id);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    // Check if user is the organizer of the event
    const event = await eventService.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to update this event' });
    }
    
    const updatedEvent = await eventService.updateEvent(req.params.id, req.body);
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    // Check if user is the organizer of the event
    const event = await eventService.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this event' });
    }
    
    await eventService.deleteEvent(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Join an event
const joinEvent = async (req, res) => {
  try {
    const result = await eventService.joinEvent(req.params.id, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Leave an event
const leaveEvent = async (req, res) => {
  try {
    await eventService.leaveEvent(req.params.id, req.user.id);
    res.json({ message: 'Left event successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Check if the authenticated user has joined an event
const hasJoinedEvent = async (req, res) => {
  try {
    const hasJoined = await eventService.hasJoinedEvent(req.params.id, req.user.id);
    res.json({ hasJoined });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  getEventsByUser,
  getJoinedEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  hasJoinedEvent
};