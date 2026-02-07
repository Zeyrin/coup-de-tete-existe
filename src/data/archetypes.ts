import type { Archetype, ArchetypeId, QuizQuestion } from '@/types/database';

// Static archetype data (matches database)
export const ARCHETYPES: Record<ArchetypeId, Omit<Archetype, 'created_at'>> = {
  royal_elegance: {
    id: 'royal_elegance',
    name_fr: "L'Aristocrate",
    name_en: 'The Aristocrat',
    description_fr: 'Amoureux des palais, du luxe et des expériences raffinées',
    description_en: 'Loves palaces, luxury, and refined experiences',
    icon: '👑',
    color: '#FFD700',
  },
  culture_seeker: {
    id: 'culture_seeker',
    name_fr: "L'Artiste",
    name_en: 'The Artist',
    description_fr: "Attiré par l'art, les musées et le patrimoine culturel",
    description_en: 'Drawn to art, museums, and cultural heritage',
    icon: '🎨',
    color: '#9B59B6',
  },
  nature_adventurer: {
    id: 'nature_adventurer',
    name_fr: "L'Explorateur",
    name_en: 'The Explorer',
    description_fr: "Cherche l'aventure, la randonnée et les grands espaces",
    description_en: 'Seeks outdoor adventures, hiking, and landscapes',
    icon: '🏔️',
    color: '#27AE60',
  },
  gastronome: {
    id: 'gastronome',
    name_fr: 'Le Gourmet',
    name_en: 'The Foodie',
    description_fr: 'Vit pour la gastronomie, les vins et les expériences culinaires',
    description_en: 'Lives for food, wine, and culinary experiences',
    icon: '🍷',
    color: '#E74C3C',
  },
  beach_relaxer: {
    id: 'beach_relaxer',
    name_fr: 'Le Rêveur',
    name_en: 'The Dreamer',
    description_fr: "Recherche la détente, l'ambiance méditerranéenne et les plages",
    description_en: 'Craves beaches, Mediterranean vibes, and relaxation',
    icon: '🏖️',
    color: '#3498DB',
  },
};

