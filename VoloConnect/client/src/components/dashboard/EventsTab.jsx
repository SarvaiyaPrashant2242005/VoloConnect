import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import styles from './Dashboard.module.css';

const EventsTab = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/events');
      if (response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      const response = await api.post(`/api/events/${eventId}/join`);
      if (response.data.success) {
        // Refresh events after joining
        fetchEvents();
      }
    } catch (error) {
      console.error('Error joining event:', error);
      alert(error.response?.data?.message || 'Failed to join event. Please try again.');
    }
  };

  const handleViewDetails = (eventId) => {
    navigate(`/dashboard/events/${eventId}`);
  };

  const handleCreateEvent = () => {
    navigate('/dashboard/create-event');
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={fetchEvents}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.eventsSection}>
      <div className={styles.eventsHeader}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filterSection}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button 
          className={styles.createEventButton}
          onClick={handleCreateEvent}
        >
          <span className={styles.buttonIcon}>+</span>
          Create New Event
        </button>
      </div>

      {filteredEvents.length === 0 ? (
        <div className={styles.noEvents}>
          <p>No events found. Create a new event to get started!</p>
        </div>
      ) : (
        <div className={styles.eventsGrid}>
          {filteredEvents.map(event => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.eventHeader}>
                <h3>{event.title}</h3>
                <span className={`${styles.status} ${styles[event.status]}`}>
                  {event.status}
                </span>
              </div>
              <p className={styles.eventDescription}>{event.description}</p>
              <div className={styles.eventDetails}>
                <div className={styles.detail}>
                  <span className={styles.label}>Location:</span>
                  <span>{event.location}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Date:</span>
                  <span>{new Date(event.start_date).toLocaleDateString()}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Time:</span>
                  <span>
                    {new Date(event.start_date).toLocaleTimeString()} - 
                    {new Date(event.end_date).toLocaleTimeString()}
                  </span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Volunteers:</span>
                  <span>{event.current_volunteers || 0}/{event.max_volunteers}</span>
                </div>
              </div>
              <div className={styles.eventActions}>
                <button
                  className={styles.viewButton}
                  onClick={() => handleViewDetails(event.id)}
                >
                  View Details
                </button>
                {event.status === 'active' && (
                  <button
                    className={styles.joinButton}
                    onClick={() => handleJoinEvent(event.id)}
                  >
                    Join Event
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsTab; 