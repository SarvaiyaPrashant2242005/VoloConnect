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

-- Create indexes for better query performance
CREATE INDEX idx_event_volunteers_event ON event_volunteers(event_id);
CREATE INDEX idx_event_volunteers_volunteer ON event_volunteers(volunteer_id);
CREATE INDEX idx_event_volunteers_status ON event_volunteers(status);
CREATE INDEX idx_event_volunteers_created_at ON event_volunteers(created_at); 