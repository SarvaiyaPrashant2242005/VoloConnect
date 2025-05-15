# VoloConnect - Volunteer Management System

VoloConnect is a comprehensive platform for managing volunteer events and coordinating volunteers.

## Features

- Event creation and management
- Volunteer application and approval process
- Automated volunteer slot tracking
- User authentication and role-based access
- Email notifications for volunteer status changes

## Email Configuration

The system uses nodemailer to send emails to volunteers. To configure email functionality:

1. Install nodemailer:
```
npm install nodemailer --save
```

2. Create/update a `.env` file in the server directory with the following settings:
```
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=VoloConnect <your_email@gmail.com>
```

Note: When using Gmail, you need to use an App Password rather than your regular password. You can generate an App Password in your Google Account settings under "Security" > "App passwords".

## Installation and Setup

1. Clone the repository
2. Install dependencies:
```
cd client && npm install
cd ../server && npm install
```
3. Set up the database
4. Configure environment variables
5. Start the server and client:
```
cd server && npm run dev
cd client && npm start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Database Structure

The system uses a MySQL database with the following main tables:

### Users
Stores user information for both volunteers and event organizers.

### Events
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    organizer_id INTEGER REFERENCES users(id),
    required_skills TEXT,
    max_volunteers INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Event Volunteers
```sql
CREATE TABLE event_volunteers (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    volunteer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skills TEXT,
    available_hours TEXT,
    special_needs TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    feedback TEXT,
    hours_contributed DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(event_id, volunteer_id)
);
```

## API Structure

The application provides the following API endpoints:

### Events Management
- `GET /api/event-management/` - Get all events
- `GET /api/event-management/upcoming` - Get upcoming events
- `GET /api/event-management/:id` - Get event by ID
- `POST /api/event-management/` - Create new event (requires authentication)
- `PUT /api/event-management/:id` - Update event (requires authentication and authorization)
- `DELETE /api/event-management/:id` - Delete event (requires authentication and authorization)
- `GET /api/event-management/organizer/:id` - Get events by organizer ID (requires authentication)
- `GET /api/event-management/stats/dashboard` - Get events statistics for dashboard (requires authentication)

### Volunteer Management
- `POST /api/volunteer-management/apply` - Apply to volunteer for an event (requires authentication)
- `GET /api/volunteer-management/history` - Get volunteer history for the authenticated user (requires authentication)
- `GET /api/volunteer-management/event/:event_id` - Get volunteers for an event (requires authentication and authorization)
- `PUT /api/volunteer-management/event/:event_id/volunteer/:volunteer_id` - Update volunteer status (requires authentication and authorization)
- `PUT /api/volunteer-management/event/:event_id/volunteer/:volunteer_id/approve` - Approve a volunteer (requires authentication and authorization)
- `PUT /api/volunteer-management/event/:event_id/volunteer/:volunteer_id/reject` - Reject a volunteer (requires authentication and authorization)
- `PUT /api/volunteer-management/event/:event_id/volunteer/:volunteer_id/hours` - Update volunteer hours (requires authentication and authorization)
- `GET /api/volunteer-management/stats` - Get volunteer statistics (requires authentication)

## Authentication and Authorization

The application uses token-based authentication with JWT (JSON Web Tokens). Most API endpoints require authentication, and some also require authorization (e.g., only event organizers can manage their own events).

## Error Handling

The API returns consistent error responses in the following format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information (in development mode only)"
}
```

## Contributors

- VoloConnect Team 