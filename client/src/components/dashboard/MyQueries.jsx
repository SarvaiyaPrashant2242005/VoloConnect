import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Link as MuiLink
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { queryService } from '../../services/queryService';
import BackButton from '../common/BackButton';
import EventsNavButton from '../common/EventsNavButton';

const MyQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine if we're inside the dashboard or on a standalone page
  const isInDashboard = location.pathname === '/dashboard';
  
  // Custom back button handler to navigate back to dashboard with state
  const handleBackClick = () => {
    navigate('/dashboard', { state: { from: 'my-queries' } });
  };

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setLoading(true);
        const data = await queryService.getUserQueries();
        setQueries(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching queries:', err);
        setError('Failed to load your queries. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQueries();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        {!isInDashboard && (
          <Button 
            onClick={handleBackClick}
            sx={{ mb: 2 }}
            startIcon={<span>←</span>}
          >
            Back to Dashboard
          </Button>
        )}
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading your questions...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {!isInDashboard && (
          <Button 
            onClick={handleBackClick}
            sx={{ mb: 2 }}
            startIcon={<span>←</span>}
          >
            Back to Dashboard
          </Button>
        )}
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (queries.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {!isInDashboard && (
          <Button 
            onClick={handleBackClick}
            sx={{ mb: 2 }}
            startIcon={<span>←</span>}
          >
            Back to Dashboard
          </Button>
        )}
        <Typography variant="h5" gutterBottom>
          My Questions
        </Typography>
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You haven't asked any questions about events yet.
          </Typography>
          <EventsNavButton />
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {!isInDashboard && (
        <Button 
          onClick={handleBackClick}
          sx={{ mb: 2 }}
          startIcon={<span>←</span>}
        >
          Back to Dashboard
        </Button>
      )}
      <Typography variant="h5" gutterBottom>
        My Questions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View and manage questions you've asked about different events.
      </Typography>

      {queries.map((query) => (
        <Card key={query.id} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                <MuiLink component={Link} to={`/events/${query.event_id}`}>
                  {query.event_title}
                </MuiLink>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(query.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                {query.message}
              </Typography>
            </Box>

            {query.response ? (
              <Box sx={{ mt: 2, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Response:
                </Typography>
                <Typography variant="body2">
                  {query.response}
                </Typography>
              </Box>
            ) : (
              <Chip 
                label="Awaiting response" 
                color="warning" 
                size="small" 
                sx={{ mt: 1 }}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default MyQueries; 