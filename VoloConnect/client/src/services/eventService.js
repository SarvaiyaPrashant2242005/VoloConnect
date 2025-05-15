import api from '../config/api';

export const eventService = {
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/api/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Event creation error:', error.response || error);
      throw error.response?.data?.message || error.message || 'Failed to create event';
    }
  },

  getEvents: async () => {
    try {
      const response = await api.get('/api/events');
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error.response || error);
      throw error.response?.data?.message || error.message || 'Failed to fetch events';
    }
  },

  getEventById: async (id) => {
    try {
      const response = await api.get(`/api/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event details:', error.response || error);
      throw error.response?.data?.message || error.message || 'Failed to fetch event details';
    }
  }
}; 