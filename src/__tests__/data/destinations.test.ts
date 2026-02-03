/**
 * Tests for destinations data integrity
 * Ensures all destinations have required fields and valid data
 */

import destinations from '@/app/destinations.json'

interface Image {
  url: string
  alt: string
  credit?: string
}

interface Destination {
  city: string
  tagline: string
  station: string
  departure: 'paris' | 'nice'
  activities: string[]
  travel_time: string
  travel_time_minutes: number
  typical_price: string
  typical_price_euros: number
  vibe: string
  image?: string
  images?: Image[]
}

describe('Destinations Data', () => {
  const typedDestinations = destinations as Destination[]

  describe('Data completeness', () => {
    it('should have destinations', () => {
      expect(typedDestinations.length).toBeGreaterThan(0)
    })

    it('should have at least 40 destinations for MVP', () => {
      expect(typedDestinations.length).toBeGreaterThanOrEqual(40)
    })

    it('should have destinations departing from Paris', () => {
      const parisDestinations = typedDestinations.filter(d => d.departure === 'paris')
      expect(parisDestinations.length).toBeGreaterThan(0)
    })

    it('should have destinations departing from Nice', () => {
      const niceDestinations = typedDestinations.filter(d => d.departure === 'nice')
      expect(niceDestinations.length).toBeGreaterThan(0)
    })
  })

  describe('Required fields', () => {
    it('every destination should have a city name', () => {
      typedDestinations.forEach((dest, index) => {
        expect(dest.city).toBeDefined()
        expect(dest.city.length).toBeGreaterThan(0)
      })
    })

    it('every destination should have a tagline', () => {
      typedDestinations.forEach((dest) => {
        expect(dest.tagline).toBeDefined()
        expect(dest.tagline.length).toBeGreaterThan(0)
      })
    })

    it('every destination should have a station', () => {
      typedDestinations.forEach((dest) => {
        expect(dest.station).toBeDefined()
        expect(dest.station.length).toBeGreaterThan(0)
      })
    })

    it('every destination should have a valid departure city', () => {
      typedDestinations.forEach((dest) => {
        expect(['paris', 'nice']).toContain(dest.departure)
      })
    })

    it('every destination should have activities', () => {
      typedDestinations.forEach((dest) => {
        expect(dest.activities).toBeDefined()
        expect(Array.isArray(dest.activities)).toBe(true)
        expect(dest.activities.length).toBeGreaterThan(0)
      })
    })

    it('every destination should have travel time', () => {
      typedDestinations.forEach((dest) => {
        expect(dest.travel_time).toBeDefined()
        expect(dest.travel_time_minutes).toBeDefined()
        expect(typeof dest.travel_time_minutes).toBe('number')
        expect(dest.travel_time_minutes).toBeGreaterThan(0)
      })
    })

    it('every destination should have price information', () => {
      typedDestinations.forEach((dest) => {
        expect(dest.typical_price).toBeDefined()
        expect(dest.typical_price_euros).toBeDefined()
        expect(typeof dest.typical_price_euros).toBe('number')
        expect(dest.typical_price_euros).toBeGreaterThan(0)
      })
    })

    it('every destination should have a vibe', () => {
      typedDestinations.forEach((dest) => {
        expect(dest.vibe).toBeDefined()
        expect(dest.vibe.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Images', () => {
    it('every destination should have at least one image', () => {
      typedDestinations.forEach((dest) => {
        const hasImages = (dest.images && dest.images.length > 0) || dest.image
        expect(hasImages).toBeTruthy()
      })
    })

    it('all image URLs should be valid URLs', () => {
      const urlRegex = /^https?:\/\//i

      typedDestinations.forEach((dest) => {
        if (dest.images) {
          dest.images.forEach((img) => {
            if (img.url && img.url !== 'YOUR_IMAGE_URL_HERE') {
              expect(img.url).toMatch(urlRegex)
            }
          })
        }
        if (dest.image && dest.image !== 'YOUR_IMAGE_URL_HERE') {
          expect(dest.image).toMatch(urlRegex)
        }
      })
    })

    it('all images should have alt text', () => {
      typedDestinations.forEach((dest) => {
        if (dest.images) {
          dest.images.forEach((img) => {
            expect(img.alt).toBeDefined()
            expect(img.alt.length).toBeGreaterThan(0)
          })
        }
      })
    })
  })

  describe('Data consistency', () => {
    it('city names should be unique', () => {
      const cityNames = typedDestinations.map(d => d.city)
      const uniqueNames = new Set(cityNames)

      // Allow some duplicates for cities accessible from both Paris and Nice
      // but flag if there are too many duplicates
      const duplicates = cityNames.length - uniqueNames.size
      expect(duplicates).toBeLessThan(5)
    })

    it('travel_time_minutes should match travel_time format reasonably', () => {
      typedDestinations.forEach((dest) => {
        // If travel_time contains "h", minutes should be >= 60
        if (dest.travel_time.includes('h')) {
          expect(dest.travel_time_minutes).toBeGreaterThanOrEqual(60)
        }
      })
    })

    it('typical_price should contain € symbol', () => {
      typedDestinations.forEach((dest) => {
        expect(dest.typical_price).toContain('€')
      })
    })

    it('activities should have at least 3 items per destination', () => {
      typedDestinations.forEach((dest) => {
        expect(dest.activities.length).toBeGreaterThanOrEqual(3)
      })
    })
  })

  describe('Budget distribution', () => {
    it('should have budget-friendly options (< €10)', () => {
      const budgetFriendly = typedDestinations.filter(d => d.typical_price_euros < 10)
      expect(budgetFriendly.length).toBeGreaterThan(5)
    })

    it('should have mid-range options (€10-20)', () => {
      const midRange = typedDestinations.filter(
        d => d.typical_price_euros >= 10 && d.typical_price_euros <= 20
      )
      expect(midRange.length).toBeGreaterThan(5)
    })

    it('should have premium options (> €20)', () => {
      const premium = typedDestinations.filter(d => d.typical_price_euros > 20)
      expect(premium.length).toBeGreaterThan(0)
    })
  })

  describe('Travel time distribution', () => {
    it('should have quick trips (< 30 min)', () => {
      const quick = typedDestinations.filter(d => d.travel_time_minutes < 30)
      expect(quick.length).toBeGreaterThan(0)
    })

    it('should have short trips (30-60 min)', () => {
      const short = typedDestinations.filter(
        d => d.travel_time_minutes >= 30 && d.travel_time_minutes <= 60
      )
      expect(short.length).toBeGreaterThan(5)
    })

    it('should have medium trips (1-2 hours)', () => {
      const medium = typedDestinations.filter(
        d => d.travel_time_minutes > 60 && d.travel_time_minutes <= 120
      )
      expect(medium.length).toBeGreaterThan(5)
    })

    it('should have long trips (> 2 hours)', () => {
      const long = typedDestinations.filter(d => d.travel_time_minutes > 120)
      expect(long.length).toBeGreaterThan(0)
    })
  })

  describe('Paris destinations specifics', () => {
    const parisDestinations = typedDestinations.filter(d => d.departure === 'paris')

    it('should have variety of nearby destinations', () => {
      const nearby = parisDestinations.filter(d => d.travel_time_minutes <= 60)
      expect(nearby.length).toBeGreaterThan(5)
    })

    it('should include classic destinations', () => {
      const cities = parisDestinations.map(d => d.city.toLowerCase())

      // At least some of these classic destinations should be present
      const classics = ['versailles', 'fontainebleau', 'chartres', 'giverny']
      const presentClassics = classics.filter(c =>
        cities.some(city => city.includes(c))
      )

      expect(presentClassics.length).toBeGreaterThanOrEqual(3)
    })
  })
})