// Quiz questions with archetype scoring
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question_fr: 'Ton week-end idéal commence par...',
    question_en: 'Your ideal weekend starts with...',
    options: [
      {
        id: 'q1_a',
        label_fr: 'Un brunch raffiné dans un café historique',
        label_en: 'A refined brunch in a historic café',
        archetype_scores: { royal_elegance: 3, gastronome: 2 },
      },
      {
        id: 'q1_b',
        label_fr: 'Une visite au musée dès l\'ouverture',
        label_en: 'A museum visit right at opening',
        archetype_scores: { culture_seeker: 3, royal_elegance: 1 },
      },
      {
        id: 'q1_c',
        label_fr: 'Une randonnée au lever du soleil',
        label_en: 'A hike at sunrise',
        archetype_scores: { nature_adventurer: 3 },
      },
      {
        id: 'q1_d',
        label_fr: 'Le marché local pour des produits frais',
        label_en: 'The local market for fresh products',
        archetype_scores: { gastronome: 3, culture_seeker: 1 },
      },
      {
        id: 'q1_e',
        label_fr: 'La plage avec un bon livre',
        label_en: 'The beach with a good book',
        archetype_scores: { beach_relaxer: 3 },
      },
    ],
  },
  {
    id: 'q2',
    question_fr: 'Qu\'est-ce qui te fait dire "wow" en voyage ?',
    question_en: 'What makes you say "wow" when traveling?',
    options: [
      {
        id: 'q2_a',
        label_fr: 'Un château avec des jardins à la française',
        label_en: 'A castle with French formal gardens',
        archetype_scores: { royal_elegance: 3, culture_seeker: 1 },
      },
      {
        id: 'q2_b',
        label_fr: 'Une cathédrale gothique impressionnante',
        label_en: 'An impressive Gothic cathedral',
        archetype_scores: { culture_seeker: 3 },
      },
      {
        id: 'q2_c',
        label_fr: 'Un panorama depuis un sommet',
        label_en: 'A panorama from a summit',
        archetype_scores: { nature_adventurer: 3 },
      },
      {
        id: 'q2_d',
        label_fr: 'Un restaurant étoilé ou un marché local',
        label_en: 'A Michelin-starred restaurant or local market',
        archetype_scores: { gastronome: 3 },
      },
      {
        id: 'q2_e',
        label_fr: 'Une eau turquoise et du sable fin',
        label_en: 'Turquoise water and fine sand',
        archetype_scores: { beach_relaxer: 3 },
      },
    ],
  },
  {
    id: 'q3',
    question_fr: 'Ton souvenir de voyage préféré serait...',
    question_en: 'Your favorite travel souvenir would be...',
    options: [
      {
        id: 'q3_a',
        label_fr: 'Un objet d\'art ou d\'artisanat raffiné',
        label_en: 'A refined art object or craft',
        archetype_scores: { royal_elegance: 2, culture_seeker: 2 },
      },
      {
        id: 'q3_b',
        label_fr: 'Un livre d\'art ou une affiche de musée',
        label_en: 'An art book or museum poster',
        archetype_scores: { culture_seeker: 3 },
      },
      {
        id: 'q3_c',
        label_fr: 'Une photo d\'un paysage époustouflant',
        label_en: 'A photo of a breathtaking landscape',
        archetype_scores: { nature_adventurer: 3 },
      },
      {
        id: 'q3_d',
        label_fr: 'Une bouteille de vin ou un produit local',
        label_en: 'A bottle of wine or local product',
        archetype_scores: { gastronome: 3 },
      },
      {
        id: 'q3_e',
        label_fr: 'Un coquillage ou du sable de la plage',
        label_en: 'A seashell or sand from the beach',
        archetype_scores: { beach_relaxer: 3 },
      },
    ],
  },
  {
    id: 'q4',
    question_fr: 'À quelle heure tu te lèves en vacances ?',
    question_en: 'What time do you wake up on vacation?',
    options: [
      {
        id: 'q4_a',
        label_fr: 'À l\'heure pour un petit-déjeuner servi',
        label_en: 'In time for a served breakfast',
        archetype_scores: { royal_elegance: 2, gastronome: 2 },
      },
      {
        id: 'q4_b',
        label_fr: 'Tôt pour profiter des sites sans foule',
        label_en: 'Early to enjoy sites without crowds',
        archetype_scores: { culture_seeker: 3 },
      },
      {
        id: 'q4_c',
        label_fr: 'À l\'aube pour partir en exploration',
        label_en: 'At dawn to go exploring',
        archetype_scores: { nature_adventurer: 3 },
      },
      {
        id: 'q4_d',
        label_fr: 'À temps pour le marché du matin',
        label_en: 'In time for the morning market',
        archetype_scores: { gastronome: 3 },
      },
      {
        id: 'q4_e',
        label_fr: 'Quand j\'ai fini de dormir...',
        label_en: "When I'm done sleeping...",
        archetype_scores: { beach_relaxer: 3 },
      },
    ],
  },
  {
    id: 'q5',
    question_fr: 'Ta photo Instagram de voyage idéale ?',
    question_en: 'Your ideal travel Instagram photo?',
    options: [
      {
        id: 'q5_a',
        label_fr: 'Devant un palace ou un lieu iconique',
        label_en: 'In front of a palace or iconic place',
        archetype_scores: { royal_elegance: 3 },
      },
      {
        id: 'q5_b',
        label_fr: 'Dans une galerie d\'art ou devant une fresque',
        label_en: 'In an art gallery or in front of a fresco',
        archetype_scores: { culture_seeker: 3 },
      },
      {
        id: 'q5_c',
        label_fr: 'Au sommet d\'une montagne ou en forêt',
        label_en: 'At the top of a mountain or in a forest',
        archetype_scores: { nature_adventurer: 3 },
      },
      {
        id: 'q5_d',
        label_fr: 'Avec un plat local magnifiquement présenté',
        label_en: 'With a beautifully presented local dish',
        archetype_scores: { gastronome: 3 },
      },
      {
        id: 'q5_e',
        label_fr: 'Face à la mer avec un cocktail',
        label_en: 'Facing the sea with a cocktail',
        archetype_scores: { beach_relaxer: 3 },
      },
    ],
  },
  {
    id: 'q6',
    question_fr: 'Quel est ton budget prioritaire en voyage ?',
    question_en: 'What is your priority budget when traveling?',
    options: [
      {
        id: 'q6_a',
        label_fr: 'L\'hébergement de qualité',
        label_en: 'Quality accommodation',
        archetype_scores: { royal_elegance: 3, beach_relaxer: 1 },
      },
      {
        id: 'q6_b',
        label_fr: 'Les entrées aux musées et monuments',
        label_en: 'Museum and monument admissions',
        archetype_scores: { culture_seeker: 3 },
      },
      {
        id: 'q6_c',
        label_fr: 'L\'équipement et les activités outdoor',
        label_en: 'Outdoor equipment and activities',
        archetype_scores: { nature_adventurer: 3 },
      },
      {
        id: 'q6_d',
        label_fr: 'Les restaurants et expériences culinaires',
        label_en: 'Restaurants and culinary experiences',
        archetype_scores: { gastronome: 3 },
      },
      {
        id: 'q6_e',
        label_fr: 'Les activités relaxantes (spa, plage...)',
        label_en: 'Relaxing activities (spa, beach...)',
        archetype_scores: { beach_relaxer: 3 },
      },
    ],
  },
];

// Calculate archetype from quiz answers
export function calculateArchetypeFromAnswers(
  answers: Record<string, string>
): { archetypeId: ArchetypeId; scores: Record<ArchetypeId, number>; confidence: number } {
  const scores: Record<ArchetypeId, number> = {
    royal_elegance: 0,
    culture_seeker: 0,
    nature_adventurer: 0,
    gastronome: 0,
    beach_relaxer: 0,
  };

  // Calculate scores from answers
  for (const [questionId, optionId] of Object.entries(answers)) {
    const question = QUIZ_QUESTIONS.find((q) => q.id === questionId);
    if (!question) continue;

    const option = question.options.find((o) => o.id === optionId);
    if (!option) continue;

    for (const [archetypeId, score] of Object.entries(option.archetype_scores)) {
      scores[archetypeId as ArchetypeId] += score;
    }
  }

  // Find winning archetype
  let maxScore = 0;
  let winningArchetype: ArchetypeId = 'culture_seeker';

  for (const [archetypeId, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      winningArchetype = archetypeId as ArchetypeId;
    }
  }

  // Calculate confidence (how much the winner stands out)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? Math.round((maxScore / totalScore) * 100) : 0;

  return {
    archetypeId: winningArchetype,
    scores,
    confidence,
  };
}
