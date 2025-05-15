import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Events.css';
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Container, Box, Chip, Button } from '@mui/material';
import { format } from 'date-fns';
import api from '../config/api';

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
        setEvents(response.data);
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
                }
              }}
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
                    onClick={() => navigate(`/events/${event.id}/volunteer`)}
                  >
                    Volunteer
                  </Button>
                  {/* Show management buttons if user is the organizer */}
                  {currentUser && (event.organizer_id === currentUser.id) && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => navigate(`/events/${event.id}/manage-volunteers`)}
                      >
                        Manage Volunteers
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => navigate('/volunteer-export')}
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

export default Events; 