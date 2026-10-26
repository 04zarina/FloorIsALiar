-- ==============================================================================
-- Migration: 001_init.sql
-- Project: FloorIsALiar
-- Description: Initial schema for profiles and game_sessions with RLS and signup trigger.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- Stores user public profile data linked directly to Supabase Auth (auth.users).
-- Credentials/passwords are strictly managed by Supabase Auth.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  
  -- Constraint: display_name must be between 3 and 20 characters
  CONSTRAINT display_name_length_check CHECK (char_length(display_name) >= 3 AND char_length(display_name) <= 20)
);

-- ------------------------------------------------------------------------------
-- 2. GAME_SESSIONS TABLE
-- Stores individual game playthrough statistics for FloorIsALiar.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  hits INTEGER NOT NULL DEFAULT 0,
  misses INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  avg_reaction_ms NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  duration_seconds NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- CHECK constraints to prevent negative values and constrain accuracy
  CONSTRAINT score_non_negative CHECK (score >= 0),
  CONSTRAINT hits_non_negative CHECK (hits >= 0),
  CONSTRAINT misses_non_negative CHECK (misses >= 0),
  CONSTRAINT accuracy_range_check CHECK (accuracy >= 0.00 AND accuracy <= 100.00),
  CONSTRAINT avg_reaction_ms_non_negative CHECK (avg_reaction_ms >= 0.00),
  CONSTRAINT duration_seconds_non_negative CHECK (duration_seconds >= 0.00)
);

-- Indexes for performance (frequently filtered by user and sorted by time)
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON public.game_sessions(created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables to ensure strict data isolation between users.
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 4. POLICIES: PROFILES
-- ------------------------------------------------------------------------------

-- Policy: Allow users to view only their own profile.
-- Ensures a user cannot read profile information belonging to another user.
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Policy: Allow users to insert only their own profile.
-- Ensures that when creating a profile manually or via client, the ID matches the authenticated user.
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- Policy: Allow users to update only their own profile.
-- Ensures users can modify only their own profile data (e.g. updating display_name).
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- ------------------------------------------------------------------------------
-- 5. POLICIES: GAME_SESSIONS
-- ------------------------------------------------------------------------------

-- Policy: Allow users to view only their own game sessions.
-- Restricts game session history and stats visibility strictly to the session owner.
CREATE POLICY "Users can view their own game sessions"
  ON public.game_sessions
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Policy: Allow users to insert only their own game sessions.
-- Ensures that when recording a new game session, user_id matches the authenticated user's ID.
CREATE POLICY "Users can insert their own game sessions"
  ON public.game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- NOTE ON UPDATE & DELETE FOR game_sessions:
-- Per security requirements, NO update or delete policies are defined for game_sessions.
-- Because Row Level Security is enabled, any attempt by a user to update or delete rows
-- in game_sessions will be automatically rejected.

-- ------------------------------------------------------------------------------
-- 6. AUTOMATIC PROFILE CREATION TRIGGER
-- Automatically creates a corresponding row in public.profiles when a user signs up.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  raw_name TEXT;
  clean_name TEXT;
BEGIN
  -- Extract display name from metadata, or fallback to email username or 'Player'
  raw_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'user_name',
    NULLIF(SPLIT_PART(NEW.email, '@', 1), ''),
    'Player'
  );

  -- Sanitize: trim whitespace and limit to max 20 chars
  clean_name := SUBSTRING(TRIM(raw_name) FROM 1 FOR 20);

  -- Ensure the name satisfies the 3-20 character length constraint
  IF CHAR_LENGTH(clean_name) < 3 THEN
    clean_name := 'Player_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', '') FROM 1 FOR 5);
  END IF;

  -- Insert new profile record for the newly registered user
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, clean_name);

  RETURN NEW;
END;
$$;

-- Drop existing trigger if already defined to maintain idempotency
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger execution after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
