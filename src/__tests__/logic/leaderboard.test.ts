/**
 * Tests for leaderboard business logic
 * Tests ranking, pagination, and period calculations
 */

describe('Leaderboard Logic', () => {
  describe('Period date calculations', () => {
    type Period = 'weekly' | 'monthly' | 'all-time'

    function getStartDate(period: Period, now = new Date()): Date | null {
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

    it('should return null for all-time period', () => {
      expect(getStartDate('all-time')).toBeNull()
    })

    it('should return start of month for monthly period', () => {
      // Test with a specific date: March 15, 2024
      const testDate = new Date('2024-03-15T10:30:00Z')
      const result = getStartDate('monthly', testDate)

      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(2) // March (0-indexed)
      expect(result?.getDate()).toBe(1)
    })

    it('should return Monday for weekly period when today is Wednesday', () => {
      // Wednesday, March 13, 2024
      const wednesday = new Date('2024-03-13T10:30:00Z')
      const result = getStartDate('weekly', wednesday)

      // Should be Monday, March 11, 2024
      expect(result?.getDate()).toBe(11)
    })

    it('should return Monday for weekly period when today is Sunday', () => {
      // Sunday, March 17, 2024
      const sunday = new Date('2024-03-17T10:30:00Z')
      const result = getStartDate('weekly', sunday)

      // Should be Monday, March 11, 2024
      expect(result?.getDate()).toBe(11)
    })

    it('should return same day for weekly period when today is Monday', () => {
      // Monday, March 11, 2024
      const monday = new Date('2024-03-11T10:30:00Z')
      const result = getStartDate('weekly', monday)

      // Should be Monday, March 11, 2024
      expect(result?.getDate()).toBe(11)
    })
  })

  describe('Ranking and sorting', () => {
    interface LeaderboardEntry {
      user_id: string
      username: string
      points: number
      total_spins: number
      user_type: 'user' | 'guest'
    }

    function sortByPoints(entries: LeaderboardEntry[]): LeaderboardEntry[] {
      return [...entries].sort((a, b) => b.points - a.points)
    }

    function addRanks(
      entries: LeaderboardEntry[],
      offset = 0
    ): (LeaderboardEntry & { rank: number })[] {
      return entries.map((entry, index) => ({
        ...entry,
        rank: offset + index + 1,
      }))
    }

    it('should sort entries by points descending', () => {
      const entries: LeaderboardEntry[] = [
        { user_id: '1', username: 'alice', points: 50, total_spins: 5, user_type: 'user' },
        { user_id: '2', username: 'bob', points: 100, total_spins: 10, user_type: 'user' },
        { user_id: '3', username: 'charlie', points: 75, total_spins: 8, user_type: 'guest' },
      ]

      const sorted = sortByPoints(entries)

      expect(sorted[0].username).toBe('bob')
      expect(sorted[1].username).toBe('charlie')
      expect(sorted[2].username).toBe('alice')
    })

    it('should add correct ranks starting from 1', () => {
      const entries: LeaderboardEntry[] = [
        { user_id: '1', username: 'first', points: 100, total_spins: 10, user_type: 'user' },
        { user_id: '2', username: 'second', points: 50, total_spins: 5, user_type: 'user' },
      ]

      const ranked = addRanks(entries)

      expect(ranked[0].rank).toBe(1)
      expect(ranked[1].rank).toBe(2)
    })

    it('should add correct ranks with offset', () => {
      const entries: LeaderboardEntry[] = [
        { user_id: '1', username: 'eleventh', points: 100, total_spins: 10, user_type: 'user' },
        { user_id: '2', username: 'twelfth', points: 50, total_spins: 5, user_type: 'user' },
      ]

      const ranked = addRanks(entries, 10)

      expect(ranked[0].rank).toBe(11)
      expect(ranked[1].rank).toBe(12)
    })

    it('should handle empty array', () => {
      const sorted = sortByPoints([])
      const ranked = addRanks([])

      expect(sorted).toEqual([])
      expect(ranked).toEqual([])
    })
  })

  describe('Pagination', () => {
    function paginate<T>(
      items: T[],
      limit: number,
      offset: number
    ): { items: T[]; hasMore: boolean; total: number } {
      const total = items.length
      const paginatedItems = items.slice(offset, offset + limit)
      const hasMore = offset + limit < total

      return {
        items: paginatedItems,
        hasMore,
        total,
      }
    }

    it('should return correct page of items', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

      const page1 = paginate(items, 3, 0)
      expect(page1.items).toEqual([1, 2, 3])
      expect(page1.hasMore).toBe(true)
      expect(page1.total).toBe(10)

      const page2 = paginate(items, 3, 3)
      expect(page2.items).toEqual([4, 5, 6])
      expect(page2.hasMore).toBe(true)

      const page4 = paginate(items, 3, 9)
      expect(page4.items).toEqual([10])
      expect(page4.hasMore).toBe(false)
    })

    it('should handle offset beyond array length', () => {
      const items = [1, 2, 3]
      const result = paginate(items, 10, 100)

      expect(result.items).toEqual([])
      expect(result.hasMore).toBe(false)
      expect(result.total).toBe(3)
    })

    it('should cap limit appropriately', () => {
      function capLimit(limit: number, max = 100): number {
        return Math.min(limit, max)
      }

      expect(capLimit(50)).toBe(50)
      expect(capLimit(150)).toBe(100)
      expect(capLimit(200, 50)).toBe(50)
    })
  })

  describe('Combining user types', () => {
    interface UserEntry {
      user_id: string
      username: string
      points: number
      total_spins: number
    }

    interface LeaderboardEntry extends UserEntry {
      user_type: 'user' | 'guest'
    }

    function combineEntries(
      users: UserEntry[],
      guests: UserEntry[]
    ): LeaderboardEntry[] {
      return [
        ...users.map((u) => ({ ...u, user_type: 'user' as const })),
        ...guests.map((g) => ({ ...g, user_type: 'guest' as const })),
      ]
    }

    it('should combine users and guests into single array', () => {
      const users: UserEntry[] = [
        { user_id: 'u1', username: 'alice', points: 100, total_spins: 10 },
      ]
      const guests: UserEntry[] = [
        { user_id: 'g1', username: 'guest1', points: 50, total_spins: 5 },
      ]

      const combined = combineEntries(users, guests)

      expect(combined.length).toBe(2)
      expect(combined[0].user_type).toBe('user')
      expect(combined[1].user_type).toBe('guest')
    })

    it('should handle empty arrays', () => {
      const combined = combineEntries([], [])
      expect(combined).toEqual([])
    })

    it('should handle only users', () => {
      const users: UserEntry[] = [
        { user_id: 'u1', username: 'alice', points: 100, total_spins: 10 },
      ]

      const combined = combineEntries(users, [])

      expect(combined.length).toBe(1)
      expect(combined[0].user_type).toBe('user')
    })

    it('should handle only guests', () => {
      const guests: UserEntry[] = [
        { user_id: 'g1', username: 'guest1', points: 50, total_spins: 5 },
      ]

      const combined = combineEntries([], guests)

      expect(combined.length).toBe(1)
      expect(combined[0].user_type).toBe('guest')
    })
  })

  describe('Current user rank calculation', () => {
    function calculateRank(
      userPoints: number,
      allEntries: { points: number }[]
    ): number {
      const usersAbove = allEntries.filter((e) => e.points > userPoints).length
      return usersAbove + 1
    }

    it('should calculate rank 1 for highest points', () => {
      const entries = [{ points: 100 }, { points: 80 }, { points: 60 }]
      expect(calculateRank(100, entries)).toBe(1)
    })

    it('should calculate correct rank for middle position', () => {
      const entries = [{ points: 100 }, { points: 80 }, { points: 60 }]
      expect(calculateRank(80, entries)).toBe(2)
    })

    it('should calculate last rank for lowest points', () => {
      const entries = [{ points: 100 }, { points: 80 }, { points: 60 }]
      expect(calculateRank(60, entries)).toBe(3)
    })

    it('should handle ties (same rank for equal points)', () => {
      const entries = [{ points: 100 }, { points: 100 }, { points: 60 }]
      // Both 100-point users should be rank 1
      expect(calculateRank(100, entries)).toBe(1)
      // 60-point user should be rank 3
      expect(calculateRank(60, entries)).toBe(3)
    })
  })
})
