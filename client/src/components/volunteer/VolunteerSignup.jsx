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
  Card
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/api';
import { AuthContext } from '../../context/AuthContext.jsx';

const VolunteerSignup = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
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
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>Loading event details...</Typography>
        </Box>
      </Container>
    );
  }

  if (error && !event) {
    return (
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Volunteer for Event
        </Typography>

        {isOrganizer && (
          <Card sx={{ mb: 3, p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Typography variant="body1">
              You are the organizer of this event. Signing up as a volunteer will automatically approve your registration.
            </Typography>
          </Card>
        )}

        {event && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>{event.title}</Typography>
            <Typography variant="body1" paragraph>{event.description}</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Typography variant="body2">📍 {event.location}</Typography>
              <Typography variant="body2">
                📅 {new Date(event.start_date).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Available Hours"
                name="availableHours"
                value={volunteerData.availableHours}
                onChange={handleChange}
                placeholder="e.g., 9 AM to 5 PM"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Skills You Can Contribute
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {skillOptions.map(skill => (
                  <Chip
                    key={skill}
                    label={skill}
                    onClick={() => handleSkillToggle(skill)}
                    color={volunteerData.skills.includes(skill) ? "primary" : "default"}
                    sx={{ m: 0.5 }}
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
                rows={2}
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
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
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
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={success ? "success" : "error"} 
          sx={{ width: '100%' }}
        >
          {success ? 'Successfully signed up as volunteer!' : error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VolunteerSignup; 