import api from '../config/api';

export const queryService = {
  // Get all queries for an event
  getEventQueries: async (eventId) => {
    try {
      const response = await api.get(`/api/queries/event/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch event queries';
    }
  },

  // Get current user's queries
  getUserQueries: async () => {
    try {
      const response = await api.get('/api/queries/my-queries');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch your queries';
    }
  },

  // Create a new query
  createQuery: async (eventId, message) => {
    try {
      const response = await api.post('/api/queries', {
        event_id: eventId,
        message
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create query';
    }
  },

  // Respond to a query (for event organizers)
  respondToQuery: async (queryId, response) => {
    try {
      const apiResponse = await api.put(`/api/queries/${queryId}`, { response });
      return apiResponse.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to respond to query';
    }
  },

  // Delete a query
  deleteQuery: async (queryId) => {
    try {
      const response = await api.delete(`/api/queries/${queryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete query';
    }
  }
}; 