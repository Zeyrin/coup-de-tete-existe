/**
 * Tests for archetype calculation logic
 * Tests the quiz scoring system
 */

import { calculateArchetypeFromAnswers, QUIZ_QUESTIONS, ARCHETYPES } from '@/data/archetypes'

describe('Archetype calculation', () => {
  describe('calculateArchetypeFromAnswers', () => {
    it('should return royal_elegance for consistent luxury answers', () => {
      // Answer all questions with royal_elegance options
      const answers: Record<string, string> = {
        q1: 'q1_a', // Brunch raffiné
        q2: 'q2_a', // Château avec jardins
        q3: 'q3_a', // Objet d'art raffiné
        q4: 'q4_a', // Petit-déjeuner servi
        q5: 'q5_a', // Devant un palace
        q6: 'q6_a', // Hébergement de qualité
      }

      const result = calculateArchetypeFromAnswers(answers)

      expect(result.archetypeId).toBe('royal_elegance')
      expect(result.scores.royal_elegance).toBeGreaterThan(0)
    })

    it('should return nature_adventurer for consistent nature answers', () => {
      const answers: Record<string, string> = {
        q1: 'q1_c', // Randonnée au lever du soleil
        q2: 'q2_c', // Panorama depuis un sommet
        q3: 'q3_c', // Photo d'un paysage
        q4: 'q4_c', // À l'aube pour explorer
        q5: 'q5_c', // Au sommet d'une montagne
        q6: 'q6_c', // Équipement outdoor
      }

      const result = calculateArchetypeFromAnswers(answers)

      expect(result.archetypeId).toBe('nature_adventurer')
      expect(result.scores.nature_adventurer).toBeGreaterThan(0)
    })

    it('should return beach_relaxer for consistent beach answers', () => {
      const answers: Record<string, string> = {
        q1: 'q1_e', // Plage avec un bon livre
        q2: 'q2_e', // Eau turquoise et sable fin
        q3: 'q3_e', // Coquillage ou sable
        q4: 'q4_e', // Quand j'ai fini de dormir
        q5: 'q5_e', // Face à la mer avec un cocktail
        q6: 'q6_e', // Activités relaxantes
      }

      const result = calculateArchetypeFromAnswers(answers)

      expect(result.archetypeId).toBe('beach_relaxer')
      expect(result.scores.beach_relaxer).toBeGreaterThan(0)
    })

    it('should return gastronome for consistent food answers', () => {
      const answers: Record<string, string> = {
        q1: 'q1_d', // Marché local
        q2: 'q2_d', // Restaurant étoilé
        q3: 'q3_d', // Bouteille de vin
        q4: 'q4_d', // À temps pour le marché
        q5: 'q5_d', // Plat local
        q6: 'q6_d', // Restaurants
      }

      const result = calculateArchetypeFromAnswers(answers)

      expect(result.archetypeId).toBe('gastronome')
      expect(result.scores.gastronome).toBeGreaterThan(0)
    })

    it('should return culture_seeker for consistent culture answers', () => {
      const answers: Record<string, string> = {
        q1: 'q1_b', // Musée dès l'ouverture
        q2: 'q2_b', // Cathédrale gothique
        q3: 'q3_b', // Livre d'art
        q4: 'q4_b', // Tôt pour les sites
        q5: 'q5_b', // Galerie d'art
        q6: 'q6_b', // Musées et monuments
      }

      const result = calculateArchetypeFromAnswers(answers)

      expect(result.archetypeId).toBe('culture_seeker')
      expect(result.scores.culture_seeker).toBeGreaterThan(0)
    })

    it('should calculate confidence based on score distribution', () => {
      // When all answers are the same archetype, confidence should be high
      const consistentAnswers: Record<string, string> = {
        q1: 'q1_c',
        q2: 'q2_c',
        q3: 'q3_c',
        q4: 'q4_c',
        q5: 'q5_c',
        q6: 'q6_c',
      }

      const result = calculateArchetypeFromAnswers(consistentAnswers)

      expect(result.confidence).toBeGreaterThan(50)
    })

    it('should handle mixed answers', () => {
      // Mix of different archetypes
      const mixedAnswers: Record<string, string> = {
        q1: 'q1_a', // royal_elegance
        q2: 'q2_b', // culture_seeker
        q3: 'q3_c', // nature_adventurer
        q4: 'q4_d', // gastronome
        q5: 'q5_e', // beach_relaxer
        q6: 'q6_a', // royal_elegance
      }

      const result = calculateArchetypeFromAnswers(mixedAnswers)

      // Should still return a valid archetype
      expect(ARCHETYPES[result.archetypeId]).toBeDefined()
      // All scores should be populated
      expect(Object.keys(result.scores).length).toBe(5)
    })

    it('should handle empty answers', () => {
      const result = calculateArchetypeFromAnswers({})

      // Should return a default archetype (culture_seeker)
      expect(result.archetypeId).toBe('culture_seeker')
      expect(result.confidence).toBe(0)
    })

    it('should ignore invalid question ids', () => {
      const answersWithInvalid: Record<string, string> = {
        invalid_question: 'invalid_option',
        q1: 'q1_a',
      }

      const result = calculateArchetypeFromAnswers(answersWithInvalid)

      // Should not crash and should process valid answers
      expect(result.scores.royal_elegance).toBeGreaterThan(0)
    })

    it('should ignore invalid option ids', () => {
      const answersWithInvalidOption: Record<string, string> = {
        q1: 'invalid_option',
        q2: 'q2_a',
      }

      const result = calculateArchetypeFromAnswers(answersWithInvalidOption)

      // Should not crash and should process valid answers
      expect(result.scores).toBeDefined()
    })
  })

  describe('QUIZ_QUESTIONS', () => {
    it('should have 6 questions', () => {
      expect(QUIZ_QUESTIONS.length).toBe(6)
    })

    it('should have French and English translations for all questions', () => {
      QUIZ_QUESTIONS.forEach((question) => {
        expect(question.question_fr).toBeDefined()
        expect(question.question_en).toBeDefined()
        expect(question.question_fr.length).toBeGreaterThan(0)
        expect(question.question_en.length).toBeGreaterThan(0)
      })
    })

    it('should have 5 options per question', () => {
      QUIZ_QUESTIONS.forEach((question) => {
        expect(question.options.length).toBe(5)
      })
    })

    it('should have archetype scores for all options', () => {
      QUIZ_QUESTIONS.forEach((question) => {
        question.options.forEach((option) => {
          expect(option.archetype_scores).toBeDefined()
          expect(Object.keys(option.archetype_scores).length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('ARCHETYPES', () => {
    it('should have 5 archetypes', () => {
      expect(Object.keys(ARCHETYPES).length).toBe(5)
    })

    it('should have required fields for all archetypes', () => {
      Object.values(ARCHETYPES).forEach((archetype) => {
        expect(archetype.id).toBeDefined()
        expect(archetype.name_fr).toBeDefined()
        expect(archetype.name_en).toBeDefined()
        expect(archetype.description_fr).toBeDefined()
        expect(archetype.description_en).toBeDefined()
        expect(archetype.icon).toBeDefined()
        expect(archetype.color).toBeDefined()
      })
    })

    it('should have valid color hex codes', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

      Object.values(ARCHETYPES).forEach((archetype) => {
        expect(archetype.color).toMatch(hexColorRegex)
      })
    })
  })
})
