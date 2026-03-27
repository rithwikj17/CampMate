-- CampMate Schema Upgrade Script
-- Apply this script to the existing database to upgrade the schema.

-- ====================================================
-- 1. Modify `users` table
-- Add: profile_picture_url, bio, is_active
-- ====================================================
ALTER TABLE users 
ADD COLUMN profile_picture_url VARCHAR(500),
ADD COLUMN bio TEXT,
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- ====================================================
-- 2. Modify `clubs` table
-- Add: banner_image_url, social_links (JSONB), member_count, deleted_at
-- ====================================================
ALTER TABLE clubs 
ADD COLUMN banner_image_url VARCHAR(500),
ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN member_count INTEGER DEFAULT 0,
ADD COLUMN deleted_at TIMESTAMP NULL;

-- ====================================================
-- 3. Modify `events` table
-- Ensure existing 'category' column converts well or is replaced 
-- since it was previously a VARCHAR(50). We'll alter it.
-- Add max_participants, is_cancelled, deleted_at
-- ====================================================
-- Step A: Create the ENUM type
DO $$ BEGIN
    CREATE TYPE event_category AS ENUM ('Technical', 'Cultural', 'Sports', 'Workshop', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step B: Alter existing category column to cast to ENUM
ALTER TABLE events 
ALTER COLUMN category TYPE event_category USING (
  CASE 
    WHEN category IN ('Technical', 'Cultural', 'Sports', 'Workshop') THEN category::event_category 
    ELSE 'Other'::event_category 
  END
),
ADD COLUMN max_participants INTEGER NULL,
ADD COLUMN is_cancelled BOOLEAN DEFAULT false,
ADD COLUMN deleted_at TIMESTAMP NULL;

-- ====================================================
-- 4. Modify `event_registrations` table
-- Modify registered_at (already set in `database.sql` as TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
-- but ensuring it matches requirements). Adding status.
-- ====================================================
-- Step A: Create the ENUM type for status
DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('Confirmed', 'Waitlisted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE event_registrations 
ADD COLUMN status registration_status DEFAULT 'Confirmed';

-- ====================================================
-- 5. Create `announcements` table
-- id, club_id, author_id, title, body, created_at
-- ====================================================
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- 6. Create `notifications` table
-- id, user_id, message, is_read, type, ref_id, created_at
-- ====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    type VARCHAR(50) NOT NULL, -- e.g., 'event_update', 'club_invite'
    ref_id INTEGER,            -- reference to the related record ID, e.g. event_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- 7. Add Performance Indexes
-- events.date, events.club_id (organizer_id), event_registrations.user_id, notifications.user_id
-- ====================================================
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ====================================================
-- 8. Trigger to auto-update clubs.member_count
-- when club_members rows are inserted or deleted
-- ====================================================

-- Function to handle the count
CREATE OR REPLACE FUNCTION update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE clubs 
        SET member_count = member_count + 1 
        WHERE id = NEW.club_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE clubs 
        SET member_count = GREATEST(member_count - 1, 0) 
        WHERE id = OLD.club_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger dropping and recreation (allows safe re-runs)
DROP TRIGGER IF EXISTS trigger_update_club_member_count ON club_members;

CREATE TRIGGER trigger_update_club_member_count
AFTER INSERT OR DELETE ON club_members
FOR EACH ROW
EXECUTE FUNCTION update_club_member_count();

-- Optional: Initialize correct counts for existing data
UPDATE clubs c
SET member_count = (
    SELECT COUNT(*) FROM club_members cm WHERE cm.club_id = c.id
);
