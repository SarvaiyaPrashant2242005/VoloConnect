const express = require('express');
const volunteerRoutes = require('./routes/volunteers');
const eventRoutes = require('./routes/events');
const eventManagementRoutes = require('./routes/event_management');
const volunteerManagementRoutes = require('./routes/volunteer_management');
const emailRoutes = require('./routes/email');
const queriesRoutes = require('./routes/queries');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/event-management', eventManagementRoutes);
app.use('/api/volunteer-management', volunteerManagementRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/queries', queriesRoutes);

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

module.exports = app;