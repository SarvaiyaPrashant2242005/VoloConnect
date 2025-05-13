// app.js - Main application entry point
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const queryRoutes = require('./routes/queryRoutes');

// Import database configuration
const { testConnection } = require('./config/db');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/queries', queryRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Test database connection
  await testConnection();
});

module.exports = app;