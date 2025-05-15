import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Alert
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Event as EventIcon,
  BarChart as ChartIcon,
  GroupWork as GroupIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

const ExportVolunteers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [exportFormat, setExportFormat] = useState('excel');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [exportFields, setExportFields] = useState({
    personalInfo: true,
    contactInfo: true,
    skills: true,
    hours: true,
    status: true,
    attendance: true
  });
  const [previewData, setPreviewData] = useState(null);
  const [exportMessage, setExportMessage] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/events');
        setEvents(response.data);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
  };

  const handleFormatChange = (e) => {
    setExportFormat(e.target.value);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFieldToggle = (field) => {
    setExportFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePreviewData = async () => {
    if (!validateExport()) return;

    try {
      setLoading(true);
      setExportMessage({ type: '', message: '' });

      let endpoint;
      let params = {};

      if (selectedEvent) {
        endpoint = `/api/events/${selectedEvent}/volunteers/export`;
      } else {
        endpoint = '/api/volunteers/export';
        if (dateRange.startDate) {
          params.startDate = dateRange.startDate;
        }
        if (dateRange.endDate) {
          params.endDate = dateRange.endDate;
        }
      }

      // In a real app, you would make an API call here
      // For demo purposes, we'll simulate some data
      
      // Mock data for preview
      const mockData = [
        {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '123-456-7890',
          skills: JSON.stringify(['Teaching', 'Leadership']),
          hours_worked: 5,
          status: 'approved',
          attendance: 'attended',
          event_title: 'Community Cleanup',
          event_date: '2023-08-15'
        },
        {
          id: 2,
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          phone: '987-654-3210',
          skills: JSON.stringify(['First Aid', 'Project Management']),
          hours_worked: 3.5,
          status: 'approved',
          attendance: 'attended',
          event_title: 'Food Drive',
          event_date: '2023-09-20'
        }
      ];
      
      // Format data based on selected fields
      const formattedData = mockData.map(volunteer => {
        const formatted = {};
        
        if (exportFields.personalInfo) {
          formatted['Full Name'] = `${volunteer.first_name} ${volunteer.last_name}`;
        }
        
        if (exportFields.contactInfo) {
          formatted['Email'] = volunteer.email;
          formatted['Phone'] = volunteer.phone;
        }
        
        if (exportFields.skills) {
          try {
            formatted['Skills'] = JSON.parse(volunteer.skills).join(', ');
          } catch (e) {
            formatted['Skills'] = volunteer.skills;
          }
        }
        
        if (exportFields.hours) {
          formatted['Hours Worked'] = volunteer.hours_worked;
        }
        
        if (exportFields.status) {
          formatted['Status'] = volunteer.status;
        }
        
        if (exportFields.attendance) {
          formatted['Attendance'] = volunteer.attendance;
        }
        
        formatted['Event'] = volunteer.event_title;
        formatted['Date'] = new Date(volunteer.event_date).toLocaleDateString();
        
        return formatted;
      });
      
      setPreviewData(formattedData);
    } catch (err) {
      console.error('Error generating preview:', err);
      setExportMessage({ 
        type: 'error', 
        message: 'Failed to generate preview data. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    if (!validateExport()) return;
    
    try {
      setLoading(true);
      setExportMessage({ type: '', message: '' });
      
      if (!previewData) {
        handlePreviewData();
        return;
      }
      
      // In a real app, this would use the xlsx library
      const exportFileName = selectedEvent 
        ? `volunteers-event-${selectedEvent}` 
        : `volunteers-${dateRange.startDate || 'all'}-to-${dateRange.endDate || 'all'}`;
      
      setTimeout(() => {
        // Simulate export process
        setExportMessage({ 
          type: 'success', 
          message: `Data successfully exported as ${exportFormat.toUpperCase()} file!` 
        });
        
        // Mock download by using CSV for demo
        const headers = Object.keys(previewData[0]);
        const csvRows = [];
        
        // Add headers
        csvRows.push(headers.join(','));
        
        // Add rows
        for (const row of previewData) {
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
        link.setAttribute('download', `${exportFileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error('Error exporting data:', err);
      setExportMessage({ 
        type: 'error', 
        message: 'Failed to export data. Please try again.' 
      });
      setLoading(false);
    }
  };

  const validateExport = () => {
    // Check if at least one field is selected
    const anyFieldSelected = Object.values(exportFields).some(value => value);
    
    if (!anyFieldSelected) {
      setExportMessage({ 
        type: 'error', 
        message: 'Please select at least one field to export' 
      });
      return false;
    }
    
    // Check if date range is valid if specified
    if (dateRange.startDate && dateRange.endDate) {
      if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
        setExportMessage({ 
          type: 'error', 
          message: 'Start date must be before end date' 
        });
        return false;
      }
    }
    
    return true;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Export Volunteer Data
      </Typography>
      
      <Grid container spacing={4}>
        {/* Export Options */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              bgcolor: 'background.paper',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Export Options
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="event-select-label">Select Event</InputLabel>
                <Select
                  labelId="event-select-label"
                  value={selectedEvent}
                  onChange={handleEventChange}
                  label="Select Event"
                >
                  <MenuItem value="">All Events</MenuItem>
                  {events.map(event => (
                    <MenuItem key={event.id} value={event.id}>{event.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {!selectedEvent && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Date Range (Optional)
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="format-select-label">Export Format</InputLabel>
                <Select
                  labelId="format-select-label"
                  value={exportFormat}
                  onChange={handleFormatChange}
                  label="Export Format"
                >
                  <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              Fields to Include
            </Typography>
            
            <FormGroup>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={exportFields.personalInfo} 
                        onChange={() => handleFieldToggle('personalInfo')} 
                      />
                    }
                    label="Personal Information"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={exportFields.contactInfo} 
                        onChange={() => handleFieldToggle('contactInfo')} 
                      />
                    }
                    label="Contact Information"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={exportFields.skills} 
                        onChange={() => handleFieldToggle('skills')} 
                      />
                    }
                    label="Skills"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={exportFields.hours} 
                        onChange={() => handleFieldToggle('hours')} 
                      />
                    }
                    label="Hours Worked"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={exportFields.status} 
                        onChange={() => handleFieldToggle('status')} 
                      />
                    }
                    label="Status"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={exportFields.attendance} 
                        onChange={() => handleFieldToggle('attendance')} 
                      />
                    }
                    label="Attendance"
                  />
                </Grid>
              </Grid>
            </FormGroup>
            
            {exportMessage.type && (
              <Alert 
                severity={exportMessage.type} 
                sx={{ mt: 2 }}
                onClose={() => setExportMessage({ type: '', message: '' })}
              >
                {exportMessage.message}
              </Alert>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handlePreviewData}
                disabled={loading}
              >
                Preview Data
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleExportData}
                disabled={loading}
              >
                {loading ? 'Exporting...' : 'Export Data'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Data Preview */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              bgcolor: 'background.paper',
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Data Preview
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                <CircularProgress />
              </Box>
            ) : previewData ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Showing {previewData.length} record(s)
                </Typography>
                
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {previewData.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={item['Full Name'] || 'Volunteer'}
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              {Object.entries(item).map(([key, value]) => (
                                key !== 'Full Name' && (
                                  <Typography 
                                    key={key} 
                                    variant="body2" 
                                    component="div" 
                                    sx={{ mb: 0.5 }}
                                  >
                                    <strong>{key}:</strong> {value}
                                  </Typography>
                                )
                              ))}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < previewData.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  Select export options and click "Preview Data" to see a sample of the data.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Export Templates */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mt: 4,
          bgcolor: 'background.paper',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" gutterBottom>
          Export Templates
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Use these pre-configured templates for common reporting needs:
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}
              onClick={() => {
                // Would set appropriate export options
                alert('Event Summary template selected');
              }}
            >
              <EventIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1">Event Summary</Typography>
              <Typography variant="body2" color="text.secondary">
                All volunteers grouped by event
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}
              onClick={() => {
                // Would set appropriate export options
                alert('Monthly Report template selected');
              }}
            >
              <ChartIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1">Monthly Report</Typography>
              <Typography variant="body2" color="text.secondary">
                Volunteer hours by month
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}
              onClick={() => {
                // Would set appropriate export options
                alert('Skills Directory template selected');
              }}
            >
              <GroupIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1">Skills Directory</Typography>
              <Typography variant="body2" color="text.secondary">
                Volunteers grouped by skills
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}
              onClick={() => {
                // Would set appropriate export options
                alert('Contact List template selected');
              }}
            >
              <DownloadIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1">Contact List</Typography>
              <Typography variant="body2" color="text.secondary">
                Name and contact information only
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ExportVolunteers; 