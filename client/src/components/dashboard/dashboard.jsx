import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import styles from './Dashboard.module.css';
import { eventService } from '../../services/eventService';
import CreateEvent from './CreateEvent';
import { Button } from '@mui/material';

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
  const [myEvents, setMyEvents] = useState([]);
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
    console.log('Viewing event details for ID:', eventId);
    navigate(`/events/${eventId}`);
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
            className={`${styles.navItem} ${activeTab === 'all-events' ? styles.active : ''}`}
            onClick={() => setActiveTab('all-events')}
          >
            <span className={styles.navIcon}>📅</span>
            All Events
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'my-events' ? styles.active : ''}`}
            onClick={() => setActiveTab('my-events')}
          >
            <span className={styles.navIcon}>🗓️</span>
            My Events
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'volunteer' ? styles.active : ''}`}
            onClick={() => setActiveTab('volunteer')}
          >
            <span className={styles.navIcon}>🤝</span>
            Volunteer
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

              {/* Volunteer Section */}
              <section className={styles.volunteersSection}>
                <div className={styles.sectionHeader}>
                  <h2>My Volunteer Activities</h2>
                  <Button
                    className={styles.viewAllButton}
                    onClick={() => navigate('/volunteer-history')}
                  >
                    View All
                  </Button>
                </div>
                <div className={styles.volunteerStats}>
                  <div className={styles.volunteerStat}>
                    <span className={styles.statValue}>12</span>
                    <span className={styles.statLabel}>Hours Contributed</span>
                  </div>
                  <div className={styles.volunteerStat}>
                    <span className={styles.statValue}>3</span>
                    <span className={styles.statLabel}>Events Participated</span>
                  </div>
                  <div className={styles.volunteerStat}>
                    <span className={styles.statValue}>2</span>
                    <span className={styles.statLabel}>Upcoming Commitments</span>
                  </div>
                </div>
                <div className={styles.volunteerActions}>
                  <button 
                    className={styles.actionButton}
                    onClick={() => navigate('/events')}
                  >
                    Find Events to Volunteer
                  </button>
                  <button 
                    className={styles.actionButton}
                    onClick={() => navigate('/volunteer-history')}
                  >
                    View Volunteer History
                  </button>
                </div>
              </section>

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
                  <button
                    className={`${styles.filterButton} ${filterStatus === 'upcoming' ? styles.active : ''}`}
                    onClick={() => setFilterStatus('upcoming')}
                  >
                    Upcoming
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
                    />
                  ))
                )}
              </div>
            </section>
          )}

          {/* New Volunteer Tab */}
          {activeTab === 'volunteer' && (
            <section className={styles.volunteerSection}>
              <div className={styles.sectionHeader}>
                <h2>Volunteer Dashboard</h2>
              </div>
              
              {/* Volunteer Stats */}
              <div className={styles.statsGrid}>
                <StatCard
                  title="Hours Contributed"
                  value="15"
                  icon="⏱️"
                  trend={10}
                />
                <StatCard
                  title="Events Joined"
                  value="4"
                  icon="🤝"
                  trend={25}
                />
                <StatCard
                  title="Upcoming Events"
                  value="2"
                  icon="📅"
                  trend={0}
                />
                <StatCard
                  title="Skills Utilized"
                  value="6"
                  icon="🛠️"
                  trend={15}
                />
              </div>
              
              {/* Volunteer Actions */}
              <div className={styles.actionCards}>
                <div className={styles.actionCard} onClick={() => navigate('/events')}>
                  <div className={styles.actionIcon}>🔍</div>
                  <h3>Find Opportunities</h3>
                  <p>Browse available volunteer opportunities</p>
                </div>
                <div className={styles.actionCard} onClick={() => navigate('/volunteer-history')}>
                  <div className={styles.actionIcon}>📊</div>
                  <h3>My History</h3>
                  <p>View your volunteering history and stats</p>
                </div>
                <div className={styles.actionCard} onClick={() => navigate('/volunteers/certificates')}>
                  <div className={styles.actionIcon}>🏆</div>
                  <h3>Certificates</h3>
                  <p>Download your volunteer certificates</p>
                </div>
                <div className={styles.actionCard} onClick={() => navigate('/volunteer-export')}>
                  <div className={styles.actionIcon}>📤</div>
                  <h3>Export Data</h3>
                  <p>Export your volunteer data</p>
                </div>
              </div>
              
              {/* Upcoming Commitments */}
              <div className={styles.upcomingCommitments}>
                <h3>Upcoming Volunteer Commitments</h3>
                <div className={styles.commitmentsList}>
                  <div className={styles.commitmentCard}>
                    <div className={styles.commitmentHeader}>
                      <h4>Community Garden Cleanup</h4>
                      <span className={styles.commitmentDate}>Aug 15, 2023</span>
                    </div>
                    <p>Help clean and prepare the community garden for fall planting</p>
                    <div className={styles.commitmentFooter}>
                      <span>📍 Central Park</span>
                      <span>⏱️ 3 hours committed</span>
                    </div>
                  </div>
                  <div className={styles.commitmentCard}>
                    <div className={styles.commitmentHeader}>
                      <h4>Food Bank Distribution</h4>
                      <span className={styles.commitmentDate}>Aug 22, 2023</span>
                    </div>
                    <p>Help distribute food to families in need at the local food bank</p>
                    <div className={styles.commitmentFooter}>
                      <span>📍 Community Center</span>
                      <span>⏱️ 4 hours committed</span>
                    </div>
                  </div>
                </div>
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