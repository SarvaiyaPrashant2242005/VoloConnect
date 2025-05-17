const pool = require('../config/database');

const authenticateUser = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    
    console.log('Authentication middleware called');
    console.log('Headers:', req.headers);
    console.log('User ID from header:', userId);

    if (!userId) {
      console.log('Authentication failed: No user ID provided');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify that the user exists in the database
    const [users] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    console.log('User query result:', users);

    if (users.length === 0) {
      console.log(`Authentication failed: User ID ${userId} not found in database`);
      return res.status(401).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    console.log(`Authentication successful for user ID ${userId}`);
    req.user = { id: users[0].id };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

module.exports = { authenticateUser };
  