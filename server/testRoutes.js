const express = require('express');
const cors = require('cors');

// Create a simple test server
const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route works' });
});

// Try to load the email routes
try {
  console.log('Loading email routes...');
  const emailRoutes = require('./routes/email');
  console.log('Email routes loaded successfully');
  
  // Register email routes with a different prefix for testing
  app.use('/test-email', emailRoutes);
  console.log('Email routes registered at /test-email');
  
  // Also register them at the normal path
  app.use('/api/email', emailRoutes);
  console.log('Email routes registered at /api/email');
} catch (error) {
  console.error('Error loading email routes:', error);
}

// Start the test server on a different port
const TEST_PORT = 3002;
app.listen(TEST_PORT, () => {
  console.log(`Test server running at http://localhost:${TEST_PORT}`);
  console.log(`Try accessing: http://localhost:${TEST_PORT}/test`);
  console.log(`Try accessing: http://localhost:${TEST_PORT}/test-email/test`);
}); 