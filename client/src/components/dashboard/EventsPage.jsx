import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/DashboardPage.module.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await axios.post(`http://localhost:3001/api/events/${eventId}/join`);
      // Refresh events after joining
      fetchEvents();
      alert('Successfully joined the event!');
    } catch (error) {
      console.error('Error joining event:', error);
      alert('Failed to join event');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={fetchEvents}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.eventsPageContainer}>
      <div className={styles.eventsHeader}>
        <h1>Events</h1>
        <button 
          className={styles.createEventButton}
          onClick={() => navigate('/dashboard/events/create')}
        >
          Create New Event
        </button>
      </div>

      <div className={styles.eventsGrid}>
        {events.map(event => (
          <div key={event.id} className={styles.eventCard}>
            <div className={styles.eventHeader}>
              <h3>{event.title}</h3>
              <span className={styles.eventStatus}>{event.status}</span>
            </div>
            
            <p className={styles.eventDescription}>{event.description}</p>
            
            <div className={styles.eventDetails}>
              <div className={styles.detailItem}>
                <span className={styles.icon}>📍</span>
                <span>{event.location}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.icon}>📅</span>
                <span>{new Date(event.start_date).toLocaleDateString()}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.icon}>⏰</span>
                <span>{new Date(event.end_date).toLocaleDateString()}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.icon}>👥</span>
                <span>{event.current_volunteers || 0}/{event.max_volunteers} volunteers</span>
              </div>
            </div>

            {event.required_skills && (
              <div className={styles.skillsContainer}>
                <h4>Required Skills:</h4>
                <div className={styles.skillsList}>
                  {JSON.parse(event.required_skills).map((skill, index) => (
                    <span key={index} className={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.eventActions}>
              <button 
                className={styles.viewButton}
                onClick={() => navigate(`/dashboard/events/${event.id}`)}
              >
                View Details
              </button>
              <button 
                className={styles.joinButton}
                onClick={() => handleJoinEvent(event.id)}
                disabled={event.status === 'full' || event.status === 'completed'}
              >
                {event.status === 'full' ? 'Event Full' : 
                 event.status === 'completed' ? 'Completed' : 'Join Event'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className={styles.noEvents}>
          <p>No events found</p>
          <button 
            onClick={() => navigate('/dashboard/events/create')}
            className={styles.createEventButton}
          >
            Create First Event
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsPage; 