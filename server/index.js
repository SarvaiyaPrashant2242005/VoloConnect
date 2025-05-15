// index.js
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const volunteerRoutes = require('./routes/volunteers');
const emailRoutes = require('./routes/email');
const cors = require('cors');
require('dotenv').config();

// Middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'user-id'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Routes
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- /api/volunteers');
  console.log('- /api/events');
  console.log('- /api/auth');
  console.log('- /api/email');
});
