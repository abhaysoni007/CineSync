/*
  Add driveFileId column to rooms table to support Google Drive integration
*/

-- Add driveFileId column to the rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS drive_file_id TEXT;

-- The existing room_code may be generated using the Google Drive file ID
COMMENT ON COLUMN rooms.drive_file_id IS 'The Google Drive file ID for the room''s movie.'; 