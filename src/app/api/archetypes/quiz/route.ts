import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { calculateArchetypeFromAnswers, ARCHETYPES } from '@/data/archetypes';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { answers } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Réponses au quiz requises' },
        { status: 400 }
      );
    }

    // Calculate archetype from answers
    const result = calculateArchetypeFromAnswers(answers);
    const archetype = ARCHETYPES[result.archetypeId];

    // Get authenticated user or guest
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Save preferences if user is authenticated
    if (user) {
      console.log('Saving preferences for user:', user.id, 'archetype:', result.archetypeId);

      const { data: upsertData, error: upsertError } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: user.id,
            archetype_id: result.archetypeId,
            quiz_completed: true,
            quiz_answers: answers,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        )
        .select();

      if (upsertError) {
        console.error('Error saving preferences:', upsertError);
      } else {
        console.log('Preferences saved successfully:', upsertData);
      }
    } else {
      console.log('No authenticated user found for quiz submission');
    }

    return NextResponse.json({
      archetype_id: result.archetypeId,
      archetype: {
        ...archetype,
        created_at: new Date().toISOString(),
      },
      confidence: result.confidence,
      scores: result.scores,
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du quiz' },
      { status: 500 }
    );
  }
}
