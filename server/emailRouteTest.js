const express = require('express');
const cors = require('cors');
const bodyParser = require('express').json;

console.log('Starting email route test server...');

// Create a simple Express server
const app = express();
app.use(cors());
app.use(bodyParser());

// Simple route for testing
app.get('/', (req, res) => {
  res.send('Email route test server is running. Try <a href="/send-test-email">sending a test email</a>');
});

// Mock the authentication middleware to always pass
const mockAuth = (req, res, next) => {
  req.user = { id: 1 }; // Mock authenticated user
  next();
};

// Mock the database queries
const mockPool = {
  query: async (sql, params) => {
    console.log('Mock SQL query:', sql);
    console.log('Query params:', params);
    
    // Return mock data depending on the query
    if (sql.includes('SELECT') && sql.includes('event_volunteers')) {
      return [[{
        volunteer_application_id: 3,
        volunteer_id: 2,
        event_id: 1,
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        event_title: 'Test Event'
      }]];
    }
    
    if (sql.includes('SELECT') && sql.includes('organizer_id')) {
      return [[{ organizer_id: 1 }]];
    }
    
    return [{ affectedRows: 1 }];
  }
};

// Mock the email service
const mockEmailService = {
  sendCustomVolunteerEmail: async (options) => {
    console.log('Mock sending email with options:', options);
    return { messageId: 'mock-123456' };
  }
};

// Modified route handler for testing
app.get('/send-test-email', async (req, res) => {
  try {
    console.log('Test route accessed - simulating email sending process');
    
    // Mock data
    const volunteerId = 3;
    const userId = 1;
    const subject = 'Test Email';
    const message = 'This is a test email message';
    
    console.log(`Sending email to volunteer ${volunteerId} from user ${userId}`);
    
    // Get volunteer information (using mock query)
    const [volunteers] = await mockPool.query(`
      SELECT 
        ev.id AS volunteer_application_id,
        ev.volunteer_id,
        ev.event_id,
        u.first_name,
        u.last_name,
        u.email,
        e.title AS event_title
      FROM event_volunteers ev
      JOIN users u ON ev.volunteer_id = u.id
      JOIN events e ON ev.event_id = e.id
      WHERE ev.id = ?
    `, [volunteerId]);
    
    if (volunteers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }
    
    const volunteer = volunteers[0];
    
    // Check if the requesting user is the event organizer (using mock query)
    const [events] = await mockPool.query('SELECT organizer_id FROM events WHERE id = ?', [volunteer.event_id]);
    
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    if (events[0].organizer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only event organizers can send emails to volunteers'
      });
    }
    
    // Send the email using the mock service
    await mockEmailService.sendCustomVolunteerEmail({
      to: volunteer.email,
      name: `${volunteer.first_name} ${volunteer.last_name}`,
      subject,
      message,
      eventTitle: volunteer.event_title
    });
    
    // Try to log the email in the database (will be mocked)
    try {
      await mockPool.query(`
        INSERT INTO communication_logs (
          sender_id, 
          recipient_id, 
          event_id, 
          type, 
          subject, 
          message, 
          created_at
        ) VALUES (?, ?, ?, 'email', ?, ?, NOW())
      `, [userId, volunteer.volunteer_id, volunteer.event_id, subject, message]);
    } catch (logError) {
      console.warn('Could not log email to database:', logError.message);
    }
    
    // Return success response
    res.json({
      success: true,
      message: 'Email sent successfully (mock)',
      to: volunteer.email
    });
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: error.message
    });
  }
});

// Start the server
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`Try accessing: http://localhost:${PORT}/send-test-email`);
}); 