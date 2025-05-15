import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import styles from './Dashboard.module.css';
import { eventService } from '../../services/eventService';

// Event card component with improved visual design
const EventCard = ({ event, onJoinEvent, onViewDetails }) => {
  const formattedDate = new Date(event.start_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Determine status badge color
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return styles.statusActive;
      case 'full': return styles.statusFull;
      case 'upcoming': return styles.statusUpcoming;
      case 'completed': return styles.statusCompleted;
      default: return '';
    }
  };

  return (
    <div className={styles.eventCard}>
      <div className={styles.eventHeader}>
        <h3 className={styles.eventTitle}>{event.title}</h3>
        <span className={`${styles.eventStatus} ${getStatusClass(event.status)}`}>
          {event.status}
        </span>
      </div>
      <p className={styles.eventDescription}>{event.description}</p>
      <div className={styles.eventDetails}>
        <div className={styles.eventDetail}>
          <span className={styles.detailIcon}>📍</span>
          <span className={styles.detailText}>{event.location}</span>
        </div>
        <div className={styles.eventDetail}>
          <span className={styles.detailIcon}>📅</span>
          <span className={styles.detailText}>{formattedDate}</span>
        </div>
        <div className={styles.eventDetail}>
          <span className={styles.detailIcon}>👥</span>
          <span className={styles.detailText}>
            {event.current_volunteers || 0}/{event.max_volunteers} volunteers
          </span>
        </div>
      </div>
      <div className={styles.eventProgress}>
        <div 
          className={styles.progressBar} 
          style={{ 
            width: `${Math.min(((event.current_volunteers || 0) / event.max_volunteers) * 100, 100)}%`
          }}
        ></div>
      </div>
      <div className={styles.eventActions}>
        <button 
          className={styles.actionButton} 
          onClick={() => onViewDetails(event.id)}
        >
          View Details
        </button>
        <button 
          className={`${styles.actionButton} ${styles.primaryButton}`}
          onClick={() => onJoinEvent(event.id)}
          disabled={event.status === 'full' || event.status === 'completed'}
        >
          {event.status === 'full' ? 'Event Full' : 
           event.status === 'completed' ? 'Completed' : 'Join Event'}
        </button>
      </div>
    </div>
  );
};

