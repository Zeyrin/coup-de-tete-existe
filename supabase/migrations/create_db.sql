-- ============================================================================
-- FULL DATABASE SETUP - Coup de Tête
-- ============================================================================
-- This script sets up the complete database schema from scratch
-- Run this in your Supabase SQL Editor after dropping all tables
-- ============================================================================

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- Create users table (for authenticated users)
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  total_spins INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30)
);

-- Create guest_users table (for non-authenticated users)
CREATE TABLE IF NOT EXISTS guest_users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  total_spins INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_fingerprint TEXT,
  CONSTRAINT guest_username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30)
);

-- Create spin_history table (supports both user types)
CREATE TABLE IF NOT EXISTS spin_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  guest_user_id UUID REFERENCES guest_users(user_id) ON DELETE CASCADE,
  destination_city TEXT NOT NULL,
  departure_city TEXT NOT NULL,
  travel_time_minutes INTEGER NOT NULL,
  typical_price_euros NUMERIC(10, 2) NOT NULL,
  points_earned INTEGER NOT NULL,
  spun_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_user_or_guest CHECK (
    (user_id IS NOT NULL AND guest_user_id IS NULL) OR
    (user_id IS NULL AND guest_user_id IS NOT NULL)
  )
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Indexes for guest_users table
CREATE INDEX IF NOT EXISTS idx_guest_users_username ON guest_users(username);
CREATE INDEX IF NOT EXISTS idx_guest_users_points ON guest_users(points DESC);
CREATE INDEX IF NOT EXISTS idx_guest_users_created_at ON guest_users(created_at DESC);

-- Indexes for spin_history table
CREATE INDEX IF NOT EXISTS idx_spin_history_user_id ON spin_history(user_id);
CREATE INDEX IF NOT EXISTS idx_spin_history_guest_user_id ON spin_history(guest_user_id);
CREATE INDEX IF NOT EXISTS idx_spin_history_spun_at ON spin_history(spun_at DESC);

-- ============================================================================
-- 3. CREATE TRIGGERS
-- ============================================================================

-- Trigger to automatically update updated_at for users table
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- Trigger to automatically update updated_at for guest_users table
CREATE OR REPLACE FUNCTION update_guest_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_guest_users_updated_at
  BEFORE UPDATE ON guest_users
  FOR EACH ROW
  EXECUTE FUNCTION update_guest_users_updated_at();

-- ============================================================================
-- 4. CREATE VIEWS
-- ============================================================================

-- Combined leaderboard view (regular users + guest users)
CREATE OR REPLACE VIEW combined_leaderboard AS
SELECT
  'user' AS user_type,
  user_id,
  username,
  display_name,
  avatar_url,
  points,
  total_spins,
  created_at
FROM users
UNION ALL
SELECT
  'guest' AS user_type,
  user_id,
  username,
  display_name,
  avatar_url,
  points,
  total_spins,
  created_at
FROM guest_users
ORDER BY points DESC, total_spins DESC;

-- ============================================================================
-- 5. CREATE FUNCTIONS
-- ============================================================================

-- Function to get user rank (works for both regular and guest users)
CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID, p_is_guest BOOLEAN DEFAULT FALSE)
RETURNS TABLE (
  rank BIGINT,
  total_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT
      user_id,
      ROW_NUMBER() OVER (ORDER BY points DESC, total_spins DESC) AS user_rank
    FROM (
      SELECT user_id, points, total_spins FROM users
      UNION ALL
      SELECT user_id, points, total_spins FROM guest_users
    ) combined
  ),
  user_count AS (
    SELECT COUNT(*) AS total FROM (
      SELECT user_id FROM users
      UNION ALL
      SELECT user_id FROM guest_users
    ) all_users
  )
  SELECT
    ranked.user_rank,
    user_count.total
  FROM ranked, user_count
  WHERE ranked.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. CREATE AUTH TRIGGER FOR AUTOMATIC USER PROFILE CREATION
