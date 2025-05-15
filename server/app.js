const express = require('express');
const cors = require('cors');
const volunteerRoutes = require('./routes/volunteers');
const eventRoutes = require('./routes/events');
const eventManagementRoutes = require('./routes/event_management');
const volunteerManagementRoutes = require('./routes/volunteer_management');

// Add more detailed logging
try {
  const emailRoutes = require('./routes/email');
  console.log('Email routes loaded successfully');
  
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  
  // API routes
  app.use('/api/volunteers', volunteerRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/event-management', eventManagementRoutes);
  app.use('/api/volunteer-management', volunteerManagementRoutes);
  app.use('/api/email', emailRoutes);
  
  console.log('Routes registered:');
  console.log('- /api/volunteers');
  console.log('- /api/events');
  console.log('- /api/event-management');
  console.log('- /api/volunteer-management');
  console.log('- /api/email');
  
  // Test database connection
  const pool = require('./config/database');
  const testConnection = async () => {
    try {
      const connection = await pool.getConnection();
      console.log('Database connection established successfully');
      connection.release();
    } catch (error) {
      console.error('Error connecting to the database:', error);
      process.exit(1);
    }
  };
  testConnection();
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Express error handler:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });
  
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API is available at http://localhost:${PORT}`);
  });
  
  module.exports = app;
} catch (error) {
  console.error('Error during app initialization:', error);
  process.exit(1);
} 