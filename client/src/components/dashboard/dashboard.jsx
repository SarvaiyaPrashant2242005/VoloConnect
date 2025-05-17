import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import styles from './Dashboard.module.css';
import { eventService } from '../../services/eventService';
import CreateEvent from './CreateEvent';
import { Button, IconButton, Menu } from '@mui/material';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

// Event card component with improved visual design for laptop screens
const EventCard = ({ event, onJoinEvent, onViewDetails, onEditEvent, currentUser }) => {
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

  // Check if current user is the organizer
  const isOrganizer = currentUser && event.organizer_id === currentUser.id;

  return (
    <div className={styles.eventCard}>
      {/* Card Header with Title and Status */}
      <div className={styles.eventHeader}>
        <h3 className={styles.eventTitle}>{event.title}</h3>
        <span className={`${styles.eventStatus} ${getStatusClass(event.status)}`}>
          {event.status}
        </span>
      </div>
      
      {/* Event Description */}
      <p className={styles.eventDescription}>{event.description}</p>
      
      {/* Event Details (Location, Date, Volunteers) */}
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
            <span className={styles.volunteerCount}>
              {event.current_volunteers || 0}/{event.max_volunteers}
            </span> 
            <span className={styles.volunteerLabel}>volunteers</span>
          </span>
        </div>
      </div>
      
      {/* Volunteer Progress Bar */}
      <div className={styles.eventProgress}>
        <div 
          className={styles.progressBar} 
          style={{ 
            width: `${Math.min(((event.current_volunteers || 0) / event.max_volunteers) * 100, 100)}%`,
            backgroundColor: event.status === 'full' ? 'var(--color-error)' : 'var(--color-success)'
          }}
        >
          <span className={styles.progressIndicator}></span>
        </div>
      </div>
      
      {/* Card Actions */}
      <div className={styles.eventActions}>
        {/* First row of buttons */}
        <div className={styles.actionRow}>
          <button 
            className={`${styles.actionButton} ${styles.viewButton}`}
            onClick={() => onViewDetails(event.id)}
          >
            View Details
          </button>
          
          <button 
            className={`${styles.actionButton} ${styles.secondaryButton}`}
            onClick={() => onViewDetails(event.id)}
          >
            <span className={styles.buttonIcon}>
              <QuestionAnswerIcon fontSize="small" />
            </span>
            Ask Query
          </button>
        </div>
        
        {/* Second row with conditional button (Edit or Join) */}
        <div className={styles.actionRow}>
          {isOrganizer ? (
            <button 
              className={`${styles.actionButton} ${styles.editButton} ${styles.fullWidth}`}
              onClick={() => onEditEvent(event.id)}
            >
              Edit Event
            </button>
          ) : (
            <button 
              className={`${styles.actionButton} ${styles.primaryButton} ${styles.fullWidth}`}
              onClick={() => onJoinEvent(event.id)}
              disabled={event.status === 'full' || event.status === 'completed'}
            >
              {event.status === 'full' ? 'Event Full' : 
               event.status === 'completed' ? 'Completed' : 'Join Event'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Stats card component for overview section
const StatCard = ({ title, value, icon, trend, loading }) => (
  <div className={`${styles.statCard} ${loading ? styles.statCardLoading : ''}`}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statContent}>
      <h3 className={styles.statTitle}>{title}</h3>
      <p className={styles.statValue}>
        {loading ? 
          <span className={styles.loadingPulse}>...</span> : 
          value
        }
      </p>
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
  const [myEvents, setMyEvents] = useState([]);
  const [userQueries, setUserQueries] = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(false);
  const [queriesError, setQueriesError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  const [statsLoading, setStatsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const revealRefs = useRef([]);

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
    fetchUserQueries();

    // Set up auto-refresh for stats every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 300000); // 5 minutes

    // Add event listener for window resize to handle sidebar visibility
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    // Add event listener for ESC key to close mobile menu
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleEscKey);

    // Add event listener to disable body scrolling when mobile menu is open
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.active);
        }
      });
    }, {
      threshold: 0.1
    });

    revealRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
      revealRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setStatsLoading(true);
      setError(null);

      // Fetch real statistics from the API
      const response = await api.get('/api/events/stats');
      
      if (response.data) {
        setStats({
          totalEvents: response.data.totalEvents || 0,
          activeEvents: response.data.activeEvents || 0,
          completedEvents: response.data.completedEvents || 0,
          totalVolunteers: response.data.totalVolunteers || 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't show error to user, just use fallback values
      // This prevents the dashboard from looking broken
      setStats({
        totalEvents: 0,
        activeEvents: 0,
        completedEvents: 0,
        totalVolunteers: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch all events
      const allEventsResponse = await api.get('/api/events');
      console.log('All events response:', allEventsResponse);
      
      if (allEventsResponse.data) {
        // Handle different response formats
        let allEventsData = Array.isArray(allEventsResponse.data) 
          ? allEventsResponse.data 
          : (allEventsResponse.data.data || []);
          
        console.log('Processed all events data:', allEventsData);
        setEvents(allEventsData);
      } else {
        console.warn('No data in all events response');
        setEvents([]);
      }
      
      // Fetch events created by the current user
      try {
        const myEventsResponse = await api.get('/api/events/my-events');
        console.log('My events response:', myEventsResponse);
        
        if (myEventsResponse.data && myEventsResponse.data.success) {
          setMyEvents(myEventsResponse.data.data || []);
          console.log('My events data loaded:', myEventsResponse.data.data);
        } else {
          console.warn('No data or success flag in my events response');
          setMyEvents([]);
        }
      } catch (myEventsError) {
        console.error('Error fetching my events:', myEventsError);
        // Don't fail the whole function if my-events fails
        setMyEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserQueries = async () => {
    try {
      setQueriesLoading(true);
      setQueriesError(null);
      
      const response = await api.get('/api/queries/my-queries');
      
      if (response.data) {
        setUserQueries(response.data);
        console.log('User queries loaded:', response.data);
      } else {
        setUserQueries([]);
      }
    } catch (error) {
      console.error('Error fetching user queries:', error);
      setQueriesError('Failed to load your queries. Please try again.');
      setUserQueries([]);
    } finally {
      setQueriesLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await api.post(`/api/events/${eventId}/volunteer`, {
        availableHours: "Flexible hours",
        specialNeeds: "",
        notes: "Joining from dashboard",
        skills: JSON.stringify(["General Help"])
      });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error joining event:', error);
      alert(error.response?.data?.message || 'Failed to join event');
    }
  };

  const handleViewEventDetails = (eventId) => {
    console.log('Viewing event details for ID:', eventId);
    navigate(`/events/${eventId}`);
  };

  const handleEditEvent = (eventId) => {
    console.log('Editing event:', eventId);
    navigate(`/events/${eventId}/edit`);
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const result = await eventService.createEvent(eventData);
      
      // Update events list with new event
      setEvents(prev => [result.data, ...prev]);
      
      // Show success message and navigate to events
      alert('Event created successfully!');
      setActiveTab('all-events');
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

  const filteredMyEvents = myEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateEventClick = () => {
    navigate('/events/create');
  };

  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
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
      {/* Mobile menu toggle button */}
      <button 
        className={styles.mobileMenuButton}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.logo}>
            <span>Volo</span>
            <span>Connect</span>
          </h2>
          {/* Close button visible only on mobile */}
          <button 
            className={styles.mobileCloseButton}
            onClick={toggleMobileMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <span className={styles.navIcon}>📊</span>
            Overview
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'all-events' ? styles.active : ''}`}
            onClick={() => handleTabChange('all-events')}
          >
            <span className={styles.navIcon}>📅</span>
            All Events
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'my-events' ? styles.active : ''}`}
            onClick={() => handleTabChange('my-events')}
          >
            <span className={styles.navIcon}>🗓️</span>
            My Events
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => handleTabChange('profile')}
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

      {/* Overlay for mobile menu */}
      <div 
        className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.active : ''}`} 
        onClick={toggleMobileMenu}
        aria-hidden="true"
      />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 ref={addToRefs} className={styles.reveal}>Welcome back, {user?.first_name}!</h1>
            <p ref={addToRefs} className={`${styles.date} ${styles.reveal}`}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className={styles.headerRight}>
            <div ref={addToRefs} className={`${styles.searchBar} ${styles.reveal}`}>
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
            <div ref={addToRefs} className={`${styles.userMenu} ${styles.reveal}`}>
              <img src={`https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&size=128`} alt="Profile" className={styles.avatar} />
              <span className={styles.userName}>{user?.first_name} {user?.last_name}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className={styles.content}>
          {activeTab === 'overview' && (
            <>
              {/* Stats Section */}
              <div className={styles.statsHeader}>
                <h2 ref={addToRefs} className={styles.reveal}>Dashboard Statistics</h2>
                <button 
                  ref={addToRefs}
                  className={`${styles.refreshButton} ${styles.reveal}`}
                  onClick={fetchDashboardData}
                  disabled={statsLoading}
                >
                  {statsLoading ? 'Refreshing...' : 'Refresh Stats'}
                </button>
              </div>
              <div className={styles.statsGrid}>
                {[
                  { title: "Total Events", value: stats.totalEvents, icon: "📊" },
                  { title: "Active Events", value: stats.activeEvents, icon: "🎯" },
                  { title: "Completed Events", value: stats.completedEvents, icon: "✅" },
                  { title: "Total Volunteers", value: stats.totalVolunteers, icon: "👥" }
                ].map((stat, index) => (
                  <div key={index} ref={addToRefs} className={`${styles.statCard} ${styles.reveal}`}>
                    <StatCard
                      title={stat.title}
                      value={stat.value}
                      icon={stat.icon}
                      trend={null}
                      loading={statsLoading}
                    />
                  </div>
                ))}
              </div>

              {/* Events Section */}
              <section className={styles.eventsSection}>
                <div className={styles.sectionHeader}>
                  <h2 ref={addToRefs} className={styles.reveal}>Upcoming Events</h2>
                  <div ref={addToRefs} className={`${styles.filterButtons} ${styles.reveal}`}>
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
                  </div>
                </div>
                <div className={styles.eventsGrid}>
                  {filteredEvents.slice(0, 6).map((event, index) => (
                    <div key={event.id} ref={addToRefs} className={`${styles.reveal}`}>
                      <EventCard
                        event={event}
                        onJoinEvent={handleJoinEvent}
                        onViewDetails={handleViewEventDetails}
                        onEditEvent={handleEditEvent}
                        currentUser={user}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'all-events' && (
            <section className={styles.allEventsSection}>
              <div className={styles.sectionHeader}>
                <h2>All Events</h2>
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
                </div>
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
                    <p>No events found matching your criteria</p>
                    <p className={styles.noEventsSubtext}>Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onJoinEvent={handleJoinEvent}
                      onViewDetails={handleViewEventDetails}
                      onEditEvent={handleEditEvent}
                      currentUser={user}
                    />
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === 'my-events' && (
            <section className={styles.allEventsSection}>
              <div className={styles.sectionHeader}>
                <h2>My Events</h2>
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
                ) : filteredMyEvents.length === 0 ? (
                  <div className={styles.noEvents}>
                    <p>You haven't created any events yet</p>
                    <button 
                      className={styles.createFirstEventButton}
                      onClick={handleCreateEventClick}
                    >
                      Create Your First Event
                    </button>
                  </div>
                ) : (
                  filteredMyEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onJoinEvent={handleJoinEvent}
                      onViewDetails={handleViewEventDetails}
                      onEditEvent={handleEditEvent}
                      currentUser={user}
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
              
              {/* My Queries Section */}
              <div className={styles.queriesSection}>
                <h2 className={styles.sectionTitle}>My Queries</h2>
                
                {queriesLoading ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.loader}></div>
                    <p>Loading your queries...</p>
                  </div>
                ) : queriesError ? (
                  <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>{queriesError}</p>
                    <button 
                      onClick={fetchUserQueries}
                      className={styles.retryButton}
                    >
                      Retry
                    </button>
                  </div>
                ) : userQueries.length === 0 ? (
                  <div className={styles.noQueries}>
                    <p>You haven't asked any questions yet</p>
                    <p className={styles.noQueriesSubtext}>
                      Visit an event page and click "Ask Query" to start a conversation
                    </p>
                  </div>
                ) : (
                  <div className={styles.queriesList}>
                    {userQueries.map(query => (
                      <div key={query.id} className={styles.queryCard}>
                        <div className={styles.queryHeader}>
                          <h3 className={styles.queryEventTitle}>
                            {query.event_title}
                          </h3>
                          <span className={`${styles.queryStatus} ${query.status === 'answered' ? styles.statusAnswered : styles.statusPending}`}>
                            {query.status === 'answered' ? 'Answered' : 'Awaiting Response'}
                          </span>
                        </div>
                        <div className={styles.queryContent}>
                          <p className={styles.queryMessage}>
                            <span className={styles.queryLabel}>Your Query:</span>
                            {query.message}
                          </p>
                          {query.response ? (
                            <p className={styles.queryResponse}>
                              <span className={styles.responseLabel}>Response:</span>
                              {query.response}
                            </p>
                          ) : (
                            <p className={styles.pendingResponse}>
                              No response yet from event organizer
                            </p>
                          )}
                        </div>
                        <div className={styles.queryFooter}>
                          <span className={styles.queryDate}>
                            Posted on {new Date(query.created_at).toLocaleDateString()}
                          </span>
                          <button 
                            className={styles.viewEventButton}
                            onClick={() => handleViewEventDetails(query.event_id)}
                          >
                            View Event
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;