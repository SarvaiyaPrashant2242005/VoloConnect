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
  FormHelperText,
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
  const [errors, setErrors] = useState({
    availableHours: '',
    specialNeeds: '',
    notes: '',
    skills: '',
    form: ''
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
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
        setErrors(prev => ({
          ...prev,
          form: 'Failed to load event details'
        }));
        setSnackbarMessage('Failed to load event details');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
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
    const updatedSkills = volunteerData.skills.includes(skill)
      ? volunteerData.skills.filter(s => s !== skill)
      : [...volunteerData.skills, skill];
    
    setVolunteerData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
    
    // Clear validation error when skills are selected
    if (updatedSkills.length > 0 && errors.skills) {
      setErrors(prev => ({
        ...prev,
        skills: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVolunteerData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Validate field on change
    validateField(name, value);
  };
  
  const validateField = (name, value) => {
    let errorMessage = '';
    
    switch (name) {
      case 'availableHours':
        if (!value.trim()) {
          errorMessage = 'Please specify your available hours';
        } else if (value.trim().length < 3) {
          errorMessage = 'Please provide more details about your availability';
        }
        break;
      case 'notes':
        if (value.trim().length > 500) {
          errorMessage = 'Notes must be less than 500 characters';
        }
        break;
      case 'specialNeeds':
        if (value.trim().length > 300) {
          errorMessage = 'Special needs text must be less than 300 characters';
        }
        break;
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
    
    return !errorMessage;
  };
  
  const validateForm = () => {
    let isValid = true;
    let newErrors = { ...errors };
    
    // Check available hours
    if (!volunteerData.availableHours.trim()) {
      newErrors.availableHours = 'Please specify your available hours';
      isValid = false;
    }
    
    // Validate notes length
    if (volunteerData.notes.trim().length > 500) {
      newErrors.notes = 'Notes must be less than 500 characters';
      isValid = false;
    }
    
    // Validate special needs length
    if (volunteerData.specialNeeds.trim().length > 300) {
      newErrors.specialNeeds = 'Special needs text must be less than 300 characters';
      isValid = false;
    }
    
    // Recommend selecting skills (but not required)
    if (volunteerData.skills.length === 0) {
      newErrors.skills = 'We recommend selecting at least one skill';
      // Not setting isValid to false since this is just a recommendation
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbarMessage('Please fix the errors before submitting');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post(`/api/events/${eventId}/volunteer`, {
        availableHours: volunteerData.availableHours,
        specialNeeds: volunteerData.specialNeeds,
        notes: volunteerData.notes,
        skills: volunteerData.skills.length > 0 ? JSON.stringify(volunteerData.skills) : "[]"
      });

      if (response.data) {
        setSuccess(true);
        setSnackbarMessage('Successfully signed up as a volunteer!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        setTimeout(() => {
          navigate('/volunteer-history');
        }, 2000);
      }
    } catch (err) {
      console.error('Error signing up as volunteer:', err);
      
      // Handle specific error cases
      if (err.response?.status === 409) {
        setErrors(prev => ({
          ...prev,
          form: 'You have already volunteered for this event'
        }));
      } else if (err.response?.status === 400) {
        setErrors(prev => ({
          ...prev,
          form: err.response?.data?.message || 'Invalid volunteer information'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          form: err.response?.data?.message || 'Failed to sign up as volunteer'
        }));
      }
      
      setSnackbarMessage(err.response?.data?.message || 'Failed to sign up as volunteer');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
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

  if (errors.form && !event) {
    return (
      <Container sx={{ py: isMobile ? 2 : 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: isMobile ? 2 : 4 }}>
          <Typography color="error">{errors.form}</Typography>
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

        {errors.form && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.form}
          </Alert>
        )}

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
                error={!!errors.availableHours}
                helperText={errors.availableHours}
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
                gap: isMobile ? 0.5 : 1,
                border: errors.skills ? '1px solid #f44336' : 'none',
                borderRadius: 1,
                padding: errors.skills ? 1 : 0
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
              {errors.skills && (
                <FormHelperText error>{errors.skills}</FormHelperText>
              )}
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
                error={!!errors.specialNeeds}
                helperText={errors.specialNeeds || "Let us know if you require any accommodations"}
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
                error={!!errors.notes}
                helperText={errors.notes || `${volunteerData.notes.length}/500 characters`}
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

        <Snackbar 
          open={openSnackbar} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity} 
            sx={{ width: '100%' }}
          >
            {snackbarMessage || (success ? 'Successfully signed up!' : 'An error occurred')}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default VolunteerSignup; 