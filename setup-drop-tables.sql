-- SQL script to drop all existing tables and recreate them
-- Run this in the Supabase SQL Editor

-- Drop existing tables with CASCADE to handle dependencies
DROP TABLE IF EXISTS public.room_events CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.room_participants CASCADE; -- Note: This seems to be the actual table name in your DB
DROP TABLE IF EXISTS public.participants CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;

-- Now you can run the create table scripts from SUPABASE_SETUP.md 