// services/userService.js - User-related database operations
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new user
const registerUser = async (userData) => {
  try {
    const { username, email, password } = userData;
    
    // Check if email already exists
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      throw new Error('Email already in use');
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user ID
    const userId = `user-${Date.now()}`;
    
    // Insert user into database
    await pool.query(
      'INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)',
      [userId, username, email, hashedPassword]
    );
    
    // Return user info without the password
    return {
      id: userId,
      username,
      email
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login a user
const loginUser = async (email, password) => {
  try {
    // Find user by email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      throw new Error('Invalid email or password');
    }
    
    const user = users[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Return user info and token
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

// Get a user by ID
const getUserById = async (userId) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, createdAt FROM users WHERE id = ?',
      [userId]
    );
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`Error getting user ${userId}:`, error);
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserById
};