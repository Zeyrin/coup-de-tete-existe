export interface User {
  user_id: string;
  email: string;
  username: string;
  display_name: string | null;
  points: number;
  total_spins: number;
  avatar_url: string | null;
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