export interface User {
  user_id: string;
  email: string;
  username: string;
  display_name: string | null;
  points: number;
  total_spins: number;
  avatar_url: string | null;
  subscription_tier: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface GuestUser {
  user_id: string;
  username: string;
  display_name: string | null;
  points: number;
  total_spins: number;
  created_at: string;
  updated_at: string;
  last_active_at: string;
  avatar_url: string | null;
  device_fingerprint: string | null;
}

export interface SpinHistory {
  id: string;
  user_id: string | null;
  guest_user_id: string | null;
  destination_city: string;
  departure_city: string;
  travel_time_minutes: number;
  typical_price_euros: number;
  points_earned: number;
  spun_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_type: 'user' | 'guest';
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  points: number;
  total_spins: number;
}

export interface UserStats {
  user_id: string;
  username: string;
  display_name: string | null;
  points: number;
  total_spins: number;
  rank: number;
  recent_spins: Array<{
    destination_city: string;
    departure_city: string;
    spun_at: string;
  }>;
}

// ============================================================================
// ARCHETYPE TYPES
// ============================================================================

export type ArchetypeId =
  | 'royal_elegance'
  | 'culture_seeker'
  | 'nature_adventurer'
  | 'gastronome'
  | 'beach_relaxer';

export interface Archetype {
  id: ArchetypeId;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface DestinationArchetype {
  id: string;
  destination_city: string;
  archetype_id: ArchetypeId;
  relevance_score: number;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string | null;
  guest_user_id: string | null;
  archetype_id: ArchetypeId | null;
  quiz_completed: boolean;
  quiz_answers: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'inactive';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// QUIZ TYPES
// ============================================================================

export interface QuizQuestion {
  id: string;
  question_fr: string;
  question_en: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  label_fr: string;
  label_en: string;
  archetype_scores: Partial<Record<ArchetypeId, number>>;
}

export interface QuizResult {
  archetype_id: ArchetypeId;
  archetype: Archetype;
  confidence: number;
  scores: Record<ArchetypeId, number>;
}