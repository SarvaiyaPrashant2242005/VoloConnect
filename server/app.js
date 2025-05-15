const express = require('express');
const cors = require('cors');
const volunteerRoutes = require('./routes/volunteers');
const eventRoutes = require('./routes/events');

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', volunteerRoutes);
app.use('/api', eventRoutes);

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
}); 