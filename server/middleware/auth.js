const pool = require('../config/database');

const authenticateUser = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];

    if (!userId) {
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

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

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
  