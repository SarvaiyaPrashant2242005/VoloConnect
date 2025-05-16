import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
  MenuItem,
  Select,
  InputLabel,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Download as DownloadIcon,
  Preview as PreviewIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

// Helper function to download CSV
const downloadCSV = (data, filename) => {
  // Convert data to CSV format
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values with commas or quotes
      const escaped = ('' + value).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  // Download CSV file
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ExportVolunteers = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  
  // Export options
  const [exportFields, setExportFields] = useState({
    name: true,
    email: true,
    phone: true,
    skills: true,
    availableHours: true,
    status: true,
    registrationDate: true,
    hoursContributed: true,
    feedback: false,
    specialNeeds: false,
    notes: false
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch events where user is organizer
        const eventsResponse = await api.get('/api/events');
        const userEvents = eventsResponse.data.filter(event => 
          event.organizer_id === user?.id
        );
        setEvents(userEvents);
        
        // Fetch all volunteers for those events
        if (userEvents.length > 0) {
          const volunteersPromises = userEvents.map(event => 
            api.get(`/api/events/${event.id}/volunteers`)
          );
          
          const volunteersResponses = await Promise.all(volunteersPromises);
          
          // Combine all volunteers from all events
          let allVolunteers = [];
          volunteersResponses.forEach((response, index) => {
            if (response.data && response.data.success) {
              // Add event title to each volunteer record
              const volunteersWithEventTitle = response.data.data.map(volunteer => ({
                ...volunteer,
                event_title: userEvents[index].title
              }));
              allVolunteers = [...allVolunteers, ...volunteersWithEventTitle];
            }
          });
          
          setVolunteers(allVolunteers);
          setFilteredVolunteers(allVolunteers);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Update filtered volunteers when event selection changes
  useEffect(() => {
    if (selectedEvent === 'all') {
      setFilteredVolunteers(volunteers);
    } else {
      setFilteredVolunteers(
        volunteers.filter(volunteer => volunteer.event_id === parseInt(selectedEvent))
      );
    }
    
    // Reset preview when selection changes
    setShowPreview(false);
  }, [selectedEvent, volunteers]);
  
  const handleEventChange = (event) => {
    setSelectedEvent(event.target.value);
  };
  
  const handleExportFieldChange = (field) => {
    setExportFields({
      ...exportFields,
      [field]: !exportFields[field]
    });
  };
  
  const handleGeneratePreview = () => {
    if (filteredVolunteers.length === 0) {
      setSnackbarMessage('No volunteers to preview');
      setOpenSnackbar(true);
      return;
    }
    
    // Format data based on selected fields
    const preview = filteredVolunteers.map(volunteer => {
      const formattedRecord = {};
      
      if (exportFields.name) {
        formattedRecord['Full Name'] = `${volunteer.first_name} ${volunteer.last_name}`;
      }
      
      if (exportFields.email) {
        formattedRecord['Email'] = volunteer.email;
      }
      
      if (exportFields.phone) {
        formattedRecord['Phone'] = volunteer.phone;
      }
      
      if (exportFields.skills) {
        try {
          const skills = typeof volunteer.skills === 'string' 
            ? JSON.parse(volunteer.skills || '[]') 
            : (volunteer.skills || []);
          formattedRecord['Skills'] = skills.join(', ');
        } catch (e) {
          formattedRecord['Skills'] = '';
        }
      }
      
      if (exportFields.availableHours) {
        formattedRecord['Available Hours'] = volunteer.available_hours || '';
      }
      
      if (exportFields.status) {
        formattedRecord['Status'] = volunteer.status;
      }
      
      if (exportFields.registrationDate) {
        formattedRecord['Registration Date'] = new Date(volunteer.created_at).toLocaleDateString();
      }
      
      if (exportFields.hoursContributed) {
        formattedRecord['Hours Contributed'] = volunteer.hours_contributed || 0;
      }
      
      if (exportFields.feedback) {
        formattedRecord['Feedback'] = volunteer.feedback || '';
      }
      
      if (exportFields.specialNeeds) {
        formattedRecord['Special Needs'] = volunteer.special_needs || '';
      }
      
      if (exportFields.notes) {
        formattedRecord['Notes'] = volunteer.notes || '';
      }
      
      // Always include event title
      formattedRecord['Event'] = volunteer.event_title;
      
      return formattedRecord;
    });
    
    setPreviewData(preview);
    setShowPreview(true);
  };
  
  const handleExport = () => {
    if (filteredVolunteers.length === 0) {
      setSnackbarMessage('No volunteers to export');
      setOpenSnackbar(true);
      return;
    }
    
    // Generate preview data if not already generated
    if (previewData.length === 0) {
      handleGeneratePreview();
    }
    
    // Export to CSV
    const eventName = selectedEvent === 'all' 
      ? 'all-events' 
      : events.find(e => e.id === parseInt(selectedEvent))?.title.toLowerCase().replace(/\s+/g, '-');
    
    downloadCSV(previewData, `volunteers-${eventName}-${new Date().toISOString().split('T')[0]}.csv`);
    
    setSnackbarMessage('Volunteers data exported successfully');
    setOpenSnackbar(true);
  };
  
  const handleClearSelection = () => {
    setExportFields({
      name: true,
      email: true,
      phone: true,
      skills: true,
      availableHours: true,
      status: true,
      registrationDate: true,
      hoursContributed: true,
      feedback: false,
      specialNeeds: false,
      notes: false
    });
    setSelectedEvent('all');
    setShowPreview(false);
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 8 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading volunteer data...</Typography>
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
        Export Volunteer Data
      </Typography>
      
      {events.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You don't have any events as an organizer
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You need to be an event organizer to export volunteer data.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/events/create')}
            sx={{ mt: 2 }}
          >
            Create an Event
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Export Options
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="event-select-label">Select Event</InputLabel>
                <Select
                  labelId="event-select-label"
                  value={selectedEvent}
                  label="Select Event"
                  onChange={handleEventChange}
                >
                  <MenuItem value="all">All Events ({volunteers.length} volunteers)</MenuItem>
                  {events.map(event => {
                    const volunteerCount = volunteers.filter(v => v.event_id === event.id).length;
                    return (
                      <MenuItem key={event.id} value={event.id}>
                        {event.title} ({volunteerCount} volunteers)
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              
              <Divider sx={{ my: 2 }} />
              
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Fields to Export</FormLabel>
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox checked={exportFields.name} onChange={() => handleExportFieldChange('name')} />}
                    label="Full Name"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={exportFields.email} onChange={() => handleExportFieldChange('email')} />}
                    label="Email"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={exportFields.phone} onChange={() => handleExportFieldChange('phone')} />}
                    label="Phone"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={exportFields.skills} onChange={() => handleExportFieldChange('skills')} />}
                    label="Skills"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={exportFields.availableHours} onChange={() => handleExportFieldChange('availableHours')} />}
                    label="Available Hours"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={exportFields.status} onChange={() => handleExportFieldChange('status')} />}
                    label="Status"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={exportFields.registrationDate} onChange={() => handleExportFieldChange('registrationDate')} />}
                    label="Registration Date"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={exportFields.hoursContributed} onChange={() => handleExportFieldChange('hoursContributed')} />}
                    label="Hours Contributed"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={exportFields.feedback} onChange={() => handleExportFieldChange('feedback')} />}
                    label="Feedback"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={exportFields.specialNeeds} onChange={() => handleExportFieldChange('specialNeeds')} />}
                    label="Special Needs"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={exportFields.notes} onChange={() => handleExportFieldChange('notes')} />}
                    label="Notes"
                  />
                </FormGroup>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={handleGeneratePreview}
                  disabled={filteredVolunteers.length === 0}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  disabled={filteredVolunteers.length === 0}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<ClearIcon />}
                  onClick={handleClearSelection}
                >
                  Reset
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {showPreview ? 'Preview Data' : 'Selected Volunteers'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {filteredVolunteers.length} volunteer{filteredVolunteers.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
              
              {filteredVolunteers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No volunteers found for the selected event.
                  </Typography>
                </Box>
              ) : showPreview ? (
                <TableContainer sx={{ maxHeight: 440 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        {previewData.length > 0 && Object.keys(previewData[0]).map((header, index) => (
                          <TableCell key={index}>{header}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {Object.values(row).map((value, colIndex) => (
                            <TableCell key={colIndex}>{value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <TableContainer sx={{ maxHeight: 440 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Event</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredVolunteers.map((volunteer) => (
                        <TableRow key={volunteer.id}>
                          <TableCell>{volunteer.first_name} {volunteer.last_name}</TableCell>
                          <TableCell>{volunteer.email}</TableCell>
                          <TableCell>{volunteer.event_title}</TableCell>
                          <TableCell>{volunteer.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default ExportVolunteers; 