import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Chip, 
  Divider, 
  Card, 
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  Rating,
  Stack,
  useTheme,
  useMediaQuery,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';
import api from '../../config/api';
import styles from './EventDetail.module.css';

// Default images for different event types
const defaultImages = {
  community: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
  education: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
  environment: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
  health: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
  default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80'
};

// Function to get appropriate default image based on event type
const getDefaultImage = (eventType) => {
  const type = eventType?.toLowerCase() || 'default';
  return defaultImages[type] || defaultImages.default;
};

/**
 * EventDetail Component
 * Displays detailed information about a specific event
 */
const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [queries, setQueries] = useState([]);
  const [newQuery, setNewQuery] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const [activeQuery, setActiveQuery] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  
  useEffect(() => {
    // Get current user from session storage
    const userDataString = sessionStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setCurrentUser(userData);
    }

    const fetchEventDetails = async () => {
      try {
        const response = await api.get(`/api/events/${eventId}`);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // Fetch queries for this event
  useEffect(() => {
    if (eventId && currentUser) {
      fetchQueries();
    }
  }, [eventId, currentUser]);

  const fetchQueries = async () => {
    try {
      setQueryLoading(true);
      const response = await api.get(`/api/queries/event/${eventId}`);
      setQueries(response.data);
      setQueryLoading(false);
    } catch (err) {
      console.error('Error fetching queries:', err);
      setQueryLoading(false);
    }
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!newQuery.trim()) return;
    
    try {
      await api.post('/api/queries', {
        event_id: eventId,
        message: newQuery
      });
      setNewQuery('');
      fetchQueries(); // Refresh queries
    } catch (err) {
      console.error('Error submitting query:', err);
    }
  };

  const handleSubmitResponse = async (queryId) => {
    if (!queryResponse.trim()) return;
    
    try {
      await api.put(`/api/queries/${queryId}`, {
        response: queryResponse
      });
      setQueryResponse('');
      setActiveQuery(null);
      fetchQueries(); // Refresh queries
    } catch (err) {
      console.error('Error submitting response:', err);
    }
  };

  if (loading) {
    return (
      <Box className={styles.eventDetailContainer} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={styles.eventDetailContainer} sx={{ py: 4 }}>
        <Container>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </Container>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box className={styles.eventDetailContainer} sx={{ py: 4 }}>
        <Container>
          <Alert severity="warning" sx={{ mb: 2 }}>Event not found</Alert>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </Container>
      </Box>
    );
  }
  
  // Check if user is the organizer
  const isOrganizer = currentUser && event.organizer_id === currentUser?.id;
  
  // Format dates
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Calculate volunteer progress percentage
  const volunteerProgress = Math.min(((event.current_volunteers || 0) / event.max_volunteers) * 100, 100);

  return (
    <div className={styles.eventDetailContainer}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div 
          className={styles.heroBackground} 
          style={{ 
            backgroundImage: `url(${event.image_url || getDefaultImage(event.type)})`
          }}
        ></div>
        
        <div className={styles.heroContent}>
          <Button 
            variant="contained" 
            component={Link} 
            to="/dashboard"
            className={styles.backButton}
            startIcon={<ArrowBackIcon />}
          >
            Back to Dashboard
          </Button>
          
          <Typography variant="h2" component="h1" className={styles.eventTitle}>
            {event.title}
          </Typography>
          
          <Chip 
            label={event.status} 
            className={styles.statusChip} 
            color={
              event.status === 'active' ? 'success' : 
              event.status === 'completed' ? 'default' : 
              event.status === 'cancelled' ? 'error' : 
              'primary'
            }
          />
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.contentGrid}>
          {/* Left Column - Event Details */}
          <div>
            {/* About Section */}
            <Paper elevation={0} className={styles.sectionCard}>
              <Typography variant="h5" className={styles.sectionTitle}>
                About this Event
              </Typography>
              <Typography variant="body1" paragraph className={styles.description}>
                {event.description}
              </Typography>

              <div className={styles.detailsList}>
                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <LocationOnIcon />
                  </div>
                  <div className={styles.detailContent}>
                    <Typography variant="subtitle2" className={styles.detailLabel}>
                      Location
                    </Typography>
                    <Typography variant="body1" className={styles.detailValue}>
                      {event.location}
                    </Typography>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <CalendarTodayIcon />
                  </div>
                  <div className={styles.detailContent}>
                    <Typography variant="subtitle2" className={styles.detailLabel}>
                      Date
                    </Typography>
                    <Typography variant="body1" className={styles.detailValue}>
                      {formatDate(startDate)}{startDate.toDateString() !== endDate.toDateString() ? ` to ${formatDate(endDate)}` : ''}
                    </Typography>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <AccessTimeIcon />
                  </div>
                  <div className={styles.detailContent}>
                    <Typography variant="subtitle2" className={styles.detailLabel}>
                      Time
                    </Typography>
                    <Typography variant="body1" className={styles.detailValue}>
                      {formatTime(startDate)} - {formatTime(endDate)}
                    </Typography>
                  </div>
                </div>
              </div>
            </Paper>
            
            {/* Queries Section */}
            <Paper elevation={0} className={styles.sectionCard}>
              <Typography variant="h5" className={styles.sectionTitle}>
                <QuestionAnswerIcon className={styles.sectionIcon} /> Questions & Answers
              </Typography>
              
              {currentUser ? (
                <Box component="form" onSubmit={handleSubmitQuery} className={styles.queryForm}>
                  <TextField
                    fullWidth
                    label="Ask a question about this event"
                    variant="outlined"
                    value={newQuery}
                    onChange={(e) => setNewQuery(e.target.value)}
                    className={styles.queryField}
                    InputProps={{
                      classes: {
                        root: styles.queryFieldInput
                      },
                      endAdornment: (
                        <IconButton 
                          className={styles.sendButton}
                          color="primary" 
                          type="submit" 
                          edge="end"
                          disabled={!newQuery.trim()}
                        >
                          <SendIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Please <Link to="/login">log in</Link> to ask questions about this event.
                </Alert>
              )}
              
              {queryLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : queries.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', my: 3 }}>
                  No questions yet. Be the first to ask!
                </Typography>
              ) : (
                <List className={styles.queryList}>
                  {queries.map((query) => (
                    <React.Fragment key={query.id}>
                      <ListItem className={styles.queryItem} alignItems="flex-start">
                        <Box sx={{ display: 'flex', mb: 1, width: '100%' }}>
                          <ListItemAvatar>
                            <Avatar className={styles.queryAvatar}>{query.user_name?.charAt(0) || 'U'}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="subtitle1" className={styles.queryMessage}>{query.message}</Typography>}
                            secondary={
                              <Typography variant="caption" className={styles.queryTime}>
                                {new Date(query.created_at).toLocaleString()}
                              </Typography>
                            }
                          />
                        </Box>
                        
                        {query.response && (
                          <div className={styles.responseContainer}>
                            <div className={styles.responseBox}>
                              <Typography variant="body2" className={styles.responseText}>{query.response}</Typography>
                              <Typography variant="caption" className={styles.responseAuthor}>
                                Response from {query.responder_name || 'organizer'}
                              </Typography>
                            </div>
                          </div>
                        )}
                        
                        {isOrganizer && !query.response && (
                          <Box sx={{ pl: 7, mt: 1 }}>
                            {activeQuery === query.id ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Your response"
                                  variant="outlined"
                                  value={queryResponse}
                                  onChange={(e) => setQueryResponse(e.target.value)}
                                />
                                <Button 
                                  variant="contained" 
                                  color="primary" 
                                  size="small"
                                  onClick={() => handleSubmitResponse(query.id)}
                                  disabled={!queryResponse.trim()}
                                >
                                  Send
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  size="small"
                                  onClick={() => {
                                    setActiveQuery(null);
                                    setQueryResponse('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            ) : (
                              <Button 
                                variant="text" 
                                color="primary" 
                                size="small"
                                startIcon={<ReplyIcon />}
                                onClick={() => setActiveQuery(query.id)}
                              >
                                Respond
                              </Button>
                            )}
                          </Box>
                        )}
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </div>

          {/* Right Column - Volunteer Info & Actions */}
          <div>
            {/* Volunteer Stats Card */}
            <Card className={styles.statsCard}>
              <CardContent>
                <Typography variant="h6" className={styles.sectionTitle}>
                  <PeopleIcon className={styles.sectionIcon} /> Volunteer Spots
                </Typography>
                
                <Typography variant="h3" className={styles.volunteerCount}>
                  {event.current_volunteers || 0}/{event.max_volunteers}
                </Typography>
                
                <Typography variant="body2" className={styles.volunteerLabel}>
                  volunteer spots filled
                </Typography>
                
                <div className={styles.progressContainer}>
                  <div 
                    className={styles.progressBar} 
                    style={{ width: `${volunteerProgress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Card */}
            <Card className={styles.statsCard}>
              <CardContent>
                <Typography variant="h6" className={styles.sectionTitle}>
                  <PersonIcon className={styles.sectionIcon} /> Organizer
                </Typography>
                
                <div className={styles.organizerHeader}>
                  <Avatar className={styles.organizerAvatar}>
                    {event.organizer_name?.charAt(0) || 'O'}
                  </Avatar>
                  
                  <div>
                    <Typography variant="body1" className={styles.organizerName}>
                      {event.organizer_name || 'Event Organizer'}
                    </Typography>
                    
                    <Typography variant="body2" className={styles.organizerEmail}>
                      {event.organizer_email}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ mt: 3 }}>
              {!isOrganizer && (
                <Button 
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/events/${event.id}/volunteer`}
                  className={`${styles.actionButton} ${styles.primaryButton}`}
                  disabled={event.status !== 'active'}
                >
                  Volunteer Now
                </Button>
              )}
              
              {isOrganizer && (
                <>
                  <Button 
                    variant="contained" 
                    color="primary"
                    component={Link}
                    to={`/events/${event.id}/manage-volunteers`}
                    className={`${styles.actionButton} ${styles.primaryButton}`}
                  >
                    Manage Volunteers
                  </Button>
                  
                  <Button 
                    variant="outlined"
                    color="primary"
                    component={Link}
                    to={`/events/${event.id}/edit`}
                    className={`${styles.actionButton} ${styles.secondaryButton}`}
                  >
                    Edit Event
                  </Button>
                </>
              )}
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail; 