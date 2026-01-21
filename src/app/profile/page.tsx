import { getUser } from '@/app/actions/auth';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileClient } from './ProfileClient';
import type { User as DBUser, Archetype, UserPreferences } from '@/types/database';

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();

  // Fetch user data
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch user preferences with archetype
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select(`
      *,
      archetype:archetypes(*)
    `)
    .eq('user_id', user.id)
    .single();

  // Fetch all archetypes
  const { data: archetypes } = await supabase
    .from('archetypes')
    .select('*')
    .order('name_fr', { ascending: true });

  return (
    <ProfileClient
      user={user}
      userData={userData as DBUser | null}
      preferences={preferences as (UserPreferences & { archetype: Archetype | null }) | null}
      archetypes={archetypes as Archetype[] || []}
    />
  );
}
