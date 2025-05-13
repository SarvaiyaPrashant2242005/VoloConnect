// eventService.js - API client for event-related operations
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Add auth token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('volo-auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all events
export const getAllEvents = async () => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get a single event by ID
export const getEventById = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    return null;
  }
};

// Get events created by the current user
export const getEventsByUser = async () => {
  try {
    const response = await api.get('/events/user/organized');
    return response.data;
  } catch (error) {
    console.error('Error fetching organized events:', error);
    throw error;
  }
};

// Create a new event
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    await api.delete(`/events/${eventId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error);
    throw error;
  }
};

// Join an event
export const joinEvent = async (eventId) => {
  try {
    const response = await api.post(`/events/${eventId}/join`);
    return response.data;
  } catch (error) {
    console.error(`Error joining event ${eventId}:`, error);
    throw error;
  }
};

// Leave an event
export const leaveEvent = async (eventId) => {
  try {
    await api.delete(`/events/${eventId}/join`);
    return true;
  } catch (error) {
    console.error(`Error leaving event ${eventId}:`, error);
    throw error;
  }
};

// Get events joined by the current user
export const getJoinedEvents = async () => {
  try {
    const response = await api.get('/events/user/joined');
    return response.data;
  } catch (error) {
    console.error('Error fetching joined events:', error);
    throw error;
  }
};

// Check if the current user has joined an event
export const hasJoinedEvent = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}/joined`);
    return response.data.hasJoined;
  } catch (error) {
    console.error(`Error checking event join status for ${eventId}:`, error);
    return false;
  }
};

// Get all volunteers for an event
export const getEventVolunteers = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}/volunteers`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching volunteers for event ${eventId}:`, error);
    throw error;
  }
};

// Create a new query for an event
export const createEventQuery = async (eventId, message) => {
  try {
    const response = await api.post('/queries', { eventId, message });
    return response.data;
  } catch (error) {
    console.error(`Error creating query for event ${eventId}:`, error);
    throw error;
  }
};

// Respond to a query
export const respondToEventQuery = async (queryId, response) => {
  try {
    const result = await api.put(`/queries/${queryId}/respond`, { response });
    return result.data;
  } catch (error) {
    console.error(`Error responding to query ${queryId}:`, error);
    throw error;
  }
};

// Get all queries for a specific event
export const getEventQueries = async (eventId) => {
  try {
    const response = await api.get(`/queries/event/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching queries for event ${eventId}:`, error);
    throw error;
  }
};

// Get queries asked by the current user
export const getUserQueries = async () => {
  try {
    const response = await api.get('/queries/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user queries:', error);
    throw error;
  }
};

// Get queries for events organized by the current user
export const getOrganizerQueries = async () => {
  try {
    const response = await api.get('/queries/organizer');
    return response.data;
  } catch (error) {
    console.error('Error fetching organizer queries:', error);
    throw error;
  }
};