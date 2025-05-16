import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Grid,
  Paper,
  Tab,
  Tabs,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import api from '../../config/api';

const MyVolunteers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organizedEvents, setOrganizedEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchVolunteersForEvent(selectedEventId);
    }
  }, [selectedEventId]);

  // Debug hook to monitor volunteer data changes
  useEffect(() => {
    if (volunteers.length > 0) {
      console.log('Volunteers data updated:', volunteers);
      // Log all volunteer IDs to help with troubleshooting
      console.log('Volunteer IDs:', volunteers.map(v => ({ id: v.id, volunteer_id: v.volunteer_id })));
    }
  }, [volunteers]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/events/my-events');
      
      if (response.data && response.data.success) {
        setOrganizedEvents(response.data.data || []);
        
        // Select the first event by default if available
        if (response.data.data && response.data.data.length > 0) {
          setSelectedEventId(response.data.data[0].id);
        }
      } else {
        setOrganizedEvents([]);
      }
    } catch (err) {
      console.error('Error fetching organized events:', err);
      setError('Failed to load your organized events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteersForEvent = async (eventId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/events/${eventId}/volunteers`);
      
      console.log('Volunteers API response:', response.data);
      
      if (response.data && response.data.success) {
        // Make sure we're using the right ID field
        const volunteersData = response.data.data || [];
        console.log('First volunteer from response:', volunteersData[0]);
        setVolunteers(volunteersData);
      } else {
        setVolunteers([]);
      }
    } catch (err) {
      console.error(`Error fetching volunteers for event ${eventId}:`, err.response?.data || err);
      setError('Failed to load volunteers for this event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Alternative approach using different API endpoints if the main one fails
  const tryAlternativeApproach = async (volunteerId, newStatus) => {
    try {
      const volunteer = volunteers.find(v => v.id === volunteerId);
      if (!volunteer) {
        console.error('Volunteer not found:', volunteerId);
        return false;
      }
      
      console.log('Trying alternative API endpoint...');
      
      // Try the approve/reject specific endpoints
      let endpoint = '';
      if (newStatus === 'approved') {
        endpoint = `/api/events/${selectedEventId}/volunteers/${volunteerId}/approve`;
      } else if (newStatus === 'rejected') {
        endpoint = `/api/events/${selectedEventId}/volunteers/${volunteerId}/reject`;
      } else {
        endpoint = `/api/events/${selectedEventId}/volunteers/${volunteerId}/reset`;
      }
      
      try {
        const response = await api.put(endpoint, {
          feedback: '',
          volunteer_id: volunteer.volunteer_id
        });
        
        console.log('Alternative endpoint response:', response.data);
        
        if (response.data && response.data.success) {
          setError(null);
          await fetchVolunteersForEvent(selectedEventId);
          return true;
        }
      } catch (endpointError) {
        console.error('Alternative endpoint failed:', endpointError);
      }
      
      // If we get here, try the direct table update as a final fallback
      console.log('Attempting final fallback with direct table update...');
      return await directTableUpdate(volunteerId, newStatus);
    } catch (err) {
      console.error('All approaches failed:', err);
      return false;
    }
  };

  const handleUpdateVolunteerStatus = async (volunteerId, newStatus) => {
    try {
      // Log volunteer data we're trying to update
      const volunteer = volunteers.find(v => v.id === volunteerId);
      console.log('Volunteer data:', volunteer);
      console.log('Updating volunteer status:', { volunteerId, eventId: selectedEventId, newStatus });
      
      // Use the simple endpoint for all status updates
      const response = await api.post(`/api/events/volunteer/update-status`, {
        volunteer_id: volunteerId,
        event_id: selectedEventId,
        status: newStatus
      });
      
      console.log('Status update response:', response.data);
      
      if (response.data && response.data.success) {
        // Success message
        setError(null); // Clear any previous errors
        // Refresh the volunteers list
        await fetchVolunteersForEvent(selectedEventId);
      } else {
        // API responded but indicated failure
        console.error('API error:', response.data);
        setError(response.data?.message || 'Failed to update volunteer status');
      }
    } catch (err) {
      console.error('Error updating volunteer status:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to update volunteer status. Please try again.');
    }
  };

  const handleEventChange = (eventId) => {
    setSelectedEventId(eventId);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filter volunteers based on tab
  const filteredVolunteers = volunteers.filter(volunteer => {
    console.log('Filtering volunteer:', volunteer);
    
    if (tabValue === 0) return true; // All volunteers
    if (tabValue === 1) return volunteer.status === 'pending'; // Pending
    if (tabValue === 2) return volunteer.status === 'approved'; // Approved
    if (tabValue === 3) return volunteer.status === 'rejected'; // Rejected
    return true;
  });

  // Debug logs to understand filtering issues
  useEffect(() => {
    if (volunteers.length > 0) {
      console.log('All volunteers:', volunteers);
      console.log('Volunteers by status:', {
        all: volunteers.length,
        pending: volunteers.filter(v => v.status === 'pending').length,
        approved: volunteers.filter(v => v.status === 'approved').length,
        rejected: volunteers.filter(v => v.status === 'rejected').length,
        null_or_undefined: volunteers.filter(v => !v.status).length
      });
    }
  }, [volunteers, tabValue]);

  // Final fallback using direct table update
  const directTableUpdate = async (volunteerId, newStatus) => {
    try {
      const volunteer = volunteers.find(v => v.id === volunteerId);
      if (!volunteer) return false;
      
      console.log('Trying direct table update...');
      
      // Map between status values
      const statusMap = {
        'approved': 'approved',
        'rejected': 'rejected',
        'pending': 'pending'
      };
      
      // Custom endpoint for direct table update
      const response = await api.post(`/api/events/volunteer-status-update`, {
        volunteer_application_id: volunteerId,
        event_id: selectedEventId,
        volunteer_id: volunteer.volunteer_id,
        status: statusMap[newStatus] || 'pending',
        eventIdParam: selectedEventId,
        volunteerId: volunteerId
      });
      
      console.log('Direct update response:', response.data);
      
      if (response.data && response.data.success) {
        setError(null);
        await fetchVolunteersForEvent(selectedEventId);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Direct table update failed:', err.response?.data || err);
      return false;
    }
  };

  const addTestVolunteers = async () => {
    if (!selectedEventId) return;
    
    try {
      setLoading(true);
      const response = await api.post(`/api/events/${selectedEventId}/test-volunteers`, {
        count: 3 // Add 3 test volunteers
      });
      
      console.log('Test volunteers added:', response.data);
      
      // Refresh the volunteers list
      await fetchVolunteersForEvent(selectedEventId);
      
      setError(null);
    } catch (err) {
      console.error('Error adding test volunteers:', err.response?.data || err);
      setError('Failed to add test volunteers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && organizedEvents.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>My Volunteers</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      {organizedEvents.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>You haven't organized any events yet</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Create an event to start managing volunteers
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            href="/events/create"
          >
            Create an Event
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Event Selection */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Your Events</Typography>
              <List sx={{ width: '100%' }}>
                {organizedEvents.map(event => (
                  <ListItem 
                    key={event.id} 
                    button 
                    selected={selectedEventId === event.id}
                    onClick={() => handleEventChange(event.id)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        }
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>{event.title.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={event.title} 
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {new Date(event.start_date).toLocaleDateString()}
                          </Typography>
                          <Typography component="span" variant="body2">
                            {` - ${event.current_volunteers || 0}/${event.max_volunteers} volunteers`}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          {/* Volunteers List */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 2 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : selectedEventId ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    {organizedEvents.find(e => e.id === selectedEventId)?.title} - Volunteers
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Tabs 
                      value={tabValue} 
                      onChange={handleTabChange}
                    >
                      <Tab label="All" />
                      <Tab 
                        label={<>
                          Pending
                          <Chip 
                            size="small" 
                            label={volunteers.filter(v => v.status === 'pending').length} 
                            sx={{ ml: 1 }}
                          />
                        </>} 
                      />
                      <Tab label="Approved" />
                      <Tab label="Rejected" />
                    </Tabs>
                    
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={addTestVolunteers}
                      disabled={loading}
                    >
                      Add Test Volunteers
                    </Button>
                  </Box>
                  
                  {filteredVolunteers.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" gutterBottom>No volunteers found</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tabValue === 0 
                          ? 'There are no volunteers for this event yet.' 
                          : `There are no ${tabValue === 1 ? 'pending' : tabValue === 2 ? 'approved' : 'rejected'} volunteers.`}
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Skills</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredVolunteers.map(volunteer => {
                            // Parse skills array if it's a string
                            let skills = [];
                            try {
                              if (typeof volunteer.skills === 'string') {
                                skills = JSON.parse(volunteer.skills || '[]');
                              } else if (Array.isArray(volunteer.skills)) {
                                skills = volunteer.skills;
                              }
                            } catch (e) {
                              console.error('Error parsing skills:', e, volunteer.skills);
                            }
                            
                            return (
                              <TableRow key={volunteer.id}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ mr: 1 }}>
                                      {volunteer.first_name.charAt(0)}{volunteer.last_name.charAt(0)}
                                    </Avatar>
                                    <Typography>
                                      {volunteer.first_name} {volunteer.last_name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">{volunteer.email}</Typography>
                                  <Typography variant="body2" color="text.secondary">{volunteer.phone}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {skills.map((skill, idx) => (
                                      <Chip key={idx} label={skill} size="small" />
                                    ))}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={volunteer.status || 'pending'}
                                    color={
                                      volunteer.status === 'approved' ? 'success' :
                                      volunteer.status === 'pending' ? 'warning' :
                                      'error'
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  {volunteer.status === 'pending' && (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => handleUpdateVolunteerStatus(volunteer.id, 'approved')}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() => handleUpdateVolunteerStatus(volunteer.id, 'rejected')}
                                      >
                                        Reject
                                      </Button>
                                    </Box>
                                  )}
                                  {volunteer.status !== 'pending' && (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() => handleUpdateVolunteerStatus(volunteer.id, 'pending')}
                                    >
                                      Reset Status
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              ) : (
                <Typography>Please select an event to see its volunteers</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default MyVolunteers; 