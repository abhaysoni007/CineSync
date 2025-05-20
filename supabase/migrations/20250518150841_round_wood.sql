/*
  # Create movie_files table

  1. New Tables
    - `movie_files`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `drive_file_id` (text)
      - `name` (text)
      - `url` (text)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on `movie_files` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS movie_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  drive_file_id text NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE movie_files ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own files
CREATE POLICY "Users can insert their own files"
  ON movie_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own files
CREATE POLICY "Users can read their own files"
  ON movie_files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
  ON movie_files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);