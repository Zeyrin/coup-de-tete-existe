-- ============================================================================
-- ARCHETYPE AND SUBSCRIPTION SCHEMA
-- Migration: 20260117_add_archetypes_subscriptions.sql
-- ============================================================================

-- 0. Create generic updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Create archetypes reference table
CREATE TABLE IF NOT EXISTS archetypes (
  id TEXT PRIMARY KEY,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  description_en TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert the 5 archetypes
INSERT INTO archetypes (id, name_fr, name_en, description_fr, description_en, icon, color) VALUES
  ('royal_elegance', 'L''Aristocrate', 'The Aristocrat', 'Amoureux des palais, du luxe et des expériences raffinées', 'Loves palaces, luxury, and refined experiences', '👑', '#FFD700'),
  ('culture_seeker', 'L''Artiste', 'The Artist', 'Attiré par l''art, les musées et le patrimoine culturel', 'Drawn to art, museums, and cultural heritage', '🎨', '#9B59B6'),
  ('nature_adventurer', 'L''Explorateur', 'The Explorer', 'Cherche l''aventure, la randonnée et les grands espaces', 'Seeks outdoor adventures, hiking, and landscapes', '🏔️', '#27AE60'),
  ('gastronome', 'Le Gourmet', 'The Foodie', 'Vit pour la gastronomie, les vins et les expériences culinaires', 'Lives for food, wine, and culinary experiences', '🍷', '#E74C3C'),
  ('beach_relaxer', 'Le Rêveur', 'The Dreamer', 'Recherche les plages, l''ambiance méditerranéenne et la détente', 'Craves beaches, Mediterranean vibes, and relaxation', '🏖️', '#3498DB')
ON CONFLICT (id) DO NOTHING;

-- 2. Create destination-to-archetype mapping table
CREATE TABLE IF NOT EXISTS destination_archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_city TEXT NOT NULL,
  archetype_id TEXT NOT NULL REFERENCES archetypes(id) ON DELETE CASCADE,
  relevance_score INTEGER NOT NULL DEFAULT 100 CHECK (relevance_score >= 0 AND relevance_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(destination_city, archetype_id)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_destination_archetypes_archetype ON destination_archetypes(archetype_id);
CREATE INDEX IF NOT EXISTS idx_destination_archetypes_city ON destination_archetypes(destination_city);
CREATE INDEX IF NOT EXISTS idx_destination_archetypes_score ON destination_archetypes(relevance_score DESC);

-- 3. Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  guest_user_id UUID REFERENCES guest_users(user_id) ON DELETE CASCADE,
  archetype_id TEXT REFERENCES archetypes(id) ON DELETE SET NULL,
  quiz_completed BOOLEAN NOT NULL DEFAULT FALSE,
  quiz_answers JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_user_preference_owner CHECK (
    (user_id IS NOT NULL AND guest_user_id IS NULL) OR
    (user_id IS NULL AND guest_user_id IS NOT NULL)
  ),
  UNIQUE(user_id),
  UNIQUE(guest_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_guest ON user_preferences(guest_user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_archetype ON user_preferences(archetype_id);

-- Trigger to update updated_at
CREATE TRIGGER trigger_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 4. Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'inactive')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Trigger to update updated_at
CREATE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 5. Add subscription_tier to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium'));

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Archetypes: Public read access
ALTER TABLE archetypes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Archetypes are viewable by everyone" ON archetypes;
CREATE POLICY "Archetypes are viewable by everyone" ON archetypes FOR SELECT USING (true);

-- Destination archetypes: Public read access
ALTER TABLE destination_archetypes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Destination archetypes are viewable by everyone" ON destination_archetypes;
CREATE POLICY "Destination archetypes are viewable by everyone" ON destination_archetypes FOR SELECT USING (true);

-- User preferences: Users can only access their own
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;

CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id OR guest_user_id IS NOT NULL);
CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id OR guest_user_id IS NOT NULL);
CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id OR guest_user_id IS NOT NULL);

