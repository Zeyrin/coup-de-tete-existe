import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import destinations from '@/app/destinations.json';

interface Destination {
  city: string;
  tagline: string;
  station: string;
  departure: 'paris' | 'nice';
  activities: string[];
  travel_time: string;
  travel_time_minutes: number;
  typical_price: string;
  typical_price_euros: number;
  vibe: string;
  images?: Array<{ url: string; alt: string }>;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Get filter params
    const departureCity = searchParams.get('departure') || 'paris';
    const maxTravelTime = parseInt(searchParams.get('max_time') || '120');
    const maxBudget = parseInt(searchParams.get('max_budget') || '30');

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Filter base destinations
    let filteredDestinations = (destinations as Destination[]).filter(
      (d) =>
        d.departure === departureCity &&
        d.travel_time_minutes <= maxTravelTime &&
        d.typical_price_euros <= maxBudget
    );

    // If user is authenticated, check for premium and archetype
    if (user) {
      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .single();

      // Get user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('archetype_id')
        .eq('user_id', user.id)
        .single();

      const isPremium = userData?.subscription_tier === 'premium';
      const archetypeId = preferences?.archetype_id;

      // If premium and has archetype, personalize destinations
      if (isPremium && archetypeId) {
        // Get archetype-destination mappings
        const { data: mappings } = await supabase
          .from('destination_archetypes')
          .select('destination_city, relevance_score')
          .eq('archetype_id', archetypeId);

        if (mappings && mappings.length > 0) {
          // Create a map for quick lookup
          const relevanceMap = new Map(
            mappings.map((m) => [m.destination_city, m.relevance_score])
          );

          // Filter to only destinations that match the archetype
          const personalizedDestinations = filteredDestinations
            .filter((d) => relevanceMap.has(d.city))
            .map((d) => ({
              ...d,
              relevance_score: relevanceMap.get(d.city) || 0,
            }))
            .sort((a, b) => b.relevance_score - a.relevance_score);

          // If we have personalized destinations, use them
          // Otherwise fall back to all filtered destinations
          if (personalizedDestinations.length > 0) {
            return NextResponse.json({
              destinations: personalizedDestinations,
              personalized: true,
              archetype_id: archetypeId,
              total: personalizedDestinations.length,
            });
          }
        }
      }

      return NextResponse.json({
        destinations: filteredDestinations.map((d) => ({
          ...d,
          relevance_score: 50, // Default score for non-personalized
        })),
        personalized: false,
        archetype_id: archetypeId || null,
        is_premium: isPremium,
        total: filteredDestinations.length,
      });
    }

    // Non-authenticated user - return basic filtered list
    return NextResponse.json({
      destinations: filteredDestinations.map((d) => ({
        ...d,
        relevance_score: 50,
      })),
      personalized: false,
      archetype_id: null,
      is_premium: false,
      total: filteredDestinations.length,
    });
  } catch (error) {
    console.error('Personalized destinations error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des destinations' },
      { status: 500 }
    );
  }
}