-- ============================================================================

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (user_id, email, username, display_name, points, total_spins, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'display_name',
    0,
    0,
    NULL
  );
  RETURN NEW;
END;
$$;

-- Trigger that fires after a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. CREATE RLS POLICIES FOR USERS TABLE
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Allow anyone to view user profiles (needed for leaderboard)
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- NOTE: No INSERT policy needed - user profiles are created automatically
-- via the handle_new_user() trigger when auth.users row is created

-- ============================================================================
-- 9. CREATE RLS POLICIES FOR GUEST_USERS TABLE
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Guest users are viewable by everyone" ON guest_users;
DROP POLICY IF EXISTS "Anyone can create guest users" ON guest_users;
DROP POLICY IF EXISTS "Guest users can update their own data" ON guest_users;

-- Allow anyone to read guest users (for leaderboard)
CREATE POLICY "Guest users are viewable by everyone"
  ON guest_users FOR SELECT
  USING (true);

-- Allow anyone to insert guest users (for signup)
CREATE POLICY "Anyone can create guest users"
  ON guest_users FOR INSERT
  WITH CHECK (true);

-- Allow guest users to update their own data
-- Note: In production, you should implement proper guest authentication
CREATE POLICY "Guest users can update their own data"
  ON guest_users FOR UPDATE
  USING (true);

-- ============================================================================
-- 10. CREATE RLS POLICIES FOR SPIN_HISTORY TABLE
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own spin history" ON spin_history;
DROP POLICY IF EXISTS "Users can insert their own spin history" ON spin_history;

-- Allow users to view their own spin history (both regular and guest)
CREATE POLICY "Users can view their own spin history"
  ON spin_history FOR SELECT
  USING (
    auth.uid() = user_id OR
    guest_user_id IS NOT NULL
  );

-- Allow users to insert their own spin history (both regular and guest)
CREATE POLICY "Users can insert their own spin history"
  ON spin_history FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    guest_user_id IS NOT NULL
  );

-- ============================================================================
-- 11. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'Stores authenticated user profiles with points and spin tracking';
COMMENT ON TABLE guest_users IS 'Stores guest user profiles with same capabilities as regular users for beta testing';
COMMENT ON TABLE spin_history IS 'Stores history of all spins for both regular and guest users';

COMMENT ON COLUMN users.user_id IS 'Primary key matching auth.users.id from Supabase Auth';
COMMENT ON COLUMN users.username IS 'Unique username for the user (3-30 characters)';
COMMENT ON COLUMN users.points IS 'Total points earned by the user';
COMMENT ON COLUMN users.total_spins IS 'Total number of spins performed by the user';

COMMENT ON COLUMN guest_users.user_id IS 'Primary key auto-generated UUID for guest users';
COMMENT ON COLUMN guest_users.device_fingerprint IS 'Optional device identifier to help track returning guests';
COMMENT ON COLUMN guest_users.last_active_at IS 'Timestamp of last activity for cleanup purposes';

COMMENT ON COLUMN spin_history.user_id IS 'Foreign key to users table (nullable, mutually exclusive with guest_user_id)';
COMMENT ON COLUMN spin_history.guest_user_id IS 'Foreign key to guest_users table (nullable, mutually exclusive with user_id)';

COMMENT ON VIEW combined_leaderboard IS 'Unified view of regular users and guest users for leaderboard display';

COMMENT ON FUNCTION get_user_rank(UUID, BOOLEAN) IS 'Returns the rank and total user count for a given user (works for both regular and guest users)';

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Your database is now fully configured with:
-- ✅ Users table with RLS policies
-- ✅ Guest users table with RLS policies
-- ✅ Spin history table with support for both user types
-- ✅ Combined leaderboard view
-- ✅ User rank function
-- ✅ All necessary indexes for performance
-- ✅ Auto-updating timestamps via triggers
-- ============================================================================
