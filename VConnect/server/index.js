// index.js
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const cors = require('cors');
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(cors());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] // Replace with your production domain
    : ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite's default development ports
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Routes
app.use('/voloconnect/auth', authRoutes);
app.use('/voloconnect/events', eventsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
