import api from '../config/api';

export const eventService = {
  // Get all events with optional filters
  getAllEvents: async () => {
    try {
      const response = await api.get('/api/events');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch events';
    }
  },

  // Get a single event by ID
  getEventById: async (id) => {
    try {
      const response = await api.get(`/api/events/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch event details';
    }
  },

  // Get events by status
  getEventsByStatus: async (status) => {
    try {
      const response = await api.get(`/api/events?status=${status}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch events by status';
    }
  },

  // Search events
  searchEvents: async (searchTerm) => {
    try {
      const response = await api.get(`/api/events?search=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to search events';
    }
  },

  // Join an event
  joinEvent: async (eventId) => {
    try {
      const response = await api.post(`/api/events/${eventId}/volunteer`, {
        availableHours: "Flexible hours",
        specialNeeds: "",
        notes: "Joining from event service",
        skills: JSON.stringify(["General Help"])
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to join event';
    }
  },

  // Create a new event
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/api/events', eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create event';
    }
  },

  // Update an event
  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/api/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update event';
    }
  },

  // Delete an event
  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/api/events/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete event';
    }
  },

  // Get event participants
  getEventParticipants: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}/participants`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch event participants';
    }
  }
}; 