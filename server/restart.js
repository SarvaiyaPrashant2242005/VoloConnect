/**
 * Restart script for VoloConnect server
 * This runs on a different port to avoid conflicts with the existing server
 */

console.log('='.repeat(50));
console.log('STARTING TEST SERVER ON PORT 3002');
console.log('='.repeat(50));

// Create a separate Express app for testing
const express = require('express');
const cors = require('cors');
const bodyParser = express.json();

// Create the test app
const app = express();
app.use(cors());
app.use(bodyParser);

// Import routes
console.log('Loading routes...');
const emailRoutes = require('./routes/email');

// Mount routes
app.use('/api/email', emailRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.send(`
    <h1>VoloConnect Test Server</h1>
    <p>This is a test server running on port 3002.</p>
    <p>Try the following links:</p>
    <ul>
      <li><a href="/api/email/test">/api/email/test</a> - Test the email route</li>
    </ul>
  `);
});

// Start on a different port
const TEST_PORT = 3002;
app.listen(TEST_PORT, () => {
  console.log(`Test server running at http://localhost:${TEST_PORT}`);
  console.log('You can now access the email test route at:');
  console.log(`http://localhost:${TEST_PORT}/api/email/test`);
}); 