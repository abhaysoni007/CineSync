-- Create tables for CineSync application

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "auth.enable_row_level_security" = true;

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