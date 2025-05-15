import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import styles from './Dashboard.module.css';
import { eventService } from '../../services/eventService';

// Event card component with improved visual design
const EventCard = ({ event, onJoinEvent, onViewDetails }) => {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
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
        const response = await api.post('/voloconnect/events', formattedData);

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
  <div className={styles.statsCard}>
    <div className={styles.statHeader}>
      <span className={styles.statIcon}>{icon}</span>
      <h3 className={styles.statTitle}>{title}</h3>
    </div>
    <p className={styles.statValue}>{value}</p>
    {trend && (
      <p className={`${styles.statTrend} ${trend > 0 ? styles.trendUp : styles.trendDown}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
      </p>
    )}
  </div>
);

// Main Dashboard component
const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    total_events: 0,
    events_joined: 0,
    hours_contributed: 0,
    upcoming_events: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [eventFilter, setEventFilter] = useState('all');
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
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data while API is being set up
      const mockStats = {
        total_events: 5,
        events_joined: 3,
        hours_contributed: 12,
        upcoming_events: 2
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

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleJoinEvent = (eventId) => {
    console.log(`Joining event with ID: ${eventId}`);
    // Add API call to join event
  };

  const handleViewEventDetails = (eventId) => {
    console.log(`Viewing details for event with ID: ${eventId}`);
    // Navigate to event details page
    // navigate(`/events/${eventId}`);
  };

  const handleCreateEvent = async (eventData) => {
    try {
      console.log('Creating event:', eventData);
      // Call API to create event
      // const response = await api.post('/voloconnect/events', eventData);
      
      // Show success message and navigate to events
      alert('Event created successfully!');
      setActiveTab('events');
      
      // Update events list with new event
      setEvents(prev => [
        {
          id: Date.now(), // Temporary ID until API response
          ...eventData,
          current_volunteers: 0,
          status: 'upcoming'
        },
        ...prev
      ]);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const filterEvents = () => {
    const now = new Date();
    
    if (eventFilter === 'my-events') {
      return events.filter(event => event.organizer_id === user.id || event.participants?.includes(user.id));
    } else if (eventFilter === 'upcoming') {
      return events.filter(event => new Date(event.date) > now && event.status !== 'completed');
    } else {
      return events;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
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
        <div className={styles.logoContainer}>
          <div className={styles.logo}>VoloConnect</div>
          <div className={styles.tagline}>Make a Difference</div>
        </div>
        
        <nav className={styles.navigation}>
          <button 
            className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className={styles.navIcon}>📊</span>
            Overview
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'events' ? styles.active : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <span className={styles.navIcon}>📅</span>
            Events
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'create-event' ? styles.active : ''}`}
            onClick={() => setActiveTab('create-event')}
          >
            <span className={styles.navIcon}>➕</span>
            Create Event
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
          <button className={styles.helpButton}>
            <span className={styles.helpIcon}>❓</span>
            Help & Resources
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              {activeTab === 'overview' ? 'Dashboard Overview' :
               activeTab === 'events' ? 'Volunteer Events' :
               activeTab === 'create-event' ? 'Create New Event' :
               activeTab === 'profile' ? 'My Profile' : ''}
            </h1>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.notifications}>
              <span className={styles.notificationIcon}>🔔</span>
              <span className={styles.notificationBadge}>3</span>
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.first_name} {user.last_name}</span>
                <span className={styles.userOrg}>{user.organization || 'Volunteer'}</span>
              </div>
            </div>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className={styles.content}>
          {activeTab === 'overview' && (
            <div className={styles.overviewContent}>
              <div className={styles.welcomeMessage}>
                <h2>Welcome back, {user.first_name}!</h2>
                <p>Here's a summary of your volunteer impact so far.</p>
              </div>
              
              <div className={styles.overviewGrid}>
                <StatCard 
                  title="Total Events" 
                  value={stats.total_events} 
                  icon="📅" 
                />
                <StatCard 
                  title="Events Joined" 
                  value={stats.events_joined} 
                  icon="👥" 
                />
                <StatCard 
                  title="Hours Contributed" 
                  value={stats.hours_contributed} 
                  icon="⏱️" 
                />
                <StatCard 
                  title="Upcoming Events" 
                  value={stats.upcoming_events} 
                  icon="🟢" 
                />
              </div>
              
              <div className={styles.recentActivity}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Recent Activity</h2>
                  <button className={styles.seeAllButton}>See All</button>
                </div>
                
                <div className={styles.activityTimeline}>
                  {events.slice(0, 3).map((event, index) => (
                    <div key={index} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        {event.status === 'active' ? '🔵' : 
                         event.status === 'upcoming' ? '🟢' : 
                         event.status === 'full' ? '🟠' : '✅'}
                      </div>
                      <div className={styles.activityContent}>
                        <h4 className={styles.activityTitle}>{event.title}</h4>
                        <p className={styles.activityDate}>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <button 
                        className={styles.activityAction}
                        onClick={() => handleViewEventDetails(event.id)}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'events' && (
            <div className={styles.eventsContainer}>
              <div className={styles.eventsHeader}>
                <div className={styles.eventsFilter}>
                  <button 
                    className={`${styles.filterButton} ${eventFilter === 'all' ? styles.active : ''}`}
                    onClick={() => setEventFilter('all')}
                  >
                    All Events
                  </button>
                  <button 
                    className={`${styles.filterButton} ${eventFilter === 'my-events' ? styles.active : ''}`}
                    onClick={() => setEventFilter('my-events')}
                  >
                    My Events
                  </button>
                  <button 
                    className={`${styles.filterButton} ${eventFilter === 'upcoming' ? styles.active : ''}`}
                    onClick={() => setEventFilter('upcoming')}
                  >
                    Upcoming
                  </button>
                </div>
                <button 
                  className={styles.createEventButton}
                  onClick={() => setActiveTab('create-event')}
                >
                  <span className={styles.buttonIcon}>+</span>
                  Create Event
                </button>
              </div>
              
              <div className={styles.eventsList}>
                {filterEvents().length > 0 ? (
                  filterEvents().map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onJoinEvent={handleJoinEvent}
                      onViewDetails={handleViewEventDetails}
                    />
                  ))
                ) : (
                  <div className={styles.noEvents}>
                    <div className={styles.noEventsIcon}>🔍</div>
                    <h3>No events found</h3>
                    <p>No events match your current filter. Try changing filters or create your own event!</p>
                    <button 
                      className={styles.createEventButton}
                      onClick={() => setActiveTab('create-event')}
                    >
                      Create New Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'create-event' && (
            <div className={styles.createEventContainer}>
              <CreateEventForm />
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div className={styles.profileContainer}>
              <div className={styles.profileHeader}>
                <div className={styles.profileBanner}></div>
                <div className={styles.profileMainInfo}>
                  <div className={styles.profileAvatarLarge}>
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </div>
                  <div className={styles.profileNameInfo}>
                    <h2 className={styles.profileName}>{user.first_name} {user.last_name}</h2>
                    <p className={styles.profileOrg}>{user.organization || 'Individual Volunteer'}</p>
                    <div className={styles.profileBadges}>
                      <span className={styles.profileBadge}>Verified Volunteer</span>
                      {stats.total_events > 10 && (
                        <span className={styles.profileBadge}>Dedicated Member</span>
                      )}
                      {stats.hours_contributed > 40 && (
                        <span className={styles.profileBadge}>Impact Maker</span>
                      )}
                    </div>
                  </div>
                  <button className={styles.editProfileButton}>
                    Edit Profile
                  </button>
                </div>
              </div>
              
              <div className={styles.profileContent}>
                <div className={styles.profileGrid}>
                  <div className={styles.profileCard}>
                    <h3 className={styles.profileSectionTitle}>Contact Information</h3>
                    <div className={styles.profileField}>
                      <span className={styles.fieldLabel}>Email</span>
                      <span className={styles.fieldValue}>{user.email || 'email@example.com'}</span>
                    </div>
                    <div className={styles.profileField}>
                      <span className={styles.fieldLabel}>Phone</span>
                      <span className={styles.fieldValue}>{user.phone || '(555) 123-4567'}</span>
                    </div>
                    <div className={styles.profileField}>
                      <span className={styles.fieldLabel}>Location</span>
                      <span className={styles.fieldValue}>
                        {user.city || 'San Francisco'}, {user.state || 'CA'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.profileCard}>
                    <h3 className={styles.profileSectionTitle}>Skills & Interests</h3>
                    <div className={styles.skillsList}>
                      {userSkills.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className={styles.interestsList}>
                      <h4 className={styles.subsectionTitle}>Interests</h4>
                      {(user.interests || ['Environmental', 'Education', 'Community Development']).map(interest => (
                        <span key={interest} className={styles.interestTag}>{interest}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.profileCard}>
                    <h3 className={styles.profileSectionTitle}>Volunteer Statistics</h3>
                    <div className={styles.statsGrid}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total Hours</span>
                        <span className={styles.statValueLarge}>{stats.hours_contributed}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Events Completed</span>
                        <span className={styles.statValueLarge}>{stats.total_events}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Impact Score</span>
                        <span className={styles.statValueLarge}>{stats.hours_contributed * 10}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Skills Used</span>
                        <span className={styles.statValueLarge}>{stats.events_joined}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.profileCard}>
                    <h3 className={styles.profileSectionTitle}>Upcoming Events</h3>
                    {events.filter(event => 
                      new Date(event.date) > new Date() && 
                      event.status !== 'completed'
                    ).slice(0, 2).map(event => (
                      <div key={event.id} className={styles.upcomingEvent}>
                        <h4 className={styles.upcomingEventTitle}>{event.title}</h4>
                        <p className={styles.upcomingEventDate}>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <button 
                          className={styles.viewEventButton}
                          onClick={() => handleViewEventDetails(event.id)}
                        >
                          View Event
                        </button>
                      </div>
                    ))}
                    {events.filter(event => 
                      new Date(event.date) > new Date() && 
                      event.status !== 'completed'
                    ).length === 0 && (
                      <div className={styles.noUpcomingEvents}>
                        <p>No upcoming events. Browse events to sign up!</p>
                        <button 
                          className={styles.browseEventsButton}
                          onClick={() => setActiveTab('events')}
                        >
                          Browse Events
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;