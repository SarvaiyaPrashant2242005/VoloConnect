const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const auth = require('../middleware/auth');

// Get volunteer stats
router.get('/volunteers/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get volunteer statistics from database
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM events WHERE organizer_id = $1) as total_events,
        (SELECT COUNT(*) FROM volunteer_events WHERE volunteer_id = $1) as events_joined,
        (SELECT COALESCE(SUM(hours_contributed), 0) FROM volunteer_events WHERE volunteer_id = $1) as hours_contributed,
        (SELECT COUNT(*) FROM volunteer_events ve 
         JOIN events e ON ve.event_id = e.id 
         WHERE ve.volunteer_id = $1 AND e.date > CURRENT_TIMESTAMP) as upcoming_events
    `;

    const result = await pool.query(statsQuery, [userId]);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching volunteer statistics',
      error: error.message
    });
  }
});

module.exports = router; 