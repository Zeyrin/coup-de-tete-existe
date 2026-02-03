/**
 * Tests for the roll/spin business logic
 * Tests points calculation and validation
 */

describe('Roll/Spin Logic', () => {
  describe('Points calculation', () => {
    /**
     * Points formula: floor(travel_time_minutes / 10) + floor(typical_price_euros)
     */
    function calculatePoints(travelTimeMinutes: number, typicalPriceEuros: number): number {
      return Math.floor(travelTimeMinutes / 10) + Math.floor(typicalPriceEuros)
    }

    it('should calculate points correctly for short trips', () => {
      // Versailles: 20 min, €3
      // Points = floor(20/10) + floor(3) = 2 + 3 = 5
      expect(calculatePoints(20, 3)).toBe(5)
    })

    it('should calculate points correctly for medium trips', () => {
      // Lyon: 120 min, €10
      // Points = floor(120/10) + floor(10) = 12 + 10 = 22
      expect(calculatePoints(120, 10)).toBe(22)
    })

    it('should calculate points correctly for long trips', () => {
      // Nice from Paris: 330 min, €25
      // Points = floor(330/10) + floor(25) = 33 + 25 = 58
      expect(calculatePoints(330, 25)).toBe(58)
    })

    it('should floor decimal values', () => {
      // 45 min, €9.99
      // Points = floor(45/10) + floor(9.99) = 4 + 9 = 13
      expect(calculatePoints(45, 9.99)).toBe(13)
    })

    it('should handle zero values', () => {
      expect(calculatePoints(0, 0)).toBe(0)
      expect(calculatePoints(0, 10)).toBe(10)
      expect(calculatePoints(100, 0)).toBe(10)
    })
  })

  describe('Input validation', () => {
    function validateRollInput(input: {
      destination_city?: string
      departure_city?: string
      travel_time_minutes?: number
      typical_price_euros?: number
    }): { valid: boolean; error?: string } {
      if (!input.destination_city) {
        return { valid: false, error: 'Missing destination_city' }
      }
      if (!input.departure_city) {
        return { valid: false, error: 'Missing departure_city' }
      }
      if (!input.travel_time_minutes) {
        return { valid: false, error: 'Missing travel_time_minutes' }
      }
      if (!input.typical_price_euros) {
        return { valid: false, error: 'Missing typical_price_euros' }
      }
      return { valid: true }
    }

    it('should reject missing destination_city', () => {
      const result = validateRollInput({
        departure_city: 'paris',
        travel_time_minutes: 60,
        typical_price_euros: 10,
      })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Missing destination_city')
    })

    it('should reject missing departure_city', () => {
      const result = validateRollInput({
        destination_city: 'Lyon',
        travel_time_minutes: 60,
        typical_price_euros: 10,
      })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Missing departure_city')
    })

    it('should reject missing travel_time_minutes', () => {
      const result = validateRollInput({
        destination_city: 'Lyon',
        departure_city: 'paris',
        typical_price_euros: 10,
      })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Missing travel_time_minutes')
    })

    it('should reject missing typical_price_euros', () => {
      const result = validateRollInput({
        destination_city: 'Lyon',
        departure_city: 'paris',
        travel_time_minutes: 60,
      })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Missing typical_price_euros')
    })

    it('should accept valid input', () => {
      const result = validateRollInput({
        destination_city: 'Lyon',
        departure_city: 'paris',
        travel_time_minutes: 60,
        typical_price_euros: 10,
      })
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('Recent destinations exclusion', () => {
    function filterDestinations(
      destinations: string[],
      recentDestinations: string[],
      minAlternatives = 4
    ): string[] {
      const availableWithoutRecent = destinations.filter(
        (d) => !recentDestinations.includes(d)
      )

      // Only exclude recent if we have enough alternatives
      if (availableWithoutRecent.length >= minAlternatives) {
        return availableWithoutRecent
      }
      return destinations
    }

    it('should exclude recent destinations when enough alternatives exist', () => {
      const destinations = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
      const recent = ['A', 'B', 'C']

      const result = filterDestinations(destinations, recent)

      expect(result).not.toContain('A')
      expect(result).not.toContain('B')
      expect(result).not.toContain('C')
      expect(result).toContain('D')
      expect(result).toContain('E')
      expect(result).toContain('F')
      expect(result).toContain('G')
    })

    it('should include recent destinations when not enough alternatives', () => {
      const destinations = ['A', 'B', 'C', 'D', 'E']
      const recent = ['A', 'B', 'C']

      // Only 2 alternatives (D, E), need at least 4
      const result = filterDestinations(destinations, recent)

      expect(result).toEqual(destinations)
    })

    it('should handle empty recent destinations', () => {
      const destinations = ['A', 'B', 'C', 'D', 'E']
      const recent: string[] = []

      const result = filterDestinations(destinations, recent)

      expect(result).toEqual(destinations)
    })

    it('should handle all recent (edge case)', () => {
      const destinations = ['A', 'B', 'C']
      const recent = ['A', 'B', 'C']

      const result = filterDestinations(destinations, recent)

      // Should return all since no alternatives
      expect(result).toEqual(destinations)
    })
  })
})
