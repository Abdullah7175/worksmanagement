-- Migration script to update work_requests table
-- This script migrates existing data to use the new creator_id and creator_type fields

-- Step 1: Update existing work_requests to set creator_id and creator_type based on applicant_id
-- First, update records where applicant_id exists in users table
UPDATE work_requests 
SET 
    creator_id = applicant_id,
    creator_type = 'user'
WHERE applicant_id IS NOT NULL 
AND EXISTS (SELECT 1 FROM users WHERE id = applicant_id);

-- Step 2: Update records where applicant_id exists in agents table
UPDATE work_requests 
SET 
    creator_id = applicant_id,
    creator_type = 'agent'
WHERE applicant_id IS NOT NULL 
AND creator_type IS NULL
AND EXISTS (SELECT 1 FROM agents WHERE id = applicant_id);

-- Step 3: Update records where applicant_id exists in socialmediaperson table
UPDATE work_requests 
SET 
    creator_id = applicant_id,
    creator_type = 'socialmedia'
WHERE applicant_id IS NOT NULL 
AND creator_type IS NULL
AND EXISTS (SELECT 1 FROM socialmediaperson WHERE id = applicant_id);

-- Step 4: Set default values for any remaining records
UPDATE work_requests 
SET 
    creator_id = 1, -- Default to first user
    creator_type = 'user'
WHERE creator_id IS NULL OR creator_type IS NULL;

-- Step 5: Add NOT NULL constraints (optional - uncomment if you want to enforce this)
-- ALTER TABLE work_requests ALTER COLUMN creator_id SET NOT NULL;
-- ALTER TABLE work_requests ALTER COLUMN creator_type SET NOT NULL;

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_requests_creator_id ON work_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_work_requests_creator_type ON work_requests(creator_type);

-- Step 7: Verify the migration
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN creator_id IS NOT NULL THEN 1 END) as requests_with_creator_id,
    COUNT(CASE WHEN creator_type IS NOT NULL THEN 1 END) as requests_with_creator_type,
    creator_type,
    COUNT(*) as count_by_type
FROM work_requests 
GROUP BY creator_type
ORDER BY count_by_type DESC;

-- Notifications table for per-user notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(32) NOT NULL, -- 'request', 'image', 'video', 'assignment', etc
    entity_id INTEGER NOT NULL, -- request_id, image_id, video_id, etc
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
