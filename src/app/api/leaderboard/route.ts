import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { LeaderboardEntry } from '@/types/database'

type Period = 'weekly' | 'monthly' | 'all-time'

function getStartDate(period: Period): Date | null {
  const now = new Date()

  switch (period) {
    case 'weekly':
      // Start of current week (Monday)
      const dayOfWeek = now.getDay()
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Adjust for Monday start
      const monday = new Date(now)
      monday.setDate(now.getDate() - diff)
      monday.setHours(0, 0, 0, 0)
      return monday
    case 'monthly':
      // Start of current month
      return new Date(now.getFullYear(), now.getMonth(), 1)
    case 'all-time':
      return null
  }
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  // Pagination params
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')
  const period = (searchParams.get('period') || 'all-time') as Period

  try {
    const startDate = getStartDate(period)

    if (period === 'all-time') {
      // Use existing logic for all-time (total points from user tables)
      return getAllTimeLeaderboard(supabase, limit, offset)
    }

    // For weekly/monthly, aggregate points from spin_history
    const startDateISO = startDate!.toISOString()

    // Get points for registered users in the period
    const { data: userPoints, error: userPointsError } = await supabase
      .from('spin_history')
      .select('user_id, points_earned')
      .not('user_id', 'is', null)
      .gte('spun_at', startDateISO)

    if (userPointsError) {
      console.error('Error fetching user points:', userPointsError)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    // Get points for guest users in the period
    const { data: guestPoints, error: guestPointsError } = await supabase
      .from('spin_history')
      .select('guest_user_id, points_earned')
      .not('guest_user_id', 'is', null)
      .gte('spun_at', startDateISO)

    if (guestPointsError) {
      console.error('Error fetching guest points:', guestPointsError)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    // Aggregate points by user
    const userPointsMap = new Map<string, number>()
    const userSpinsMap = new Map<string, number>()
    for (const row of userPoints || []) {
      if (row.user_id) {
        userPointsMap.set(row.user_id, (userPointsMap.get(row.user_id) || 0) + row.points_earned)
        userSpinsMap.set(row.user_id, (userSpinsMap.get(row.user_id) || 0) + 1)
      }
    }

    const guestPointsMap = new Map<string, number>()
    const guestSpinsMap = new Map<string, number>()
    for (const row of guestPoints || []) {
      if (row.guest_user_id) {
        guestPointsMap.set(row.guest_user_id, (guestPointsMap.get(row.guest_user_id) || 0) + row.points_earned)
        guestSpinsMap.set(row.guest_user_id, (guestSpinsMap.get(row.guest_user_id) || 0) + 1)
      }
    }

    // Get user details for those with points
    const userIds = Array.from(userPointsMap.keys())
    const guestIds = Array.from(guestPointsMap.keys())

    let users: Array<{ user_id: string; username: string; display_name: string | null; avatar_url: string | null }> = []
    let guests: Array<{ user_id: string; username: string; display_name: string | null; avatar_url: string | null }> = []

    if (userIds.length > 0) {
      const { data } = await supabase
        .from('users')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds)
      users = data || []
    }

    if (guestIds.length > 0) {
      const { data } = await supabase
        .from('guest_users')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', guestIds)
      guests = data || []
    }

    // Build entries
    const allEntries: Omit<LeaderboardEntry, 'rank'>[] = [
      ...users.map(u => ({
        user_type: 'user' as const,
        user_id: u.user_id,
        username: u.username,
        display_name: u.display_name,
        avatar_url: u.avatar_url,
        points: userPointsMap.get(u.user_id) || 0,
        total_spins: userSpinsMap.get(u.user_id) || 0,
      })),
      ...guests.map(g => ({
        user_type: 'guest' as const,
        user_id: g.user_id,
        username: g.username,
        display_name: g.display_name,
        avatar_url: g.avatar_url,
        points: guestPointsMap.get(g.user_id) || 0,
        total_spins: guestSpinsMap.get(g.user_id) || 0,
      })),
    ]

    // Sort by points descending
    allEntries.sort((a, b) => b.points - a.points)

    // Apply pagination and add rank
    const leaderboard: LeaderboardEntry[] = allEntries
      .slice(offset, offset + limit)
      .map((entry, index) => ({
        ...entry,
        rank: offset + index + 1,
      }))

    // Get current user's rank if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    let currentUserRank: LeaderboardEntry | null = null

    if (user) {
      const userEntry = allEntries.find(e => e.user_type === 'user' && e.user_id === user.id)
      if (userEntry) {
        const rank = allEntries.findIndex(e => e.user_type === 'user' && e.user_id === user.id) + 1
        currentUserRank = {
          ...userEntry,
          rank,
        }
      }
    }

    const total = allEntries.length

    return NextResponse.json({
      leaderboard,
      currentUser: currentUserRank,
      period,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error in leaderboard API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getAllTimeLeaderboard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  limit: number,
  offset: number
) {
  // Fetch users ordered by points
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('user_id, username, display_name, avatar_url, points, total_spins')
    .order('points', { ascending: false })
    .range(offset, offset + limit - 1)

  if (usersError) {
    console.error('Error fetching users:', usersError)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }

  // Fetch guest users ordered by points
  const { data: guestUsers, error: guestError } = await supabase
    .from('guest_users')
    .select('user_id, username, display_name, avatar_url, points, total_spins')
    .order('points', { ascending: false })
    .range(offset, offset + limit - 1)

  if (guestError) {
    console.error('Error fetching guest users:', guestError)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }

  // Combine and sort all users by points
  const allEntries: Omit<LeaderboardEntry, 'rank'>[] = [
    ...(users || []).map(u => ({
      user_type: 'user' as const,
      user_id: u.user_id,
      username: u.username,
      display_name: u.display_name,
      avatar_url: u.avatar_url,
      points: u.points || 0,
      total_spins: u.total_spins || 0,
    })),
    ...(guestUsers || []).map(g => ({
      user_type: 'guest' as const,
      user_id: g.user_id,
      username: g.username,
      display_name: g.display_name,
      avatar_url: g.avatar_url,
      points: g.points || 0,
      total_spins: g.total_spins || 0,
    })),
  ]

  // Sort by points descending
  allEntries.sort((a, b) => b.points - a.points)

  // Take top entries based on limit and add rank
  const leaderboard: LeaderboardEntry[] = allEntries
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      rank: offset + index + 1,
    }))

  // Get current user's rank if authenticated
  const { data: { user } } = await supabase.auth.getUser()
  let currentUserRank: LeaderboardEntry | null = null

  if (user) {
    const { data: currentUserData } = await supabase
      .from('users')
      .select('user_id, username, display_name, avatar_url, points, total_spins')
      .eq('user_id', user.id)
      .single()

    if (currentUserData) {
      // Count users with more points to get rank
      const { count: usersAbove } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('points', currentUserData.points || 0)

      const { count: guestsAbove } = await supabase
        .from('guest_users')
        .select('*', { count: 'exact', head: true })
        .gt('points', currentUserData.points || 0)

      const rank = (usersAbove || 0) + (guestsAbove || 0) + 1

      currentUserRank = {
        rank,
        user_type: 'user',
        user_id: currentUserData.user_id,
        username: currentUserData.username,
        display_name: currentUserData.display_name,
        avatar_url: currentUserData.avatar_url,
        points: currentUserData.points || 0,
        total_spins: currentUserData.total_spins || 0,
      }
    }
  }

  // Get total count for pagination
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: totalGuests } = await supabase
    .from('guest_users')
    .select('*', { count: 'exact', head: true })

  const total = (totalUsers || 0) + (totalGuests || 0)

  return NextResponse.json({
    leaderboard,
    currentUser: currentUserRank,
    period: 'all-time',
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  })
}
