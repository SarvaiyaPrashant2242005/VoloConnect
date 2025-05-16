import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Paper,
  Divider,
  IconButton,
  Card,
  CardContent,
  Alert,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { queryService } from '../../services/queryService';
import { AuthContext } from '../../context/AuthContext.jsx';

const EventQueries = ({ eventId, isOrganizer }) => {
  const [queries, setQueries] = useState([]);
  const [newQuery, setNewQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseText, setResponseText] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { user } = useContext(AuthContext);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await queryService.getEventQueries(eventId);
      // Sort queries - answered ones first, then by date
      const sortedQueries = data.sort((a, b) => {
        // If one has a response and the other doesn't, prioritize the one with response
        if (a.response && !b.response) return -1;
        if (!a.response && b.response) return 1;
        // Otherwise sort by date, newest first
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setQueries(sortedQueries);
    } catch (error) {
      console.error('Error fetching queries:', error);
      setError('Failed to load queries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchQueries();
    }
  }, [eventId]);

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!newQuery.trim()) return;

    try {
      const addedQuery = await queryService.createQuery(eventId, newQuery);
      setQueries([addedQuery, ...queries]);
      setNewQuery('');
      setSnackbar({ open: true, message: 'Query submitted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error submitting query:', error);
      setSnackbar({ open: true, message: typeof error === 'string' ? error : 'Failed to submit question', severity: 'error' });
    }
  };

  const handleSubmitResponse = async (queryId) => {
    if (!responseText[queryId] || !responseText[queryId].trim()) return;

    try {
      const updatedQuery = await queryService.respondToQuery(queryId, responseText[queryId]);
      
      setQueries(queries.map(q => {
        if (q.id === queryId) {
          return updatedQuery;
        }
        return q;
      }));
      
      // Clear the response input
      setResponseText(prev => ({ ...prev, [queryId]: '' }));
      setSnackbar({ open: true, message: 'Response submitted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error responding to query:', error);
      setSnackbar({ open: true, message: typeof error === 'string' ? error : 'Failed to submit response', severity: 'error' });
    }
  };

  const handleDeleteQuery = async (queryId) => {
    try {
      await queryService.deleteQuery(queryId);
      setQueries(queries.filter(q => q.id !== queryId));
      setSnackbar({ open: true, message: 'Question deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting query:', error);
      setSnackbar({ open: true, message: typeof error === 'string' ? error : 'Failed to delete question', severity: 'error' });
    }
  };

  const handleResponseChange = (queryId, value) => {
    setResponseText(prev => ({ ...prev, [queryId]: value }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return <Typography>Loading queries...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Event Questions
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSubmitQuery}>
          <TextField
            fullWidth
            label="Ask a question about this event"
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            multiline
            rows={2}
            margin="normal"
            variant="outlined"
            placeholder="Type your question here..."
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              endIcon={<SendIcon />}
              disabled={!newQuery.trim()}
            >
              Submit Question
            </Button>
          </Box>
        </form>
      </Paper>

      <Typography variant="h6" sx={{ mb: 2 }}>
        {queries.length > 0 ? 'Previous Questions' : 'No questions yet'}
      </Typography>

      <List>
        {queries.map((query) => (
          <Card key={query.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">
                  Question from {query.user_id === user.id ? 'you' : (query.user_name || 'another participant')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(query.created_at).toLocaleString()}
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                {query.message}
              </Typography>
              
              {query.user_id === user.id && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteQuery(query.id)}
                    aria-label="delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              
              {query.response && (
                <Box sx={{ mt: 2, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    Organizer Response:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {query.response}
                  </Typography>
                </Box>
              )}
              
              {isOrganizer && !query.response && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2">Respond to this question:</Typography>
                  <TextField
                    fullWidth
                    value={responseText[query.id] || ''}
                    onChange={(e) => handleResponseChange(query.id, e.target.value)}
                    placeholder="Type your response..."
                    size="small"
                    multiline
                    rows={2}
                    sx={{ mt: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      endIcon={<SendIcon />}
                      onClick={() => handleSubmitResponse(query.id)}
                      disabled={!responseText[query.id]?.trim()}
                    >
                      Send Response
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </List>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventQueries; 