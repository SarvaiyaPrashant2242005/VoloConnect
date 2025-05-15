CREATE TABLE volunteer_events (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    volunteer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skills JSONB,
    availability JSONB,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    feedback TEXT,
    hours_contributed DECIMAL(10,2) DEFAULT 0,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(event_id, volunteer_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_volunteer_events_event ON volunteer_events(event_id);
CREATE INDEX idx_volunteer_events_volunteer ON volunteer_events(volunteer_id);
CREATE INDEX idx_volunteer_events_status ON volunteer_events(status);
CREATE INDEX idx_volunteer_events_applied_at ON volunteer_events(applied_at); 