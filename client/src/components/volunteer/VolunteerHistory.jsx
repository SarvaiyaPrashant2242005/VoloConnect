import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Badge,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  StarRate as StarIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

const VolunteerHistory = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [volunteerHistory, setVolunteerHistory] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [stats, setStats] = useState({
    totalHours: 0,
    eventsParticipated: 0,
    upcomingCommitments: 0,
    skillsUtilized: 0
  });

  useEffect(() => {
    const fetchVolunteerData = async () => {
      try {
        setLoading(true);
        
        // Fetch volunteer history
        const historyResponse = await api.get('/api/volunteers/history');
        
        if (historyResponse.data && historyResponse.data.success) {
          // Process volunteer history
          const pastEvents = historyResponse.data.data.filter(event => 
            new Date(event.end_date) < new Date()
          );
          
          const upcoming = historyResponse.data.data.filter(event => 
            new Date(event.end_date) >= new Date()
          );
          
          setVolunteerHistory(pastEvents);
          setUpcomingEvents(upcoming);
          
          // Calculate stats
          const totalHours = pastEvents.reduce((sum, event) => sum + (parseFloat(event.hours_contributed) || 0), 0);
          
          // Get unique skills utilized across all events
          const allSkills = new Set();
          historyResponse.data.data.forEach(event => {
            try {
              const skills = typeof event.skills === 'string' 
                ? JSON.parse(event.skills || '[]') 
                : (event.skills || []);
              
              skills.forEach(skill => allSkills.add(skill));
            } catch (e) {
              console.error('Error parsing skills:', e);
            }
          });
          
          setStats({
            totalHours,
            eventsParticipated: pastEvents.length,
            upcomingCommitments: upcoming.length,
            skillsUtilized: allSkills.size
          });
        } else {
          // Handle unexpected response format
          console.error('Unexpected response format:', historyResponse.data);
          setVolunteerHistory([]);
          setUpcomingEvents([]);
        }
      } catch (err) {
        console.error('Error fetching volunteer history:', err);
        setError('Failed to load volunteer history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVolunteerData();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'approved': return 'primary';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };
  
  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 8 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading volunteer history...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Volunteer History
      </Typography>
      
      {/* Statistics Section */}
      <Paper 
        elevation={3} 
        sx={{ p: 3, mb: 4, bgcolor: 'background.paper', borderRadius: 2 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="text.secondary">Hours Contributed</Typography>
              <Typography variant="h3" color="primary">{stats.totalHours.toFixed(1)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="text.secondary">Events Participated</Typography>
              <Typography variant="h3" color="primary">{stats.eventsParticipated}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="text.secondary">Upcoming Events</Typography>
              <Typography variant="h3" color="primary">{stats.upcomingCommitments}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="text.secondary">Skills Utilized</Typography>
              <Typography variant="h3" color="primary">{stats.skillsUtilized}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs Section */}
      <Paper 
        elevation={3} 
        sx={{ bgcolor: 'background.paper', borderRadius: 2, mb: 4, overflow: 'hidden' }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>Upcoming Commitments</span>
                {upcomingEvents.length > 0 && (
                  <Badge
                    badgeContent={upcomingEvents.length}
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            } 
          />
          <Tab label="Past Events" />
          <Tab label="Certificates & Badges" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {/* Upcoming Commitments Tab */}
          {tabValue === 0 && (
            <>
              {upcomingEvents.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" gutterBottom>No upcoming volunteer commitments</Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/events')}
                    sx={{ mt: 2 }}
                  >
                    Find Volunteer Opportunities
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {upcomingEvents.map((event) => (
                    <Grid item xs={12} md={6} key={event.id}>
                      <Card 
                        elevation={2} 
                        sx={{ 
                          height: '100%',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">{event.title}</Typography>
                            <Chip 
                              label={event.status} 
                              color={getStatusColor(event.status)} 
                              size="small" 
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary">
                            {event.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                              <Typography variant="body2">
                                {formatDate(event.start_date)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                              <Typography variant="body2">{event.location}</Typography>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 1.5 }} />
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                            {typeof event.available_hours === 'string' && event.available_hours ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {event.available_hours}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Hours not specified
                              </Typography>
                            )}
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => navigate(`/events/${event.event_id}`)}
                            >
                              View Details
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
          
          {/* Past Events Tab */}
          {tabValue === 1 && (
            <>
              {volunteerHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" gutterBottom>No past volunteer activities</Typography>
                  <Typography variant="body1" color="text.secondary">
                    Start your volunteer journey today!
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/events')}
                  >
                    Find Volunteer Opportunities
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {volunteerHistory.map((event) => (
                    <Grid item xs={12} key={event.id}>
                      <Card elevation={1}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="h6">{event.title}</Typography>
                                <Chip 
                                  label={event.status === 'completed' ? 'Completed' : event.status} 
                                  color={getStatusColor(event.status)} 
                                  size="small"
                                  icon={event.status === 'completed' ? <CheckIcon /> : undefined}
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary">
                                {event.description}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                                  <Typography variant="body2">
                                    {formatDate(event.start_date)}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <LocationIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                                  <Typography variant="body2">{event.location}</Typography>
                                </Box>
                              </Box>
                              
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Skills Utilized:</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {(() => {
                                    let skillsArray = [];
                                    try {
                                      if (typeof event.skills === 'string') {
                                        skillsArray = JSON.parse(event.skills || '[]');
                                      } else if (Array.isArray(event.skills)) {
                                        skillsArray = event.skills;
                                      }
                                    } catch (e) {
                                      console.error('Error parsing skills:', e);
                                    }
                                    return skillsArray.map((skill, idx) => (
                                      <Chip key={idx} label={skill} size="small" />
                                    ));
                                  })()}
                                </Box>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                              <Box sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: 'background.default',
                                borderRadius: 1,
                                p: 2
                              }}>
                                <Typography variant="h6" color="primary" gutterBottom>
                                  Hours Contributed
                                </Typography>
                                <Typography variant="h3" color="text.primary">
                                  {Number(event.hours_contributed).toFixed(1)}
                                </Typography>
                                {event.feedback && (
                                  <Box sx={{ mt: 2, width: '100%' }}>
                                    <Typography variant="subtitle2">Organizer Feedback:</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      "{event.feedback}"
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
          
          {/* Certificates Tab */}
          {tabValue === 2 && (
            <>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>Your Volunteer Achievements</Typography>
                
                {stats.eventsParticipated === 0 ? (
                  <Typography variant="body1" color="text.secondary">
                    Complete volunteer activities to earn certificates and badges!
                  </Typography>
                ) : (
                  <>
                    <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                      <Typography variant="subtitle2" gutterBottom align="left">
                        Volunteer Progress
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((stats.totalHours / 50) * 100, 100)} 
                        sx={{ height: 10, borderRadius: 5, mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary" align="right">
                        {stats.totalHours.toFixed(1)}/50 hours
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={3} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <StarIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                              Volunteer Certificate
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center">
                              {stats.eventsParticipated >= 3 
                                ? 'You\'ve earned a volunteer certificate!' 
                                : `Complete ${3 - stats.eventsParticipated} more events to earn this certificate`}
                            </Typography>
                            <Button 
                              variant="outlined" 
                              disabled={stats.eventsParticipated < 3}
                              sx={{ mt: 'auto' }}
                            >
                              {stats.eventsParticipated >= 3 ? 'Download Certificate' : 'Locked'}
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={4}>
                        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <StarIcon color={stats.totalHours >= 20 ? 'primary' : 'disabled'} sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                              20+ Hour Badge
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center">
                              {stats.totalHours >= 20 
                                ? 'You\'ve earned the 20+ hour volunteer badge!' 
                                : `Contribute ${(20 - stats.totalHours).toFixed(1)} more hours to earn this badge`}
                            </Typography>
                            <Button 
                              variant="outlined" 
                              disabled={stats.totalHours < 20}
                              sx={{ mt: 'auto' }}
                            >
                              {stats.totalHours >= 20 ? 'View Badge' : 'Locked'}
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={4}>
                        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <StarIcon color={stats.skillsUtilized >= 5 ? 'primary' : 'disabled'} sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                              Multi-Skilled Badge
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center">
                              {stats.skillsUtilized >= 5 
                                ? 'You\'ve earned the multi-skilled volunteer badge!' 
                                : `Utilize ${5 - stats.skillsUtilized} more skills to earn this badge`}
                            </Typography>
                            <Button 
                              variant="outlined" 
                              disabled={stats.skillsUtilized < 5}
                              sx={{ mt: 'auto' }}
                            >
                              {stats.skillsUtilized >= 5 ? 'View Badge' : 'Locked'}
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </>
                )}
                
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/events')}
                  sx={{ mt: 4 }}
                >
                  Find More Opportunities
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default VolunteerHistory; 