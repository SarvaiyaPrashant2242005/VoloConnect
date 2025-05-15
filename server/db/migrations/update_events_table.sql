-- Update events table to use start_date and end_date
BEGIN;

-- First add the new columns
ALTER TABLE events 
  ADD COLUMN start_date TIMESTAMP,
  ADD COLUMN end_date TIMESTAMP;

-- Migrate data from date column to start_date and end_date
UPDATE events
SET start_date = date,
    end_date = date + INTERVAL '2 hours'
WHERE date IS NOT NULL;

-- Make columns NOT NULL after data migration
ALTER TABLE events
  ALTER COLUMN start_date SET NOT NULL,
  ALTER COLUMN end_date SET NOT NULL;

-- Drop the old date column
ALTER TABLE events DROP COLUMN IF EXISTS date;

-- Update required_skills column type if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'required_skills' 
    AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE events 
    ALTER COLUMN required_skills TYPE TEXT USING required_skills::TEXT;
  END IF;
END$$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);

COMMIT; 