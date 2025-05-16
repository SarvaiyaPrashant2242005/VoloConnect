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
  useMediaQuery
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../config/api';

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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative',
          height: { xs: '300px', md: '500px' },
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${event.image_url || getDefaultImage(event.type)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)'
            }
          }}
        />
        
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            pb: 4
          }}
        >
          <Button 
            variant="contained" 
            component={Link} 
            to="/dashboard"
            startIcon={<ArrowBackIcon />}
            sx={{ 
              alignSelf: 'flex-start',
              mb: 3,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)'
              }
            }}
          >
            Back to Dashboard
          </Button>
          
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
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
            sx={{ 
              textTransform: 'capitalize',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1rem',
              height: '32px'
            }}
          />
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Left Column - Event Details */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                borderRadius: 2,
                bgcolor: 'background.paper',
                mb: 4
              }}
            >
              <Typography variant="h5" gutterBottom>
                About this Event
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: 'text.secondary', mb: 4 }}>
                {event.description}
              </Typography>

              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOnIcon color="primary" sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">{event.location}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarTodayIcon color="primary" sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(startDate)} to {formatDate(endDate)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccessTimeIcon color="primary" sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Time
                    </Typography>
                    <Typography variant="body1">
                      {formatTime(startDate)} - {formatTime(endDate)}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Right Column - Volunteer Info & Actions */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon /> Volunteer Spots
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h3" color="primary">
                      {event.current_volunteers || 0}/{event.max_volunteers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      spots filled
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon /> Organizer
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main',
                        width: 56,
                        height: 56,
                        fontSize: '1.5rem'
                      }}
                    >
                      {event.organizer_name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {event.organizer_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.organizer_email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {!isOrganizer && (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      component={Link}
                      to={`/events/${event.id}/volunteer`}
                      sx={{ 
                        py: 2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem'
                      }}
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
                        sx={{ 
                          py: 2,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1.1rem'
                        }}
                      >
                        Manage Volunteers
                      </Button>
                      
                      <Button 
                        variant="outlined"
                        color="primary"
                        component={Link}
                        to={`/events/${event.id}/edit`}
                        sx={{ 
                          py: 2,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1.1rem'
                        }}
                      >
                        Edit Event
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EventDetail; 