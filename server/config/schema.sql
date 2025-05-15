-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS voloconnect;
USE voloconnect;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    skills JSON NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Drop existing tables if they exist
DROP TABLE IF EXISTS event_approvals;
DROP TABLE IF EXISTS volunteer_hours;
DROP TABLE IF EXISTS events;

-- Create events table with correct data types
CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    organizer_id INT,
    required_skills JSON,
    max_volunteers INT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Volunteer hours table
CREATE TABLE IF NOT EXISTS volunteer_hours (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    duration INT NOT NULL, -- Duration in minutes
    date DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Queries table
CREATE TABLE IF NOT EXISTS queries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Event Approvals table
CREATE TABLE IF NOT EXISTS event_approvals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    approver_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_volunteers_event ON volunteer_hours(event_id);
CREATE INDEX idx_volunteers_user ON volunteer_hours(user_id);
CREATE INDEX idx_queries_user ON queries(user_id);
CREATE INDEX idx_queries_event ON queries(event_id);
CREATE INDEX idx_event_approvals_event ON event_approvals(event_id);
CREATE INDEX idx_event_approvals_approver ON event_approvals(approver_id); 