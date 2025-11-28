'use server'

import { createClient } from '@/utils/supabase/server'
import type { GuestUser } from '@/types/database'

export async function createGuestUser(username: string, deviceFingerprint?: string) {
  const supabase = await createClient()

  // Check if username is already taken
  const { data: existingGuest } = await supabase
    .from('guest_users')
    .select('user_id')
    .eq('username', username)
    .single()

  if (existingGuest) {
    return { error: 'Ce pseudo est déjà pris' }
  }

  // Check if username exists in regular users table too
  const { data: existingUser } = await supabase
    .from('users')
    .select('user_id')
    .eq('username', username)
    .single()

  if (existingUser) {
    return { error: 'Ce pseudo est déjà pris' }
  }

  // Create guest user
  const { data: guestUser, error } = await supabase
    .from('guest_users')
    .insert({
      username,
      device_fingerprint: deviceFingerprint || null,
      points: 0,
      total_spins: 0,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: guestUser as GuestUser }
}

export async function getGuestUser(guestId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('guest_users')
    .select('*')
    .eq('user_id', guestId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: data as GuestUser }
}

export async function updateGuestUserActivity(guestId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('guest_users')
    .update({ last_active_at: new Date().toISOString() })
    .eq('user_id', guestId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updateGuestUserPoints(guestId: string, pointsToAdd: number) {
  const supabase = await createClient()

  // Get current points
  const { data: currentData, error: fetchError } = await supabase
    .from('guest_users')
    .select('points, total_spins')
    .eq('user_id', guestId)
    .single()

  if (fetchError) {
    return { error: fetchError.message }
  }

  // Update points and spins
  const { error: updateError } = await supabase
    .from('guest_users')
    .update({
      points: (currentData.points || 0) + pointsToAdd,
      total_spins: (currentData.total_spins || 0) + 1,
      last_active_at: new Date().toISOString(),
    })
    .eq('user_id', guestId)

  if (updateError) {
    return { error: updateError.message }
  }

  return { success: true }
}

export async function getGuestUserRank(guestId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('get_user_rank', {
      p_user_id: guestId,
      p_is_guest: true,
    })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function convertGuestToUser(
  guestId: string,
  email: string,
  password: string
) {
  const supabase = await createClient()

  // Get guest user data
  const { data: guestData, error: guestError } = await supabase
    .from('guest_users')
    .select('*')
    .eq('user_id', guestId)
    .single()

  if (guestError || !guestData) {
    return { error: 'Utilisateur invité non trouvé' }
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Échec de la création du compte' }
  }

  // Create user record with guest data
  const { error: userError } = await supabase.from('users').insert({
    user_id: authData.user.id,
    email: email,
    username: guestData.username,
    display_name: guestData.display_name,
    points: guestData.points,
    total_spins: guestData.total_spins,
    avatar_url: guestData.avatar_url,
  })

  if (userError) {
    return { error: `Compte créé mais profil échoué: ${userError.message}` }
  }

  // Transfer spin history from guest to user
  const { error: transferError } = await supabase
    .from('spin_history')
    .update({ user_id: authData.user.id, guest_user_id: null })
    .eq('guest_user_id', guestId)

  if (transferError) {
    console.error('Error transferring spin history:', transferError)
  }

  // Delete guest user (cascade will handle related data)
  const { error: deleteError } = await supabase
    .from('guest_users')
    .delete()
    .eq('user_id', guestId)

  if (deleteError) {
    console.error('Error deleting guest user:', deleteError)
  }

  return { success: true }
}
