const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateUser } = require('../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
    console.log('Query Route accessed:', req.method, req.path);
    console.log('Headers:', req.headers);
    next();
});

// Get all queries for a specific event
router.get('/event/:eventId', authenticateUser, async (req, res) => {
    try {
        const [queries] = await db.query(
            `SELECT q.id, q.user_id, q.event_id, q.message, q.created_at, q.status,
                    u.first_name, u.last_name,
                    (SELECT qr.response FROM query_responses qr WHERE qr.query_id = q.id ORDER BY qr.created_at DESC LIMIT 1) as response,
                    (SELECT responder_id FROM query_responses qr WHERE qr.query_id = q.id ORDER BY qr.created_at DESC LIMIT 1) as responder_id,
                    (SELECT CONCAT(u2.first_name, ' ', u2.last_name) FROM query_responses qr 
                     JOIN users u2 ON qr.responder_id = u2.id 
                     WHERE qr.query_id = q.id ORDER BY qr.created_at DESC LIMIT 1) as responder_name
             FROM queries q
             JOIN users u ON q.user_id = u.id
             WHERE q.event_id = ? 
             ORDER BY q.created_at DESC`,
            [req.params.eventId]
        );
        
        // Format user names
        const formattedQueries = queries.map(query => ({
            ...query,
            user_name: `${query.first_name} ${query.last_name}`
        }));
        
        res.json(formattedQueries);
    } catch (error) {
        console.error('Error fetching queries:', error);
        res.status(500).json({ message: 'Error fetching queries' });
    }
});

// Get all queries for the current user
router.get('/my-queries', authenticateUser, async (req, res) => {
    try {
        const [queries] = await db.query(
            `SELECT q.id, q.user_id, q.event_id, q.message, q.created_at, q.status,
                    e.title as event_title,
                    (SELECT qr.response FROM query_responses qr WHERE qr.query_id = q.id ORDER BY qr.created_at DESC LIMIT 1) as response
             FROM queries q
             JOIN events e ON q.event_id = e.id
             WHERE q.user_id = ? 
             ORDER BY q.created_at DESC`,
            [req.user.id]
        );
        res.json(queries);
    } catch (error) {
        console.error('Error fetching user queries:', error);
        res.status(500).json({ message: 'Error fetching user queries' });
    }
});

// Create a new query
router.post('/', authenticateUser, async (req, res) => {
    const { event_id, message } = req.body;
    
    if (!event_id || !message) {
        return res.status(400).json({ message: 'Event ID and message are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO queries (user_id, event_id, message, status) VALUES (?, ?, ?, "pending")',
            [req.user.id, event_id, message]
        );
        
        const [newQuery] = await db.query(
            `SELECT q.id, q.user_id, q.event_id, q.message, q.created_at, q.status,
                    u.first_name, u.last_name
             FROM queries q
             JOIN users u ON q.user_id = u.id
             WHERE q.id = ?`,
            [result.insertId]
        );
        
        // Format user name
        if (newQuery[0]) {
            newQuery[0].user_name = `${newQuery[0].first_name} ${newQuery[0].last_name}`;
        }
        
        res.status(201).json(newQuery[0]);
    } catch (error) {
        console.error('Error creating query:', error);
        res.status(500).json({ message: 'Error creating query' });
    }
});

// Update a query (for organizers to respond)
router.put('/:queryId', authenticateUser, async (req, res) => {
    const { response } = req.body;
    const queryId = req.params.queryId;

    if (!response) {
        return res.status(400).json({ message: 'Response is required' });
    }

    try {
        // First check if the user is the organizer of the event
        const [query] = await db.query(
            `SELECT e.organizer_id, q.id 
             FROM queries q 
             JOIN events e ON q.event_id = e.id 
             WHERE q.id = ?`,
            [queryId]
        );

        if (!query[0]) {
            return res.status(404).json({ message: 'Query not found' });
        }

        if (query[0].organizer_id !== req.user.id) {
            return res.status(403).json({ message: 'Only event organizers can respond to queries' });
        }

        // Insert response in query_responses table
        await db.query(
            'INSERT INTO query_responses (query_id, responder_id, response) VALUES (?, ?, ?)',
            [queryId, req.user.id, response]
        );
        
        // Update query status to answered
        await db.query(
            'UPDATE queries SET status = "answered" WHERE id = ?',
            [queryId]
        );

        // Get the updated query with the response
        const [updatedQuery] = await db.query(
            `SELECT q.id, q.user_id, q.event_id, q.message, q.created_at, q.status,
                    u.first_name, u.last_name,
                    (SELECT qr.response FROM query_responses qr WHERE qr.query_id = q.id ORDER BY qr.created_at DESC LIMIT 1) as response,
                    (SELECT responder_id FROM query_responses qr WHERE qr.query_id = q.id ORDER BY qr.created_at DESC LIMIT 1) as responder_id,
                    (SELECT CONCAT(u2.first_name, ' ', u2.last_name) FROM query_responses qr 
                     JOIN users u2 ON qr.responder_id = u2.id 
                     WHERE qr.query_id = q.id ORDER BY qr.created_at DESC LIMIT 1) as responder_name
             FROM queries q
             JOIN users u ON q.user_id = u.id
             WHERE q.id = ?`,
            [queryId]
        );
        
        // Format user name
        if (updatedQuery[0]) {
            updatedQuery[0].user_name = `${updatedQuery[0].first_name} ${updatedQuery[0].last_name}`;
        }

        res.json(updatedQuery[0]);
    } catch (error) {
        console.error('Error updating query:', error);
        res.status(500).json({ message: 'Error updating query' });
    }
});

// Delete a query (only by the user who created it)
router.delete('/:queryId', authenticateUser, async (req, res) => {
    try {
        const [query] = await db.query(
            'SELECT user_id FROM queries WHERE id = ?',
            [req.params.queryId]
        );

        if (!query[0]) {
            return res.status(404).json({ message: 'Query not found' });
        }

        if (query[0].user_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own queries' });
        }

        // First delete any responses
        await db.query('DELETE FROM query_responses WHERE query_id = ?', [req.params.queryId]);
        
        // Then delete the query
        await db.query('DELETE FROM queries WHERE id = ?', [req.params.queryId]);
        
        res.json({ message: 'Query deleted successfully' });
    } catch (error) {
        console.error('Error deleting query:', error);
        res.status(500).json({ message: 'Error deleting query' });
    }
});

module.exports = router; 