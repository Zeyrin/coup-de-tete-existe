import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const {
      destination_city,
      departure_city,
      travel_time_minutes,
      typical_price_euros,
      is_guest,
      guest_user_id
    } = body

    // Validate required fields
    if (!destination_city || !departure_city || !travel_time_minutes || !typical_price_euros) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate points based on travel time and price
    const points_earned = Math.floor(travel_time_minutes / 10) + Math.floor(typical_price_euros)

    let userId = null
    let guestUserId = null

    if (is_guest && guest_user_id) {
      // Guest user
      guestUserId = guest_user_id

      // Get current stats first
      const { data: guestData } = await supabase
        .from('guest_users')
        .select('points, total_spins')
        .eq('user_id', guest_user_id)
        .single()

      // Update guest user points and total spins
      const { error: updateError } = await supabase
        .from('guest_users')
        .update({
          points: (guestData?.points || 0) + points_earned,
          total_spins: (guestData?.total_spins || 0) + 1,
          last_active_at: new Date().toISOString(),
        })
        .eq('user_id', guest_user_id)

      if (updateError) {
        console.error('Error updating guest user:', updateError)
        return NextResponse.json(
          { error: 'Failed to update guest user stats' },
          { status: 500 }
        )
      }
    } else {
      // Authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        )
      }

      userId = user.id

      // Get current stats first
      const { data: userData } = await supabase
        .from('users')
        .select('points, total_spins')
        .eq('user_id', user.id)
        .single()

      // Update user points and total spins
      const { error: updateError } = await supabase
        .from('users')
        .update({
          points: (userData?.points || 0) + points_earned,
          total_spins: (userData?.total_spins || 0) + 1,
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating user:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user stats' },
          { status: 500 }
        )
      }
    }

    // Insert spin history
    const { data: spinData, error: spinError } = await supabase
      .from('spin_history')
      .insert({
        user_id: userId,
        guest_user_id: guestUserId,
        destination_city,
        departure_city,
        travel_time_minutes,
        typical_price_euros,
        points_earned,
      })
      .select()
      .single()

    if (spinError) {
      console.error('Error inserting spin history:', spinError)
      return NextResponse.json(
        { error: 'Failed to save spin history' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      points_earned,
      spin: spinData,
    })
  } catch (error) {
    console.error('Error in roll API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
