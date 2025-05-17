import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import api from '../../config/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    max_volunteers: '',
    form: ''
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    required_skills: [],
    max_volunteers: '',
    status: 'active'
  });

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

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const validateField = (name, value) => {
    let errorMessage = '';
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          errorMessage = 'Title is required';
        } else if (value.trim().length < 5) {
          errorMessage = 'Title must be at least 5 characters';
        } else if (value.trim().length > 100) {
          errorMessage = 'Title must be less than 100 characters';
        }
        break;
      case 'description':
        if (!value.trim()) {
          errorMessage = 'Description is required';
        } else if (value.trim().length < 20) {
          errorMessage = 'Description must be at least 20 characters';
        } else if (value.trim().length > 1000) {
          errorMessage = 'Description must be less than 1000 characters';
        }
        break;
      case 'start_date':
        if (!value) {
          errorMessage = 'Start date is required';
        } else if (new Date(value) < new Date()) {
          errorMessage = 'Start date must be in the future';
        }
        break;
      case 'end_date':
        if (!value) {
          errorMessage = 'End date is required';
        } else if (eventData.start_date && new Date(value) <= new Date(eventData.start_date)) {
          errorMessage = 'End date must be after start date';
        }
        break;
      case 'location':
        if (!value.trim()) {
          errorMessage = 'Location is required';
        } else if (value.trim().length < 5) {
          errorMessage = 'Please provide a more specific location';
        } else if (value.trim().length > 200) {
          errorMessage = 'Location must be less than 200 characters';
        }
        break;
      case 'max_volunteers':
        if (!value) {
          errorMessage = 'Maximum volunteers is required';
        } else if (isNaN(parseInt(value)) || parseInt(value) <= 0) {
          errorMessage = 'Maximum volunteers must be a positive number';
        } else if (parseInt(value) > 1000) {
          errorMessage = 'Maximum volunteers cannot exceed 1000';
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

  const validate = () => {
    let isValid = true;
    let newErrors = { ...errors };
    
    // Validate each field
    Object.keys(eventData).forEach(field => {
      if (field !== 'required_skills' && field !== 'status') {
        const fieldValid = validateField(field, eventData[field]);
        if (!fieldValid) isValid = false;
      }
    });
    
    // Additional cross-field validations
    if (eventData.start_date && eventData.end_date) {
      if (new Date(eventData.end_date) <= new Date(eventData.start_date)) {
        newErrors.end_date = 'End date must be after start date';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        setLoading(true);

        const formattedData = {
          ...eventData,
          start_date: new Date(eventData.start_date).toISOString(),
          end_date: new Date(eventData.end_date).toISOString(),
          max_volunteers: parseInt(eventData.max_volunteers),
          required_skills: JSON.stringify(eventData.required_skills)
        };

        const response = await api.post('/api/events', formattedData);

        if (response.data) {
          setSnackbarMessage('Event created successfully!');
          setSnackbarSeverity('success');
          setOpenSnackbar(true);
          
          // Navigate after a short delay to allow the user to see the success message
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      } catch (error) {
        console.error('Error creating event:', error);
        setErrors(prev => ({
          ...prev,
          form: error.response?.data?.message || 'Failed to create event. Please try again.'
        }));
        setSnackbarMessage(error.response?.data?.message || 'Failed to create event');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    } else {
      setSnackbarMessage('Please fix the errors before submitting');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear form error when field changes
    if (errors.form) {
      setErrors(prev => ({ ...prev, form: '' }));
    }
    
    // Validate on change
    validateField(name, value);
  };

  const handleSkillToggle = (skill) => {
    setEventData(prev => ({
      ...prev,
      required_skills: prev.required_skills.includes(skill)
        ? prev.required_skills.filter(s => s !== skill)
        : [...prev.required_skills, skill]
    }));
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Event
        </Typography>
        
        {errors.form && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.form}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={eventData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title || "Enter a descriptive title for your event (5-100 characters)"}
                required
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={eventData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description || `${eventData.description.length}/1000 - Describe the event, its purpose, and what volunteers will do`}
                multiline
                rows={4}
                required
                inputProps={{ maxLength: 1000 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date and Time"
                name="start_date"
                type="datetime-local"
                value={eventData.start_date}
                onChange={handleChange}
                error={!!errors.start_date}
                helperText={errors.start_date || "When does the event start?"}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date and Time"
                name="end_date"
                type="datetime-local"
                value={eventData.end_date}
                onChange={handleChange}
                error={!!errors.end_date}
                helperText={errors.end_date || "When does the event end?"}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={eventData.location}
                onChange={handleChange}
                error={!!errors.location}
                helperText={errors.location || "Full address or specific location of the event"}
                required
                inputProps={{ maxLength: 200 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Volunteers"
                name="max_volunteers"
                type="number"
                value={eventData.max_volunteers}
                onChange={handleChange}
                error={!!errors.max_volunteers}
                helperText={errors.max_volunteers || "Maximum number of volunteers needed"}
                InputProps={{ inputProps: { min: 1, max: 1000 } }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={eventData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Current status of the event</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Required Skills (Optional)
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1, 
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                padding: 1,
                minHeight: '100px'
              }}>
                {skillOptions.map(skill => (
                  <Chip
                    key={skill}
                    label={skill}
                    onClick={() => handleSkillToggle(skill)}
                    color={eventData.required_skills.includes(skill) ? "primary" : "default"}
                    sx={{ margin: 0.5 }}
                  />
                ))}
              </Box>
              <FormHelperText>Select skills that would be helpful for this event</FormHelperText>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mt: 2 
              }}>
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
                  {loading ? 'Creating...' : 'Create Event'}
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
            variant="filled" 
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default CreateEvent; 