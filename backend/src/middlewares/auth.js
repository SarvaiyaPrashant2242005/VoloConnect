// middlewares/auth.js - Authentication middleware
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      
      // Check if user exists
      const [users] = await pool.query('SELECT id, username, email FROM users WHERE id = ?', [decoded.id]);
      
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Attach user info to the request object
      req.user = users[0];
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  authenticateToken
};