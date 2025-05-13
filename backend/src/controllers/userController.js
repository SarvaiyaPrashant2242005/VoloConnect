// controllers/userController.js - User controller
const userService = require('../services/userService');

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate inputs
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    const user = await userService.registerUser(req.body);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login a user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const result = await userService.loginUser(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Get current user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};