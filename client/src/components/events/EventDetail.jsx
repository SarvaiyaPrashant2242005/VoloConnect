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
  Alert
} from '@mui/material';
import api from '../../config/api';

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
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>Event not found</Alert>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </Container>
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        variant="outlined" 
        component={Link} 
        to="/dashboard" 
        sx={{ mb: 3 }}
      >
        ← Back
      </Button>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          bgcolor: 'background.paper',
          color: 'text.primary'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {event.title}
          </Typography>
          <Chip 
            label={event.status} 
            color={
              event.status === 'active' ? 'success' : 
              event.status === 'completed' ? 'default' : 
              event.status === 'cancelled' ? 'error' : 
              'primary'
            }
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph>
            {event.description}
          </Typography>
        </Box>
        
        <Card sx={{ mb: 4, bgcolor: 'background.default' }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Event Details
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      📍 Location
                    </Typography>
                    <Typography variant="body1">
                      {event.location}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      📅 Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(startDate)} to {formatDate(endDate)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      🕒 Time
                    </Typography>
                    <Typography variant="body1">
                      {formatTime(startDate)} - {formatTime(endDate)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  👥 Volunteers
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" fontWeight="bold">
                    {event.current_volunteers || 0} / {event.max_volunteers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    spots filled
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    👤 Organizer
                  </Typography>
                  <Typography variant="body1">
                    {event.organizer_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.organizer_email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {!isOrganizer && (
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={Link}
              to={`/events/${event.id}/volunteer`}
              sx={{ py: 1.5, px: 4 }}
            >
              VOLUNTEER FOR THIS EVENT
            </Button>
          )}
          
          {isOrganizer && (
            <>
              <Button 
                variant="outlined" 
                color="primary"
                component={Link}
                to={`/events/${event.id}/manage-volunteers`}
                sx={{ py: 1.5, px: 4 }}
              >
                MANAGE VOLUNTEERS
              </Button>
              
              <Button 
                variant="outlined"
                color="primary"
                component={Link}
                to={`/events/${event.id}/edit`}
                sx={{ py: 1.5, px: 4 }}
              >
                EDIT EVENT
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default EventDetail; 