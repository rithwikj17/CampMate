require('dotenv').config();
const db = require('./db');

async function initDB() {
  console.log('🏗️  Initializing Database Schema...');
  
  try {
    // 1. Core Tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('Student', 'Club Member', 'Administrator')),
          profile_picture_url VARCHAR(500),
          bio TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS clubs (
          id SERIAL PRIMARY KEY,
          club_name VARCHAR(100) NOT NULL,
          description TEXT,
          created_by INTEGER REFERENCES users(id),
          banner_image_url VARCHAR(500),
          social_links JSONB DEFAULT '{}'::jsonb,
          member_count INTEGER DEFAULT 0,
          deleted_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS club_members (
          id SERIAL PRIMARY KEY,
          club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          role VARCHAR(50) NOT NULL CHECK (role IN ('Member', 'Admin')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      DO $$ BEGIN CREATE TYPE event_category AS ENUM ('Technical', 'Cultural', 'Sports', 'Workshop', 'Other'); EXCEPTION WHEN duplicate_object THEN null; END $$;

      CREATE TABLE IF NOT EXISTS events (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          time TIME NOT NULL,
          venue VARCHAR(200) NOT NULL,
          category event_category,
          organizer_id INTEGER REFERENCES clubs(id) ON DELETE SET NULL,
          max_participants INTEGER NULL,
          is_cancelled BOOLEAN DEFAULT false,
          poster_url VARCHAR(500),
          deleted_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      DO $$ BEGIN CREATE TYPE registration_status AS ENUM ('Confirmed', 'Waitlisted'); EXCEPTION WHEN duplicate_object THEN null; END $$;

      CREATE TABLE IF NOT EXISTS event_registrations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
          status registration_status DEFAULT 'Confirmed',
          registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, event_id)
      );
      
      -- We will add category and is_accessible columns if they are not present
      CREATE TABLE IF NOT EXISTS campus_locations (
          id SERIAL PRIMARY KEY,
          location_name VARCHAR(100) NOT NULL,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          description TEXT,
          category VARCHAR(50) DEFAULT 'Academic',
          is_accessible BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS announcements (
          id SERIAL PRIMARY KEY,
          club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
          author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT false,
          type VARCHAR(50) NOT NULL,
          ref_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS campus_boundaries (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          coordinates JSONB NOT NULL,
          color VARCHAR(20) DEFAULT '#3b82f6',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS campus_paths (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          path_type VARCHAR(50) DEFAULT 'Walkway',
          coordinates JSONB NOT NULL,
          is_accessible BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS map_pins (
          id SERIAL PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          description TEXT,
          category VARCHAR(50) NOT NULL,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add columns to campus_locations safely in case they exist from an older schema format
    try { await db.query("ALTER TABLE campus_locations ADD COLUMN category VARCHAR(50) DEFAULT 'Academic'"); } catch(e){}
    try { await db.query("ALTER TABLE campus_locations ADD COLUMN is_accessible BOOLEAN DEFAULT true"); } catch(e){}
    
    console.log('✅ All tables verified or created successfully!');
  } catch (err) {
    console.error('❌ Failed to initialize database schema:', err);
  } finally {
    process.exit(0);
  }
}

initDB();
