import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { eventService } from '../../services/eventService';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../config/api';

const EventEdit = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: new Date(),
    end_date: new Date(new Date().getTime() + 3600000), // Default to 1 hour later
    max_volunteers: 10,
    status: 'active'
  });

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/events/${eventId}`);
        
        if (!response.data) {
          throw new Error('Failed to load event details');
        }
        
        const event = response.data.data || response.data;
        
        // Check if current user is the organizer
        if (user.id !== event.organizer_id) {
          navigate('/dashboard');
          return;
        }
        
        setEventData({
          title: event.title,
          description: event.description,
          location: event.location,
          start_date: new Date(event.start_date),
          end_date: new Date(event.end_date),
          max_volunteers: event.max_volunteers,
          status: event.status
        });
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again.');
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, date) => {
    setEventData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await eventService.updateEvent(eventId, eventData);
      setSuccess(true);
      setOpenSnackbar(true);
      
      // Navigate back after successful update
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err.message || 'Failed to update event. Please try again.');
      setOpenSnackbar(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: isMobile ? 2 : 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: isMobile ? 2 : 4 }}>
          <Typography>Loading event details...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 2
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: isMobile ? 2 : 4,
          borderRadius: isMobile ? 1 : 2,
          bgcolor: 'background.paper',
          color: 'text.primary',
          border: 1,
          borderColor: 'divider'
        }}
      >
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom
          sx={{ mb: isMobile ? 2 : 3, color: 'text.primary' }}
        >
          Edit Event
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Title"
                name="title"
                value={eventData.title}
                onChange={handleChange}
                required
                size={isMobile ? "small" : "medium"}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={eventData.description}
                onChange={handleChange}
                multiline
                rows={isMobile ? 3 : 4}
                required
                size={isMobile ? "small" : "medium"}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={eventData.location}
                onChange={handleChange}
                required
                size={isMobile ? "small" : "medium"}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Date & Time"
                  value={eventData.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      required 
                      size={isMobile ? "small" : "medium"}
                      sx={{ bgcolor: 'background.paper' }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="End Date & Time"
                  value={eventData.end_date}
                  onChange={(date) => handleDateChange('end_date', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      required 
                      size={isMobile ? "small" : "medium"}
                      sx={{ bgcolor: 'background.paper' }}
                    />
                  )}
                  minDateTime={new Date(eventData.start_date.getTime() + 1800000)} // At least 30 min after start
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Volunteers"
                name="max_volunteers"
                type="number"
                value={eventData.max_volunteers}
                onChange={handleChange}
                inputProps={{ min: 1 }}
                required
                size={isMobile ? "small" : "medium"}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size={isMobile ? "small" : "medium"} sx={{ bgcolor: 'background.paper' }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={eventData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                gap: isMobile ? 1 : 2, 
                justifyContent: 'flex-end',
                flexDirection: isMobile ? 'column' : 'row',
                mt: isMobile ? 1 : 2
              }}>
                {isMobile ? (
                  <>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={saving}
                      fullWidth
                      size="large"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/dashboard')}
                      fullWidth
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/dashboard')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={success ? "success" : "error"} 
          sx={{ width: '100%' }}
        >
          {success ? 'Event updated successfully!' : error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EventEdit; 