// Create Event Form component with database column matching
const CreateEventForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // State to match exactly with database columns
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    required_skills: [],
    max_volunteers: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  // Predefined skills options
  const skillOptions = [
    'Teaching',
    'First Aid',
    'Construction',
    'Cooking',
    'Project Management',
    'Marketing',
    'Design',
    'Technical',
    'Communication',
    'Leadership'
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Validation to match database requirements
  const validate = () => {
    const newErrors = {};
    
    if (!eventData.title) {
      newErrors.title = 'Title is required';
    }
    if (!eventData.description) {
      newErrors.description = 'Description is required';
    }
    if (!eventData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!eventData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    if (!eventData.location) {
      newErrors.location = 'Location is required';
    }
    if (!eventData.max_volunteers) {
      newErrors.max_volunteers = 'Maximum volunteers is required';
    }
    if (new Date(eventData.end_date) <= new Date(eventData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        setLoading(true);

        // Format data to match database columns exactly
        const formattedData = {
          title: eventData.title.trim(),
          description: eventData.description.trim(),
          start_date: new Date(eventData.start_date).toISOString(),
          end_date: new Date(eventData.end_date).toISOString(),
          location: eventData.location.trim(),
          required_skills: JSON.stringify(eventData.required_skills),
          max_volunteers: parseInt(eventData.max_volunteers),
          status: eventData.status
        };

        // Update the API endpoint to match your server
        const response = await api.post('/api/events', formattedData);

        if (response.data.success) {
          alert('Event created successfully!');
          setEventData({
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            location: '',
            required_skills: [],
            max_volunteers: '',
            status: 'active'
          });
          navigate('/dashboard/events');
        }
      } catch (error) {
        console.error('Error creating event:', error);
        alert(error.response?.data?.message || 'Failed to create event. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSkillToggle = (skill) => {
    setEventData(prev => ({
      ...prev,
      required_skills: prev.required_skills.includes(skill)
        ? prev.required_skills.filter(s => s !== skill)
        : [...prev.required_skills, skill]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.createEventForm}>
      <h2 className={styles.formTitle}>Create New Event</h2>

      <div className={styles.formSection}>
        {/* Title */}
        <div className={styles.formGroup}>
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={eventData.title}
            onChange={handleChange}
            className={errors.title ? styles.inputError : ''}
            placeholder="Enter event title"
            maxLength="255"
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={eventData.description}
            onChange={handleChange}
            className={errors.description ? styles.inputError : ''}
            placeholder="Describe the event"
            rows="4"
          />
          {errors.description && <span className={styles.errorText}>{errors.description}</span>}
        </div>

        {/* Start Date */}
        <div className={styles.formGroup}>
          <label htmlFor="start_date">Start Date and Time *</label>
          <input
            type="datetime-local"
            id="start_date"
            name="start_date"
            value={eventData.start_date}
            onChange={handleChange}
            className={errors.start_date ? styles.inputError : ''}
            min={new Date().toISOString().slice(0, 16)}
          />
          {errors.start_date && <span className={styles.errorText}>{errors.start_date}</span>}
        </div>

        {/* End Date */}
        <div className={styles.formGroup}>
          <label htmlFor="end_date">End Date and Time *</label>
          <input
            type="datetime-local"
            id="end_date"
            name="end_date"
            value={eventData.end_date}
            onChange={handleChange}
            className={errors.end_date ? styles.inputError : ''}
            min={eventData.start_date || new Date().toISOString().slice(0, 16)}
          />
          {errors.end_date && <span className={styles.errorText}>{errors.end_date}</span>}
        </div>

        {/* Location */}
        <div className={styles.formGroup}>
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={eventData.location}
            onChange={handleChange}
            className={errors.location ? styles.inputError : ''}
            placeholder="Enter event location"
            maxLength="255"
          />
          {errors.location && <span className={styles.errorText}>{errors.location}</span>}
        </div>

        {/* Maximum Volunteers */}
        <div className={styles.formGroup}>
          <label htmlFor="max_volunteers">Maximum Volunteers *</label>
          <input
            type="number"
            id="max_volunteers"
            name="max_volunteers"
            value={eventData.max_volunteers}
            onChange={handleChange}
            className={errors.max_volunteers ? styles.inputError : ''}
            min="1"
            max="1000"
          />
          {errors.max_volunteers && <span className={styles.errorText}>{errors.max_volunteers}</span>}
        </div>

        {/* Required Skills */}
        <div className={styles.formGroup}>
          <label>Required Skills</label>
          <div className={styles.skillsGrid}>
            {skillOptions.map(skill => (
              <div key={skill} className={styles.skillItem}>
                <input
                  type="checkbox"
                  id={`skill-${skill}`}
                  checked={eventData.required_skills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                />
                <label htmlFor={`skill-${skill}`}>{skill}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className={styles.formGroup}>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={eventData.status}
            onChange={handleChange}
            className={styles.selectInput}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className={styles.formActions}>
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

// Stats card component for overview section
const StatCard = ({ title, value, icon, trend }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statContent}>
      <h3 className={styles.statTitle}>{title}</h3>
      <p className={styles.statValue}>{value}</p>
      {trend && (
        <span className={`${styles.statTrend} ${trend > 0 ? styles.positive : styles.negative}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  </div>
);

// Main Dashboard component
const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    completedEvents: 0,
    totalVolunteers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Parse user skills if they're stored as a JSON string
  const userSkills = useMemo(() => {
    try {
      // If user.skills is a string, try to parse it
      if (typeof user.skills === 'string') {
        return JSON.parse(user.skills);
      }
      // If user.skills is already an array, use it
      if (Array.isArray(user.skills)) {
        return user.skills;
      }
      // Default skills if none are available
      return ["Teaching", "First Aid", "Event Planning", "Project Management"];
    } catch (e) {
      console.error('Error parsing user skills:', e);
      return ["Teaching", "First Aid", "Event Planning", "Project Management"];
    }
  }, [user.skills]);

  useEffect(() => {
    fetchDashboardData();
    fetchEvents();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data while API is being set up
      const mockStats = {
        totalEvents: 5,
        activeEvents: 3,
        completedEvents: 2,
        totalVolunteers: 12
      };

      setStats(mockStats);

      // Uncomment this when the API is ready
      /*
      const response = await api.get('/api/volunteers/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
      */
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get('/api/events');
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await api.post(`/api/events/${eventId}/join`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error joining event:', error);
      alert(error.response?.data?.message || 'Failed to join event');
    }
  };

  const handleViewEventDetails = (eventId) => {
    navigate(`/dashboard/events/${eventId}`);
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const result = await eventService.createEvent(eventData);
      
      // Update events list with new event
      setEvents(prev => [result.data, ...prev]);
      
      // Show success message and navigate to events
      alert('Event created successfully!');
      setActiveTab('events');
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error.message || 'Failed to create event. Please try again.');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateEventClick = () => {
    navigate('/dashboard/create-event');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          {error}
          <button 
            onClick={fetchDashboardData}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>VoloConnect</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className={styles.navIcon}>📊</span>
            Overview
          </button>
          <button 
  className={`${styles.navItem} ${activeTab === 'events' ? styles.active : ''}`}
  onClick={() => {
    setActiveTab('events');
    navigate('/events');
  }}
>
  <span className={styles.navIcon}>📅</span>
  Events
</button>

          <button 
            className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className={styles.navIcon}>👤</span>
            Profile
          </button>
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <span className={styles.navIcon}>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>Welcome back, {user?.first_name}!</h1>
            <p className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
            <div className={styles.userMenu}>
              <img src={`https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}`} alt="Profile" className={styles.avatar} />
              <span className={styles.userName}>{user?.first_name} {user?.last_name}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className={styles.content}>
          {activeTab === 'overview' && (
            <>
              {/* Stats Section */}
              <div className={styles.statsGrid}>
                <StatCard
                  title="Total Events"
                  value={stats.totalEvents}
                  icon="📊"
                  trend={5}
                />
                <StatCard
                  title="Active Events"
                  value={stats.activeEvents}
                  icon="🎯"
                  trend={2}
                />
                <StatCard
                  title="Completed Events"
                  value={stats.completedEvents}
                  icon="✅"
                  trend={-1}
                />
                <StatCard
                  title="Total Volunteers"
                  value={stats.totalVolunteers}
                  icon="👥"
                  trend={8}
                />
              </div>

              {/* Events Section */}
              <section className={styles.eventsSection}>
                <div className={styles.sectionHeader}>
                  <h2>Upcoming Events</h2>
                  <div className={styles.filterButtons}>
                    <button
                      className={`${styles.filterButton} ${filterStatus === 'all' ? styles.active : ''}`}
                      onClick={() => setFilterStatus('all')}
                    >
                      All
                    </button>
                    <button
                      className={`${styles.filterButton} ${filterStatus === 'active' ? styles.active : ''}`}
                      onClick={() => setFilterStatus('active')}
                    >
                      Active
                    </button>
                    <button
                      className={`${styles.filterButton} ${filterStatus === 'upcoming' ? styles.active : ''}`}
                      onClick={() => setFilterStatus('upcoming')}
                    >
                      Upcoming
                    </button>
                  </div>
                </div>
                <div className={styles.eventsGrid}>
                  {filteredEvents.slice(0, 6).map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onJoinEvent={handleJoinEvent}
                      onViewDetails={handleViewEventDetails}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'events' && (
            <section className={styles.allEventsSection}>
              <div className={styles.sectionHeader}>
                <h2>All Events</h2>
                <button 
                  className={styles.createEventButton}
                  onClick={handleCreateEventClick}
                >
                  <span className={styles.buttonIcon}>+</span>
                  Create New Event
                </button>
              </div>
              <div className={styles.eventsGrid}>
                {loading ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.loader}></div>
                    <p>Loading events...</p>
                  </div>
                ) : error ? (
                  <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>{error}</p>
                    <button 
                      onClick={fetchEvents}
                      className={styles.retryButton}
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className={styles.noEvents}>
                    <p>No events found</p>
                  </div>
                ) : (
                  filteredEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onJoinEvent={handleJoinEvent}
                      onViewDetails={handleViewEventDetails}
                    />
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === 'profile' && (
            <section className={styles.profileSection}>
              <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <img
                    src={`https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&size=128`}
                    alt="Profile"
                    className={styles.profileAvatar}
                  />
                  <div className={styles.profileInfo}>
                    <h2>{user?.first_name} {user?.last_name}</h2>
                    <p className={styles.profileEmail}>{user?.email}</p>
                    <p className={styles.profileOrg}>{user?.organization}</p>
                  </div>
                </div>
                <div className={styles.profileDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Phone</span>
                    <span className={styles.detailValue}>{user?.phone}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Skills</span>
                    <div className={styles.skillsList}>
                      {userSkills.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;