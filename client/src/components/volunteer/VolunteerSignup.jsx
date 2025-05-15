import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  Grid,
  Snackbar,
  Alert,
  Card,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/api';
import { AuthContext } from '../../context/AuthContext.jsx';

const VolunteerSignup = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [volunteerData, setVolunteerData] = useState({
    availableHours: '',
    specialNeeds: '',
    notes: '',
    skills: []
  });

  const [event, setEvent] = useState(null);
  const [isOrganizer, setIsOrganizer] = useState(false);

  React.useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/events/${eventId}`);
        setEvent(response.data.data);
        
        if (user && response.data.data && user.id === response.data.data.organizer_id) {
          setIsOrganizer(true);
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, user]);

  const skillOptions = [
    'Teaching',
    'First Aid',
    'Construction',
    'Cooking',
    'Project Management',
    'Marketing',
    'Design',
    'Technical',
    'Communication',
    'Leadership'
  ];

  const handleSkillToggle = (skill) => {
    setVolunteerData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVolunteerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post(`/api/events/${eventId}/volunteer`, {
        availableHours: volunteerData.availableHours,
        specialNeeds: volunteerData.specialNeeds,
        notes: volunteerData.notes,
        skills: volunteerData.skills.length > 0 ? JSON.stringify(volunteerData.skills) : "[]"
      });

      if (response.data) {
        setSuccess(true);
        setOpenSnackbar(true);
        setTimeout(() => {
          navigate('/volunteer-history');
        }, 2000);
      }
    } catch (err) {
      console.error('Error signing up as volunteer:', err);
      setError(err.response?.data?.message || 'Failed to sign up as volunteer');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !event) {
    return (
      <Container sx={{ py: isMobile ? 2 : 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: isMobile ? 2 : 4 }}>
          <Typography>Loading event details...</Typography>
        </Box>
      </Container>
    );
  }

  if (error && !event) {
    return (
      <Container sx={{ py: isMobile ? 2 : 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: isMobile ? 2 : 4 }}>
          <Typography color="error">{error}</Typography>
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
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderRadius: isMobile ? 1 : 2,
          border: 1,
          borderColor: 'divider'
        }}
      >
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom
          color="text.primary"
        >
          Volunteer for Event
        </Typography>

        {isOrganizer && (
          <Card sx={{ 
            mb: isMobile ? 2 : 3, 
            p: isMobile ? 1.5 : 2, 
            bgcolor: 'info.light', 
            color: 'info.contrastText' 
          }}>
            <Typography variant="body2" sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
              You are the organizer of this event. Signing up as a volunteer will automatically approve your registration.
            </Typography>
          </Card>
        )}

        {event && (
          <Box sx={{ mb: isMobile ? 3 : 4 }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              gutterBottom 
              color="text.primary"
            >
              {event.title}
            </Typography>
            <Typography 
              variant="body1" 
              paragraph 
              color="text.secondary"
            >
              {event.description}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 0.5 : 2, 
              mb: 2 
            }}>
              <Typography variant="body2" color="text.secondary">📍 {event.location}</Typography>
              <Typography variant="body2" color="text.secondary">
                📅 {new Date(event.start_date).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Available Hours"
                name="availableHours"
                value={volunteerData.availableHours}
                onChange={handleChange}
                placeholder="e.g., 9 AM to 5 PM"
                required
                size={isMobile ? "small" : "medium"}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography 
                variant="subtitle1" 
                gutterBottom
                color="text.primary"
              >
                Skills You Can Contribute
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: isMobile ? 0.5 : 1 
              }}>
                {skillOptions.map(skill => (
                  <Chip
                    key={skill}
                    label={skill}
                    onClick={() => handleSkillToggle(skill)}
                    color={volunteerData.skills.includes(skill) ? "primary" : "default"}
                    sx={{ 
                      m: isMobile ? 0.3 : 0.5,
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      height: isMobile ? '28px' : '32px'
                    }}
                    size={isMobile ? "small" : "medium"}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Needs or Accommodations"
                name="specialNeeds"
                value={volunteerData.specialNeeds}
                onChange={handleChange}
                multiline
                rows={isMobile ? 1 : 2}
                size={isMobile ? "small" : "medium"}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                name="notes"
                value={volunteerData.notes}
                onChange={handleChange}
                multiline
                rows={isMobile ? 2 : 3}
                size={isMobile ? "small" : "medium"}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                gap: isMobile ? 1 : 2, 
                flexDirection: isMobile ? 'column-reverse' : 'row',
                justifyContent: 'flex-end' 
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  fullWidth={isMobile}
                  size={isMobile ? "medium" : "large"}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  fullWidth={isMobile}
                  size={isMobile ? "medium" : "large"}
                >
                  {loading ? 'Submitting...' : 'Volunteer Now'}
                </Button>
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
          {success
            ? 'Successfully registered as a volunteer!'
            : error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VolunteerSignup; 