# Supabase Setup for CineSync

This document provides instructions on how to set up your Supabase database for the CineSync application.

## Database Setup

1. Log in to your Supabase dashboard at https://supabase.com/dashboard/project/uxxlqpucnkhovnppsuod

2. Navigate to the SQL Editor in the left sidebar

3. Create a new SQL query and paste the following:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  movie_url TEXT,
  drive_file_id TEXT,
  is_private BOOLEAN DEFAULT false,
  host_id UUID NOT NULL,
  host_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add constraints
  CONSTRAINT valid_room_code CHECK (LENGTH(code) = 6 AND code ~ '^[A-Z0-9]+$')
);

-- Create participants table to track who is in each room
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  is_host BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add constraints
  UNIQUE(room_id, user_id)
);

-- Create messages table for room chat
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room_events table to track events like play/pause
CREATE TABLE IF NOT EXISTS public.room_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name VARCHAR(100),
  event_type VARCHAR(20) NOT NULL, -- 'play', 'pause', 'seek', 'sync'
  event_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS rooms_code_idx ON public.rooms(code);
CREATE INDEX IF NOT EXISTS participants_room_id_idx ON public.participants(room_id);
CREATE INDEX IF NOT EXISTS messages_room_id_idx ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS room_events_room_id_idx ON public.room_events(room_id);

-- Row Level Security (RLS) policies
-- For now, we'll allow all operations since we're using the public API key
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to rooms" ON public.rooms FOR ALL USING (true);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to participants" ON public.participants FOR ALL USING (true);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to messages" ON public.messages FOR ALL USING (true);

ALTER TABLE public.room_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to room_events" ON public.room_events FOR ALL USING (true);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_events;
```

4. Click "Run" to execute the SQL and create all necessary tables.

5. Verify the tables were created by checking the "Table Editor" in the left sidebar.

## Enable Real-Time Feature

To ensure real-time functionality works properly:

1. Go to "Database" → "Replication" in the left sidebar
2. Make sure that "Realtime" is enabled
3. Verify that the tables (rooms, participants, messages, room_events) are included in the publication

## Test the Application

Once the database setup is complete:

1. Run the application locally
2. Create a test room and verify that it appears in the Supabase database
3. Join the room from another browser to test cross-device functionality

## Database Structure

The CineSync application uses the following tables:

- **rooms**: Stores information about movie rooms
- **participants**: Tracks users in each room
- **messages**: Stores chat messages
- **room_events**: Tracks player events like play/pause/seek for synchronization

Each table has appropriate relationships and constraints to maintain data integrity. 