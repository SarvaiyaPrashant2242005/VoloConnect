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

  useEffect(() => {
    const fetchEventAndVolunteers = async () => {
      try {
        setLoading(true);
        
        // Fetch event details
        const eventResponse = await api.get(`/api/events/${eventId}`);
        setEvent(eventResponse.data);
        
        // Fetch volunteers for this event
        const volunteersResponse = await api.get(`/api/events/${eventId}/volunteers`);
        
        // Check if the response has the expected structure
        if (volunteersResponse.data && volunteersResponse.data.success) {
          // Extract the volunteers array from the response
          setVolunteers(volunteersResponse.data.data || []);
        } else {
          // If the response doesn't have the expected structure, set an empty array
          setVolunteers([]);
          console.error('Unexpected response format:', volunteersResponse.data);
        }
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event and volunteer data');
        setVolunteers([]); // Ensure volunteers is always an array
      } finally {
        setLoading(false);
      }
    };

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
    setDialog({
      open: true,
      type: 'approve',
      volunteer
    });
  };

  const handleRejectClick = (volunteer) => {
    setDialog({
      open: true,
      type: 'reject',
      volunteer
    });
  };

  const handleEmailClick = (volunteer) => {
    setDialog({
      open: true,
      type: 'email',
      volunteer
    });
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
    setDialog({
      open: false,
      type: '',
      volunteer: null
    });
  };

  const handleConfirmDialog = async () => {
    const { type, volunteer } = dialog;
    
    try {
      setLoading(true);
      
      if (type === 'approve') {
        await api.put(`/api/events/${eventId}/volunteers/${volunteer.id}/approve`);
        // Update volunteer status in the list
        setVolunteers(volunteers.map(v => 
          v.id === volunteer.id ? { ...v, status: 'approved' } : v
        ));
      } else if (type === 'reject') {
        await api.put(`/api/events/${eventId}/volunteers/${volunteer.id}/reject`);
        // Update volunteer status in the list
        setVolunteers(volunteers.map(v => 
          v.id === volunteer.id ? { ...v, status: 'rejected' } : v
        ));
      } else if (type === 'editHours') {
        await api.put(`/api/events/${eventId}/volunteers/${volunteer.id}/hours`, {
          hours_worked: parseFloat(hoursWorked)
        });
        // Update volunteer hours in the list
        setVolunteers(volunteers.map(v => 
          v.id === volunteer.id ? { ...v, hours_worked: parseFloat(hoursWorked) } : v
        ));
      } else if (type === 'email') {
        // In a real app, this would send an email
        alert(`Email would be sent to ${volunteer.email}`);
      }
      
      handleDialogClose();
    } catch (err) {
      console.error('Error updating volunteer:', err);
      alert('Failed to update volunteer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportVolunteers = () => {
    if (volunteers.length === 0) {
      alert('No volunteers to export');
      return;
    }
    
    exportToExcel(volunteers, `volunteers-event-${eventId}`);
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    // Filter by search query
    const searchMatch = 
      volunteer.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status
    const statusMatch = statusFilter === 'all' || volunteer.status === statusFilter;
    
    // Filter by tab
    if (tabValue === 0) {
      return searchMatch && statusMatch;
    } else if (tabValue === 1) {
      return searchMatch && statusMatch && volunteer.status === 'pending';
    } else if (tabValue === 2) {
      return searchMatch && statusMatch && volunteer.status === 'approved';
    } else if (tabValue === 3) {
      return searchMatch && statusMatch && volunteer.status === 'rejected';
    }
    
    return searchMatch && statusMatch;
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

      {/* Stats Section */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          bgcolor: 'background.paper',
          borderRadius: 2
        }}
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
          
          <Tooltip title="Print Volunteer List">
            <IconButton onClick={() => window.print()}>
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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVolunteers.length > 0 ? (
                filteredVolunteers.map(volunteer => (
                  <TableRow key={volunteer.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1">
                          {volunteer.first_name} {volunteer.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Signed up: {new Date(volunteer.signup_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{volunteer.email}</Typography>
                      <Typography variant="body2">{volunteer.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(() => {
                          // Safely parse skills
                          let skillsArray = [];
                          try {
                            if (typeof volunteer.skills === 'string') {
                              skillsArray = JSON.parse(volunteer.skills || '[]');
                            } else if (Array.isArray(volunteer.skills)) {
                              skillsArray = volunteer.skills;
                            }
                          } catch (e) {
                            console.error('Error parsing skills:', e);
                          }
                          return skillsArray.map((skill, idx) => (
                            <Chip key={idx} label={skill} size="small" />
                          ));
                        })()}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {volunteer.hours_worked || 'Not recorded'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={volunteer.status}
                        color={getStatusChipColor(volunteer.status)}
                      />
                    </TableCell>
                    <TableCell>
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
      >
        {dialog.type === 'approve' && (
          <>
            <DialogTitle>Approve Volunteer</DialogTitle>
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
                defaultValue={`Information regarding ${event?.title}`}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Message"
                variant="outlined"
                multiline
                rows={4}
                defaultValue={`Dear ${dialog.volunteer?.first_name},\n\nThank you for volunteering for ${event?.title}.\n\nRegards,\nEvent Organizer`}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button onClick={handleConfirmDialog} variant="contained" color="primary">
                Send Email
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

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={isSuccess ? "success" : "error"}
        >
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VolunteerManagement; 