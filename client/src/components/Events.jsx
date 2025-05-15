import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Events.css';
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Container, Box, Chip, Button, Divider, Paper } from '@mui/material';
import { format } from 'date-fns';
import api from '../config/api';

// Event Detail component
const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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

  if (loading) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Loading event details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h5" color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </Box>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Event not found
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </Box>
      </Container>
    );
  }

  const formattedStartDate = format(new Date(event.start_date), 'MMMM dd, yyyy');
  const formattedStartTime = format(new Date(event.start_date), 'h:mm a');
  const formattedEndDate = format(new Date(event.end_date), 'MMMM dd, yyyy');
  const formattedEndTime = format(new Date(event.end_date), 'h:mm a');

  const isOrganizer = currentUser && event.organizer_id === currentUser.id;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button 
        variant="outlined"
        sx={{ mb: 3 }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>
      
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {event.title}
          </Typography>
          <Chip 
            label={event.status} 
            color={
              event.status === 'active' ? 'success' : 
              event.status === 'full' ? 'error' : 'default'
            }
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
            {event.description}
          </Typography>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">
                📍 Location
              </Typography>
              <Typography variant="body1">{event.location}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">
                📅 Date
              </Typography>
              <Typography variant="body1">
                {formattedStartDate} {formattedStartDate !== formattedEndDate && `to ${formattedEndDate}`}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                ⏰ Time
              </Typography>
              <Typography variant="body1">
                {formattedStartTime} - {formattedEndTime}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">
                👥 Volunteers
              </Typography>
              <Typography variant="body1">
                {event.current_volunteers || 0} / {event.max_volunteers} spots filled
              </Typography>
              <Box sx={{ mt: 1, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 5, height: 10 }}>
                <Box 
                  sx={{ 
                    width: `${Math.min(((event.current_volunteers || 0) / event.max_volunteers) * 100, 100)}%`,
                    backgroundColor: event.status === 'full' ? '#f44336' : '#4caf50',
                    height: '100%',
                    borderRadius: 5
                  }}
                />
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                👤 Organizer
              </Typography>
              <Typography variant="body1">
                {event.first_name} {event.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {event.organizer_email}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="contained" 
            size="large"
            disabled={event.status === 'full' || event.status === 'completed'}
            onClick={() => navigate(`/events/${event.id}/volunteer`)}
          >
            {event.status === 'full' ? 'Event Full' : 
             event.status === 'completed' ? 'Event Completed' : 'Volunteer for this Event'}
          </Button>
          
          {isOrganizer && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined"
                onClick={() => navigate(`/events/${event.id}/manage-volunteers`)}
              >
                Manage Volunteers
              </Button>
              <Button variant="outlined">
                Edit Event
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from session storage
    const userDataString = sessionStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setCurrentUser(userData);
    }

    const fetchEvents = async () => {
      try {
        const response = await api.get('/api/events');
        // Ensure that we have an array, even if the API returns something else
        setEvents(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to fetch events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Loading events...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h5" color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Events</h1>
        <button 
          className="create-event-button"
          onClick={() => navigate('/events/create')}
        >
          Create New Event
        </button>
      </div>

      <div className="events-content">
        <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Upcoming Events
      </Typography>
      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item key={event.id} xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                },
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {event.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    📍 {event.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    🗓 {format(new Date(event.start_date), 'MMM dd, yyyy')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ⏰ {format(new Date(event.start_date), 'hh:mm a')} - {format(new Date(event.end_date), 'hh:mm a')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={event.status} 
                    color={event.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                  <Chip 
                    label={`${event.max_volunteers} volunteers needed`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                {event.organizer_email && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Organized by: {event.first_name} {event.last_name}
                  </Typography>
                )}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    size="small" 
                    variant="contained"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/events/${event.id}/volunteer`);
                    }}
                  >
                    Volunteer
                  </Button>
                  {/* Show management buttons if user is the organizer */}
                  {currentUser && (event.organizer_id === currentUser.id) && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event.id}/manage-volunteers`);
                        }}
                      >
                        Manage Volunteers
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/volunteer-export');
                        }}
                      >
                        Export Data
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
      </div>
    </div>
  );
};

export { Events as default, EventDetail }; 