-- Subscriptions: Users can only view their own
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has premium subscription
CREATE OR REPLACE FUNCTION is_user_premium(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's archetype
CREATE OR REPLACE FUNCTION get_user_archetype(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_archetype_id TEXT;
BEGIN
  SELECT archetype_id INTO v_archetype_id
  FROM user_preferences
  WHERE user_id = p_user_id;

  RETURN v_archetype_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DESTINATION-ARCHETYPE MAPPINGS
-- ============================================================================

-- Paris departures
INSERT INTO destination_archetypes (destination_city, archetype_id, relevance_score) VALUES
  -- Versailles
  ('Versailles', 'royal_elegance', 100),
  ('Versailles', 'culture_seeker', 70),
  -- Chantilly
  ('Chantilly', 'royal_elegance', 90),
  ('Chantilly', 'nature_adventurer', 50),
  -- Fontainebleau
  ('Fontainebleau', 'nature_adventurer', 90),
  ('Fontainebleau', 'royal_elegance', 60),
  ('Fontainebleau', 'culture_seeker', 50),
  -- Auvers-sur-Oise
  ('Auvers-sur-Oise', 'culture_seeker', 100),
  -- Chartres
  ('Chartres', 'culture_seeker', 90),
  ('Chartres', 'royal_elegance', 40),
  -- Reims
  ('Reims', 'gastronome', 100),
  ('Reims', 'culture_seeker', 70),
  ('Reims', 'royal_elegance', 50),
  -- Rouen
  ('Rouen', 'culture_seeker', 90),
  -- Provins
  ('Provins', 'culture_seeker', 80),
  ('Provins', 'royal_elegance', 60),
  -- Compiègne
  ('Compiègne', 'nature_adventurer', 70),
  ('Compiègne', 'royal_elegance', 60),
  ('Compiègne', 'culture_seeker', 50),
  -- Amiens
  ('Amiens', 'culture_seeker', 80),
  ('Amiens', 'nature_adventurer', 50),
  -- Giverny
  ('Giverny', 'culture_seeker', 100),
  ('Giverny', 'nature_adventurer', 60),
  -- Senlis
  ('Senlis', 'culture_seeker', 80),
  ('Senlis', 'royal_elegance', 50),
  -- Meaux
  ('Meaux', 'gastronome', 90),
  ('Meaux', 'culture_seeker', 50),
  -- Moret-sur-Loing
  ('Moret-sur-Loing', 'culture_seeker', 90),
  ('Moret-sur-Loing', 'gastronome', 50),
  -- Maintenon
  ('Maintenon', 'royal_elegance', 80),
  ('Maintenon', 'culture_seeker', 60),
  -- Lyon
  ('Lyon', 'gastronome', 100),
  ('Lyon', 'culture_seeker', 70),
  -- Bordeaux
  ('Bordeaux', 'gastronome', 100),
  ('Bordeaux', 'culture_seeker', 60),
  -- Dijon
  ('Dijon', 'gastronome', 100),
  ('Dijon', 'culture_seeker', 60),
  -- Strasbourg
  ('Strasbourg', 'gastronome', 80),
  ('Strasbourg', 'culture_seeker', 80),
  -- Tours
  ('Tours', 'royal_elegance', 90),
  ('Tours', 'gastronome', 70),
  ('Tours', 'culture_seeker', 60),
  -- Metz
  ('Metz', 'culture_seeker', 90),
  -- Avignon
  ('Avignon', 'culture_seeker', 90),
  ('Avignon', 'royal_elegance', 50),
  -- Arles
  ('Arles', 'culture_seeker', 100),
  -- Aix-en-Provence
  ('Aix-en-Provence', 'culture_seeker', 80),
  ('Aix-en-Provence', 'gastronome', 70),
  ('Aix-en-Provence', 'nature_adventurer', 50),
  -- Nice
  ('Nice', 'beach_relaxer', 100),
  ('Nice', 'gastronome', 60),
  -- Marseille
  ('Marseille', 'beach_relaxer', 80),
  ('Marseille', 'nature_adventurer', 70),
  ('Marseille', 'gastronome', 60),
  -- La Rochelle
  ('La Rochelle', 'beach_relaxer', 80),
  ('La Rochelle', 'nature_adventurer', 60),
  -- Saint-Malo
  ('Saint-Malo', 'beach_relaxer', 70),
  ('Saint-Malo', 'culture_seeker', 70),
  -- Biarritz
  ('Biarritz', 'beach_relaxer', 100),
  ('Biarritz', 'nature_adventurer', 60),
  ('Biarritz', 'gastronome', 50),
  -- Montpellier
  ('Montpellier', 'beach_relaxer', 80),
  ('Montpellier', 'culture_seeker', 50),
  -- Annecy
  ('Annecy', 'nature_adventurer', 100),
  ('Annecy', 'beach_relaxer', 60),
  -- Chambéry
  ('Chambéry', 'nature_adventurer', 90),
  -- Aix-les-Bains
  ('Aix-les-Bains', 'beach_relaxer', 80),
  ('Aix-les-Bains', 'nature_adventurer', 60),
  -- Toulouse
  ('Toulouse', 'gastronome', 80),
  ('Toulouse', 'culture_seeker', 60),
  -- Nantes
  ('Nantes', 'culture_seeker', 70),
  ('Nantes', 'nature_adventurer', 50),
  -- Rennes
  ('Rennes', 'culture_seeker', 70)
ON CONFLICT (destination_city, archetype_id) DO NOTHING;

-- Nice departures
INSERT INTO destination_archetypes (destination_city, archetype_id, relevance_score) VALUES
  -- Monaco
  ('Monaco', 'royal_elegance', 100),
  ('Monaco', 'beach_relaxer', 60),
  -- Antibes
  ('Antibes', 'culture_seeker', 80),
  ('Antibes', 'beach_relaxer', 70),
  -- Cannes
  ('Cannes', 'royal_elegance', 80),
  ('Cannes', 'beach_relaxer', 90),
  -- Menton
  ('Menton', 'nature_adventurer', 70),
  ('Menton', 'beach_relaxer', 70),
  ('Menton', 'gastronome', 60),
  -- Villefranche-sur-Mer
  ('Villefranche-sur-Mer', 'beach_relaxer', 100),
  -- Èze-sur-Mer
  ('Èze-sur-Mer', 'beach_relaxer', 90),
  -- Grasse
  ('Grasse', 'culture_seeker', 70),
  ('Grasse', 'gastronome', 50),
  -- Ventimiglia (Italie)
  ('Ventimiglia (Italie)', 'gastronome', 80),
  ('Ventimiglia (Italie)', 'culture_seeker', 50),
  -- Beaulieu-sur-Mer
  ('Beaulieu-sur-Mer', 'culture_seeker', 70),
  ('Beaulieu-sur-Mer', 'beach_relaxer', 80),
  -- Juan-les-Pins
  ('Juan-les-Pins', 'beach_relaxer', 100),
  -- Cagnes-sur-Mer
  ('Cagnes-sur-Mer', 'culture_seeker', 60),
  ('Cagnes-sur-Mer', 'beach_relaxer', 70),
  -- Saint-Raphaël
  ('Saint-Raphaël', 'nature_adventurer', 80),
  ('Saint-Raphaël', 'beach_relaxer', 70),
  -- Toulon
  ('Toulon', 'nature_adventurer', 60),
  ('Toulon', 'beach_relaxer', 50),
  -- Sanremo (Italie)
  ('Sanremo (Italie)', 'beach_relaxer', 80),
  ('Sanremo (Italie)', 'gastronome', 70),
  -- Théoule-sur-Mer
  ('Théoule-sur-Mer', 'nature_adventurer', 90),
  ('Théoule-sur-Mer', 'beach_relaxer', 80)
ON CONFLICT (destination_city, archetype_id) DO NOTHING;
