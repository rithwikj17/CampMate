-- CampMate Database Schema & Sample Data
-- Database: campmate

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Student', 'Club Member', 'Administrator')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clubs (
    id SERIAL PRIMARY KEY,
    club_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS club_members (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Member', 'Admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    organizer_id INTEGER REFERENCES clubs(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

CREATE TABLE IF NOT EXISTS campus_locations (
    id SERIAL PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data (Seed)

-- Passwords are 'password123' (bcrypt hash can be replaced in actual app, using a dummy hash here for illustration)
-- Assume dummy hash: $2b$10$xyz...
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@campmate.edu', '$2b$10$EpR0.OItQc89Uquv59T53u0.A2V7UUSyO.oMhY16oOaO9Xz8fCqOq', 'Administrator'),
('John Doe', 'john@campmate.edu', '$2b$10$EpR0.OItQc89Uquv59T53u0.A2V7UUSyO.oMhY16oOaO9Xz8fCqOq', 'Student'),
('Jane Smith', 'jane.club@campmate.edu', '$2b$10$EpR0.OItQc89Uquv59T53u0.A2V7UUSyO.oMhY16oOaO9Xz8fCqOq', 'Club Member');

INSERT INTO clubs (club_name, description) VALUES 
('Cultural Club BVRIT', 'A club for culturals.'),
('Coding Brigades BVRIT', 'Weekly coding challenges, hackathons, and tech talks.');

INSERT INTO club_members (club_id, user_id, role) VALUES 
(2, 3, 'Admin');

INSERT INTO events (title, description, date, time, venue, category, organizer_id) VALUES 
('Annual Hackathon', '24-hour university-wide hackathon.', '2026-05-10', '09:00:00', 'Main Auditorium', 'Technology', 2),
('Robo Wars', 'Build and fight robots.', '2026-05-15', '14:00:00', 'Robotics Lab', 'Technology', 1);

INSERT INTO event_registrations (user_id, event_id) VALUES 
(2, 1);

INSERT INTO campus_locations (location_name, latitude, longitude, description) VALUES 
('Library', 28.5355, 1.1558, 'Central Library with 24/7 reading rooms.'),
('Main Auditorium', 28.5360, 77.1560, 'Holds events and seminars.'),
('Robotics Lab', 28.5350, 77.1540, 'Advanced machines and kits.'),
('Student Hostel A', 28.5370, 77.1570, 'Boys Hostel A');
