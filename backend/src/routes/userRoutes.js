// routes/userRoutes.js - User-related API routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

// Register a new user
router.post('/register', userController.registerUser);

// Login a user
router.post('/login', userController.loginUser);

// Get current user profile
router.get('/profile', authenticateToken, userController.getUserProfile);

module.exports = router;