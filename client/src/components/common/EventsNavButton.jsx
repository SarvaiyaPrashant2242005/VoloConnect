import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const EventsNavButton = () => {
  const navigate = useNavigate();

  const goToDashboardEvents = () => {
    // Store the target tab in sessionStorage
    sessionStorage.setItem('dashboardActiveTab', 'all-events');
    
    // Navigate to the dashboard
    navigate('/dashboard');
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={goToDashboardEvents}
    >
      Browse Events
    </Button>
  );
};

export default EventsNavButton; 