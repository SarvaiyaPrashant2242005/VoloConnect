import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

const VolunteerHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [stats, setStats] = useState({
    totalHours: 0,
    totalEvents: 0,
    skillsUtilized: []
  });

  useEffect(() => {
    const fetchVolunteerHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/volunteers/history');
        
        if (response.data) {
          setHistory(response.data);
          
          // Process data into upcoming and past events
          const now = new Date();
          const upcoming = response.data.filter(item => new Date(item.event_date) > now);
          const past = response.data.filter(item => new Date(item.event_date) <= now);
          
          setUpcomingEvents(upcoming);
          setPastEvents(past);
          
          // Calculate volunteer stats
          const totalHours = past.reduce((sum, item) => sum + (item.hours_worked || 0), 0);
          const totalEvents = past.length;
          
          // Extract unique skills utilized
          const allSkills = past.flatMap(item => {
            try {
              return JSON.parse(item.skills_utilized || '[]');
            } catch (e) {
              return [];
            }
          });
          const uniqueSkills = [...new Set(allSkills)];
          
          setStats({
            totalHours,
            totalEvents,
            skillsUtilized: uniqueSkills
          });
        }
      } catch (err) {
        console.error('Error fetching volunteer history:', err);
        setError('Failed to load volunteer history');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteerHistory();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'upcoming':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Volunteering History
      </Typography>

      {/* Volunteer Stats */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: 'background.paper',
          borderRadius: 2
        }}
      >
        <Typography variant="h5" gutterBottom>Volunteer Summary</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="text.secondary">Total Hours</Typography>
              <Typography variant="h3" color="primary">{stats.totalHours}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="text.secondary">Events Participated</Typography>
              <Typography variant="h3" color="primary">{stats.totalEvents}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="text.secondary">Skills Utilized</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 1 }}>
                {stats.skillsUtilized.map((skill, index) => (
                  <Chip key={index} label={skill} color="primary" size="small" />
                ))}
                {stats.skillsUtilized.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No skills tracked yet</Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Upcoming Events */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Upcoming Volunteer Commitments
      </Typography>
      
      {upcomingEvents.length > 0 ? (
        <Grid container spacing={3}>
          {upcomingEvents.map((item) => (
            <Grid item key={item.id} xs={12} md={6}>
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
                  <Typography variant="h6" gutterBottom>
                    {item.event_title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      📅 {format(new Date(item.event_date), 'MMM dd, yyyy')}
                    </Typography>
                    <Chip 
                      label={item.status} 
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">📍 {item.location}</Typography>
                    <Typography variant="body2">⏰ {item.time_commitment} hours committed</Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      size="small" 
                      onClick={() => navigate(`/events/${item.event_id}`)}
                    >
                      View Event Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            You don't have any upcoming volunteer commitments.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigate('/events')}
          >
            Find Events to Volunteer
          </Button>
        </Paper>
      )}

      {/* Past Events */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Past Volunteer Work
      </Typography>
      
      {pastEvents.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Skills Used</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pastEvents.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body1">{item.event_title}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.organization}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{format(new Date(item.event_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.hours_worked || 'N/A'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(JSON.parse(item.skills_utilized || '[]') || []).map((skill, idx) => (
                        <Chip key={idx} label={skill} size="small" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={item.status} 
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            You don't have any past volunteer work yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigate('/events')}
          >
            Find Events to Volunteer
          </Button>
        </Paper>
      )}
      
      {/* Certificate Button */}
      {pastEvents.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={() => navigate('/volunteers/certificates')}
          >
            View/Download My Volunteer Certificates
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default VolunteerHistory; 