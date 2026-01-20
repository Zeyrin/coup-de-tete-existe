import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { ArchetypeId } from '@/types/database';

// GET user preferences
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

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
  } catch (error) {
    console.error('Preferences GET error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST/PUT user preferences
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

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
  } catch (error) {
    console.error('Preferences POST error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
