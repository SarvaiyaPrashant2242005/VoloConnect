import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  SortByAlpha as SortIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/api';
import '../../styles/Print.css';

// For CSV export
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

// This would use the xlsx library in a real implementation
const exportToExcel = (data, filename) => {
  alert('Excel export functionality would be implemented here with xlsx library');
  
  // Mock implementation to demonstrate - in production, use the xlsx library
  const formattedData = data.map(volunteer => ({
    'Full Name': `${volunteer.first_name} ${volunteer.last_name}`,
    'Email': volunteer.email,
    'Phone': volunteer.phone,
    'Status': volunteer.status,
    'Skills': volunteer.skills,
    'Hours Committed': volunteer.hours_committed,
    'Signup Date': new Date(volunteer.signup_date).toLocaleDateString()
  }));
  
  // Fall back to CSV for this demo
  downloadCSV(formattedData, filename + '.csv');
};

const VolunteerManagement = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [event, setEvent] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialog, setDialog] = useState({
    open: false,
    type: '',
    volunteer: null
  });

  // For volunteer hours editing
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [hoursWorked, setHoursWorked] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  // Move fetchEventAndVolunteers outside the useEffect so it can be called from anywhere
  const fetchEventAndVolunteers = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching data for event ID:', eventId);
      console.log('Current user ID:', sessionStorage.getItem('userId'));
      
      // Fetch event details
      const eventResponse = await api.get(`/api/events/${eventId}`);
      if (eventResponse.data) {
        setEvent(eventResponse.data.data || eventResponse.data);
        console.log('Event details loaded:', eventResponse.data);
      }
      
      // Use the correct API endpoint to fetch volunteers
      console.log('Attempting to fetch volunteers with endpoint:', `/api/events/${eventId}/volunteers`);
      const volunteersResponse = await api.get(`/api/events/${eventId}/volunteers`);
      
      console.log('Volunteers API response:', volunteersResponse.data);
      
      if (volunteersResponse.data) {
        // Extract the volunteers array from the response
        const volunteerData = volunteersResponse.data.data || volunteersResponse.data || [];
        
        // Process volunteer data to ensure all fields are correctly formatted
        const processedVolunteers = volunteerData.map(vol => {
          // Safely parse skills if it's a string
          let skillsArray = [];
          try {
            if (typeof vol.skills === 'string') {
              skillsArray = JSON.parse(vol.skills || '[]');
            } else if (Array.isArray(vol.skills)) {
              skillsArray = vol.skills;
            }
          } catch (e) {
            console.error('Error parsing skills:', e);
          }
          
          return {
            ...vol,
            skills: skillsArray,
            // Ensure these fields exist with defaults
            status: vol.status || 'pending',
            first_name: vol.first_name || 'Unknown',
            last_name: vol.last_name || 'User',
            hours_contributed: vol.hours_contributed || 0
          };
        });
        
        console.log('Processed volunteers:', processedVolunteers);
        setVolunteers(processedVolunteers);
      } else {
        // If the response doesn't have the expected structure, set an empty array
        setVolunteers([]);
        console.error('Unexpected response format:', volunteersResponse.data);
      }
    } catch (err) {
      console.error('Error fetching event data:', err);
      setError('Failed to load event and volunteer data: ' + err.message);
      setVolunteers([]); // Ensure volunteers is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventAndVolunteers();
  }, [eventId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleApproveClick = (volunteer) => {
    const dialogData = {
      open: true,
      type: 'approve',
      volunteer,
      action: 'approve'
    };
    console.log('Setting approve dialog:', dialogData);
    setDialog(dialogData);
  };

  const handleRejectClick = (volunteer) => {
    const dialogData = {
      open: true,
      type: 'reject',
      volunteer,
      action: 'reject'
    };
    console.log('Setting reject dialog:', dialogData);
    setDialog(dialogData);
  };

  const handleEmailClick = (volunteer) => {
    setDialog({
      open: true,
      type: 'email',
      volunteer,
      action: 'sendEmail'
    });
    setEmailSubject(`Information regarding ${event?.title}`);
    setEmailMessage(`Dear ${volunteer?.first_name},\n\nThank you for volunteering for ${event?.title}.\n\nRegards,\nEvent Organizer`);
  };

  const handleEditHoursClick = (volunteer) => {
    setEditingVolunteer(volunteer);
    setHoursWorked(volunteer.hours_worked?.toString() || '');
    setDialog({
      open: true,
      type: 'editHours',
      volunteer
    });
  };

  const handleDialogClose = () => {
    console.log('Closing dialog. Current state:', dialog);
    setDialog({
      open: false,
      type: '',
      volunteer: null,
      action: null
    });
  };

  const handleConfirmDialog = async () => {
    setLoading(true);
    try {
      let response;
      
      if (dialog.action === 'approve') {
        console.log(`Approving volunteer ${dialog.volunteer.id} for event ${eventId}`);
        response = await api.put(`/api/events/${eventId}/volunteers/${dialog.volunteer.id}/approve`);
        
        if (response.status === 200) {
          setMessage('Volunteer approved successfully');
          setIsSuccess(true);
          // Refresh volunteer list
          fetchEventAndVolunteers();
        }
      } else if (dialog.action === 'reject') {
        console.log(`Rejecting volunteer ${dialog.volunteer.id} for event ${eventId}`);
        response = await api.put(`/api/events/${eventId}/volunteers/${dialog.volunteer.id}/reject`);
        
        if (response.status === 200) {
          setMessage('Volunteer rejected successfully');
          setIsSuccess(true);
          // Refresh volunteer list
          fetchEventAndVolunteers();
        }
      } else if (dialog.action === 'updateHours') {
        console.log(`Updating hours for volunteer ${dialog.volunteer.id}: ${hoursWorked}`);
        response = await api.put(`/api/events/${eventId}/volunteers/${dialog.volunteer.id}/hours`, {
          hours_worked: hoursWorked
        });
        
        if (response.status === 200) {
          setMessage('Volunteer hours updated successfully');
          setIsSuccess(true);
          // Refresh volunteer list
          fetchEventAndVolunteers();
        }
      } else if (dialog.action === 'sendEmail') {
        console.log(`Sending email to volunteer ${dialog.volunteer.id}`);
        response = await api.post(`/api/email/volunteer/${dialog.volunteer.id}`, {
          subject: emailSubject,
          message: emailMessage
        });
        
        if (response.status === 200) {
          setMessage('Email sent successfully');
          setIsSuccess(true);
        }
      } else {
        console.error('Unknown dialog action:', dialog.action);
        setMessage(`Unknown action: ${dialog.action}`);
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error during volunteer action:', error);
      console.error('Error details:', {
        action: dialog.action,
        volunteerId: dialog.volunteer?.id,
        eventId: eventId,
        response: error.response?.data
      });
      
      setMessage(error.response?.data?.message || `Error: ${error.message || 'Unknown error'}`);
      setIsSuccess(false);
    } finally {
      setLoading(false);
      setOpenSnackbar(true);
      setDialog({ ...dialog, open: false });
    }
  };

  const handleExportVolunteers = () => {
    if (volunteers.length === 0) {
      alert('No volunteers to export');
      return;
    }
    
    exportToExcel(volunteers, `volunteers-event-${eventId}`);
  };

  const handleCreateTestVolunteers = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/api/events/${eventId}/test-volunteers`, { count: 2 });
      
      if (response.data && response.data.success) {
        // Add test volunteers to the list
        const newVolunteers = response.data.data;
        setVolunteers(prev => [...prev, ...newVolunteers]);
        
        setIsSuccess(true);
        setMessage(`${newVolunteers.length} test volunteers added successfully`);
        setOpenSnackbar(true);
      } else {
        throw new Error(response.data?.message || 'Failed to create test volunteers');
      }
    } catch (err) {
      console.error('Error creating test volunteers:', err);
      setIsSuccess(false);
      setMessage(err.message || 'Failed to create test volunteers');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    // Filter by search query
    const searchMatch = 
      (volunteer.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (volunteer.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (volunteer.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    // Filter by status
    const status = volunteer.status || 'pending';
    const statusMatch = statusFilter === 'all' || status === statusFilter;
    
    // Filter by tab
    let tabMatch = false;
    if (tabValue === 0) {
      // All volunteers tab
      tabMatch = true;
    } else if (tabValue === 1 && status === 'pending') {
      // Pending tab
      tabMatch = true;
    } else if (tabValue === 2 && status === 'approved') {
      // Approved tab
      tabMatch = true;
    } else if (tabValue === 3 && status === 'rejected') {
      // Rejected tab
      tabMatch = true;
    }
    
    return searchMatch && statusMatch && tabMatch;
  });

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleVolunteerAction = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setFeedbackText(volunteer.feedback || '');
    setNewStatus(volunteer.status || 'pending');
    setOpenDialog(true);
  };

  const handleStatusChange = async () => {
    if (!selectedVolunteer) return;
    
    try {
      setLoading(true);
      const response = await api.put(`/api/events/${eventId}/volunteers/${selectedVolunteer.id}`, {
        status: newStatus,
        feedback: feedbackText
      });

      if (response.data && response.data.success) {
        setIsSuccess(true);
        setMessage('Volunteer status updated successfully');
        setOpenSnackbar(true);
        
        // Update the volunteer in the local state
        setVolunteers(prevVolunteers => 
          prevVolunteers.map(v => 
            v.id === selectedVolunteer.id 
              ? { ...v, status: newStatus, feedback: feedbackText } 
              : v
          )
        );
      } else {
        throw new Error(response.data?.message || 'Failed to update volunteer status');
      }
    } catch (err) {
      console.error('Error updating volunteer status:', err);
      setIsSuccess(false);
      setMessage(err.message || 'Failed to update volunteer status');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
      setOpenDialog(false);
    }
  };

  const handlePrint = () => {
    // Apply custom print styles
    const originalTitle = document.title;
    const eventTitle = event ? event.title : 'Event';
    document.title = `Volunteer List - ${eventTitle}`;
    
    // Set print classes on body
    document.body.classList.add('printing-volunteers');
    
    // Apply custom formatting for print
    const statusChips = document.querySelectorAll('.MuiChip-root');
    statusChips.forEach(chip => {
      // Get the status text and sanitize it for use as a class name
      const statusText = chip.textContent.toLowerCase();
      const sanitizedStatus = statusText.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Only add the class if it's a valid class name
      if (sanitizedStatus) {
        chip.classList.add(`status-${sanitizedStatus}`);
      }
    });
    
    // Print the document
    window.print();
    
    // Restore original settings
    document.title = originalTitle;
    document.body.classList.remove('printing-volunteers');
  };

  if (loading && !event) {
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
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Volunteer Management
        </Typography>
        {event && (
          <Typography variant="h6" color="text.secondary">
            {event.title}
          </Typography>
        )}
      </Box>

      {/* Print-only Header */}
      <div className="print-only print-header">
        <h1>Volunteer List</h1>
        {event && <h2>{event.title}</h2>}
        <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
      </div>

      {/* Stats Section */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          bgcolor: 'background.paper',
          borderRadius: 2
        }}
        className="stats-section"
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="text.secondary">Total Volunteers</Typography>
              <Typography variant="h3" color="primary">{volunteers.length}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="text.secondary">Approved</Typography>
              <Typography variant="h3" color="success.main">
                {volunteers.filter(v => v.status === 'approved').length}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="text.secondary">Pending</Typography>
              <Typography variant="h3" color="warning.main">
                {volunteers.filter(v => v.status === 'pending').length}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="text.secondary">Rejected</Typography>
              <Typography variant="h3" color="error.main">
                {volunteers.filter(v => v.status === 'rejected').length}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters Section */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          bgcolor: 'background.paper',
          borderRadius: 2
        }}
        className="filters-section no-print"
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search Volunteers"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            variant="outlined"
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportVolunteers}
          >
            Export
          </Button>
          
          {volunteers.length === 0 && (
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={handleCreateTestVolunteers}
            >
              Generate Test Volunteers
            </Button>
          )}
          
          <Tooltip title="Print Volunteer List">
            <IconButton onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Tabs and Volunteer List */}
      <Paper
        elevation={3}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          className="no-print"
        >
          <Tab label="All Volunteers" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Pending 
                <Chip
                  label={volunteers.filter(v => v.status === 'pending').length}
                  size="small"
                  color="warning"
                  sx={{ ml: 1 }}
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Approved
                <Chip
                  label={volunteers.filter(v => v.status === 'approved').length}
                  size="small"
                  color="success"
                  sx={{ ml: 1 }}
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Rejected
                <Chip
                  label={volunteers.filter(v => v.status === 'rejected').length}
                  size="small"
                  color="error"
                  sx={{ ml: 1 }}
                />
              </Box>
            } 
          />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Volunteer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Skills</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Status</TableCell>
                <TableCell className="no-print">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {console.log('Rendering volunteers table with:', filteredVolunteers)}
              {filteredVolunteers.length > 0 ? (
                filteredVolunteers.map(volunteer => (
                  <TableRow key={volunteer.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1">
                          {volunteer.first_name} {volunteer.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Signed up: {new Date(volunteer.created_at || Date.now()).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{volunteer.email || 'No email provided'}</Typography>
                      <Typography variant="body2">{volunteer.phone || 'No phone provided'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {volunteer.skills && volunteer.skills.length > 0 ? (
                          volunteer.skills.map((skill, idx) => (
                            <Chip key={idx} label={skill} size="small" />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">No skills listed</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {volunteer.hours_contributed || volunteer.hours_worked || 'Not recorded'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={volunteer.status || 'pending'}
                        color={getStatusChipColor(volunteer.status || 'pending')}
                        className={`status-chip status-${volunteer.status}`}
                      />
                    </TableCell>
                    <TableCell className="no-print">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {volunteer.status === 'pending' && (
                          <>
                            <Tooltip title="Approve Volunteer">
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleApproveClick(volunteer)}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Volunteer">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleRejectClick(volunteer)}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Edit Hours">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleEditHoursClick(volunteer)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Email Volunteer">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleEmailClick(volunteer)}
                          >
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      No volunteers found matching the current filters.
                    </Typography>
                    {volunteers.length === 0 && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateTestVolunteers}
                        sx={{ mt: 2 }}
                        className="no-print"
                      >
                        Add Test Volunteers
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialogs */}
      <Dialog
        open={dialog.open}
        onClose={handleDialogClose}
        aria-labelledby="volunteer-dialog-title"
        container={() => document.getElementById('dialog-container')}
        disablePortal={false}
      >
        {dialog.type === 'approve' && (
          <>
            <DialogTitle id="volunteer-dialog-title">Approve Volunteer</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to approve {dialog.volunteer?.first_name} {dialog.volunteer?.last_name} as a volunteer for this event?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button onClick={handleConfirmDialog} variant="contained" color="success">
                Approve
              </Button>
            </DialogActions>
          </>
        )}
        
        {dialog.type === 'reject' && (
          <>
            <DialogTitle>Reject Volunteer</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to reject {dialog.volunteer?.first_name} {dialog.volunteer?.last_name} as a volunteer for this event?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button onClick={handleConfirmDialog} variant="contained" color="error">
                Reject
              </Button>
            </DialogActions>
          </>
        )}
        
        {dialog.type === 'email' && (
          <>
            <DialogTitle>Email Volunteer</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                Send an email to {dialog.volunteer?.first_name} {dialog.volunteer?.last_name} ({dialog.volunteer?.email})
              </DialogContentText>
              <TextField
                fullWidth
                label="Subject"
                variant="outlined"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Message"
                variant="outlined"
                multiline
                rows={4}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button 
                onClick={handleConfirmDialog} 
                variant="contained" 
                color="primary"
                disabled={!emailSubject || !emailMessage || loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Email'}
              </Button>
            </DialogActions>
          </>
        )}
        
        {dialog.type === 'editHours' && (
          <>
            <DialogTitle>Edit Volunteer Hours</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                Update hours worked by {dialog.volunteer?.first_name} {dialog.volunteer?.last_name}
              </DialogContentText>
              <TextField
                fullWidth
                label="Hours Worked"
                variant="outlined"
                type="number"
                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button onClick={handleConfirmDialog} variant="contained" color="primary">
                Update Hours
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)}
          severity={isSuccess ? "success" : "error"}
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VolunteerManagement; 