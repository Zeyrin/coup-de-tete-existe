import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get all archetypes
    const { data: archetypes, error } = await supabase
      .from('archetypes')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching archetypes:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des archétypes' },
        { status: 500 }
      );
    }

    // Get destination counts per archetype
    const { data: counts, error: countError } = await supabase
      .from('destination_archetypes')
      .select('archetype_id')
      .then(({ data, error }) => {
        if (error) return { data: null, error };

        // Count destinations per archetype
        const countMap: Record<string, number> = {};
        data?.forEach((row) => {
          countMap[row.archetype_id] = (countMap[row.archetype_id] || 0) + 1;
        });
        return { data: countMap, error: null };
      });

    if (countError) {
      console.error('Error fetching destination counts:', countError);
    }

    // Combine archetypes with counts
    const archetypesWithCounts = archetypes?.map((archetype) => ({
      ...archetype,
      destination_count: counts?.[archetype.id] || 0,
    }));

    return NextResponse.json({ archetypes: archetypesWithCounts });
  } catch (error) {
    console.error('Archetypes API error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
