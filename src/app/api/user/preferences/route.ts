import { NextResponse } from 'next/server';
import { withAuth, withAuthGet } from '@/utils/api/withAuth';
import type { ArchetypeId } from '@/types/database';

// GET user preferences
export const GET = withAuthGet(async ({ user, supabase }) => {
  // Get user preferences with archetype details
  const { data: preferences, error } = await supabase
    .from('user_preferences')
    .select(`
      *,
      archetype:archetypes(*)
    `)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des préférences' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    preferences: preferences || null,
  });
});

// POST/PUT user preferences
export const POST = withAuth(async ({ user, supabase, request }) => {
  const body = await request.json();
  const { archetype_id } = body as { archetype_id: ArchetypeId };

  if (!archetype_id) {
    return NextResponse.json(
      { error: 'archetype_id requis' },
      { status: 400 }
    );
  }

  // Validate archetype exists
  const { data: archetype, error: archetypeError } = await supabase
    .from('archetypes')
    .select('id')
    .eq('id', archetype_id)
    .single();

  if (archetypeError || !archetype) {
    return NextResponse.json(
      { error: 'Archétype invalide' },
      { status: 400 }
    );
  }

  // Upsert preferences
  const { data: preferences, error: upsertError } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: user.id,
        archetype_id,
        quiz_completed: false, // Manual selection, not quiz
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )
    .select(`
      *,
      archetype:archetypes(*)
    `)
    .single();

  if (upsertError) {
    console.error('Error saving preferences:', upsertError);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des préférences' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    preferences,
    message: 'Préférences mises à jour avec succès',
  });
});
