const pool = require('../config/database');

const authenticateUser = async (req, res, next) => {
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid user session' });
    }

    req.user = { id: userId };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  authenticateUser
};
  