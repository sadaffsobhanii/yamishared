import type { Analysis, Profile, SampleId } from '../types'

// Yami's nutrition source of truth (PRD 7.4). Every "Why?" is general guidance drawn from these.
export const SOURCES = [
  { label: 'Dietary Guidelines for Americans (USDA & HHS)', url: 'https://www.dietaryguidelines.gov' },
  { label: 'MyPlate (USDA)', url: 'https://www.myplate.gov' },
]

export const ANALYSES: Analysis[] = [
  {
    id: 'eggs',
    keywords: ['egg', 'eggs', 'toast', 'blueberry', 'blueberries'],
    items: ['Egg whites', 'Toast', 'Blueberries'],
    score: 84,
    summary: 'Nice protein in this meal.',
    why: 'Eggs bring protein, and the fruit adds a little fiber. That is a general observation, not a grade.',
    swapItem: 'Greek yogurt',
  },
  {
    id: 'smoothie',
    keywords: ['smoothie', 'banana', 'spinach', 'almond milk'],
    items: ['Banana', 'Spinach', 'Almond milk'],
    score: 71,
    summary: 'Nice work — this one was easy to get on the plate.',
    why: 'A smoothie like this is light. Protein or fiber beside it can help it last, if you want that. This is general wellness guidance, not a measurement.',
    swapItem: 'Peanut butter',
  },
  {
    id: 'pasta',
    keywords: ['pasta', 'noodle', 'noodles', 'spaghetti', 'parmesan', 'cream sauce'],
    items: ['Pasta', 'Cream sauce', 'Parmesan'],
    score: 46,
    summary: 'Nice work logging this.',
    why: 'Pasta is a filling meal. Greens, beans, or another protein nearby can add fiber if you want them. Nothing here needs correcting.',
    swapItem: 'Baby spinach',
  },
  {
    id: 'salad',
    keywords: ['salad', 'greens', 'chickpea', 'chickpeas', 'lettuce'],
    items: ['Mixed greens', 'Chickpeas', 'Olive oil'],
    score: 90,
    summary: 'Nice fiber in this meal.',
    why: 'Greens and chickpeas bring fiber, and the chickpeas add some protein. That is a simple read of the plate, not a score you have to earn.',
    swapItem: 'Edamame',
  },
  {
    id: 'soup',
    keywords: ['soup', 'broth', 'stew', 'bowl'],
    items: ['Soup', 'Bread'],
    score: 62,
    summary: 'Nice work — a warm, simple meal.',
    why: 'Soup is a simple way to eat. Fruit, beans, or yogurt later can add fiber or protein if that matches what you asked to notice.',
    swapItem: 'Apples',
  },
  {
    id: 'other',
    keywords: [],
    items: [],
    score: 70,
    summary: 'Nice work logging this.',
    why: 'Every meal you log helps me learn how you like to eat. This is a general read, not a measurement.',
    swapItem: 'Apples',
  },
]

// Stand-ins for a barcode scan in the prototype: tapping one acts like a successful scan.
export const PRODUCTS: { id: string; label: string; items: string[] }[] = [
  { id: 'yogurt', label: 'Greek yogurt cup', items: ['Greek yogurt'] },
  { id: 'edamame', label: 'Frozen edamame', items: ['Edamame'] },
  { id: 'lentil-soup', label: 'Canned lentil soup', items: ['Lentil soup'] },
  { id: 'granola', label: 'Granola bar', items: ['Granola bar'] },
]

export function searchMeals(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return SAMPLES.filter((sample) => {
    const analysis = byId[sample.id]
    return sample.label.toLowerCase().includes(q) || [...analysis.keywords, ...analysis.items].some((word) => word.toLowerCase().includes(q))
  })
}

export const SAMPLES: { id: SampleId; label: string; src: string }[] = [
  { id: 'eggs', label: 'Eggs & toast', src: `${import.meta.env.BASE_URL}samples/eggs.jpg` },
  { id: 'smoothie', label: 'Smoothie', src: `${import.meta.env.BASE_URL}samples/smoothie.jpg` },
  { id: 'pasta', label: 'Pasta', src: `${import.meta.env.BASE_URL}samples/pasta.jpg` },
  { id: 'salad', label: 'Salad', src: `${import.meta.env.BASE_URL}samples/salad.jpg` },
  { id: 'soup', label: 'Soup', src: `${import.meta.env.BASE_URL}samples/soup.jpg` },
]

const byId = Object.fromEntries(ANALYSES.map((analysis) => [analysis.id, analysis])) as Record<SampleId, Analysis>

function keywordHit(blob: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`, 'i').test(blob)
}

export function matchAnalysis(hints: string[]): Analysis | null {
  const blob = hints.join(' ').toLowerCase()
  let best: Analysis | null = null
  let bestScore = 0
  for (const analysis of ANALYSES) {
    const score = analysis.keywords.reduce((total, keyword) => total + (keywordHit(blob, keyword) ? 1 : 0), 0)
    if (score > bestScore) {
      best = analysis
      bestScore = score
    }
  }
  return best
}

export function pickAnalysis(hint: string): Analysis {
  const pool = ANALYSES.filter((analysis) => analysis.id !== 'other')
  return matchAnalysis([hint]) ?? pool[Math.floor(Math.random() * pool.length)]
}

export function analysisFromItems(items: string[], currentId: SampleId): Analysis {
  return matchAnalysis(items) ?? byId[currentId]
}

const PROTEIN_WORDS = /\b(egg|eggs|tofu|yogurt|chickpea|edamame|bean|beans|lentil)\b/i

export function hasProtein(items: string[]) {
  return PROTEIN_WORDS.test(items.join(' '))
}

export type MealIdea = {
  summary: string
  recommendation: string
  why: string
  swapItem: string
  budgetNote: string | null
}

export function recommendFor(analysis: Analysis, profile: Profile): MealIdea {
  const notes = `${profile.allergyNote} ${profile.doctorNote}`.toLowerCase()
  const vegan = profile.diets.includes('vegan')
  const dairyFree = vegan || /dairy|lactose|yogurt/.test(notes)
  const nutFree = /nut|peanut/.test(notes)
  const keto = profile.diets.includes('keto')
  const wantsProtein = profile.goals.includes('muscle') || profile.widgets.includes('protein') || profile.goals.includes('energy')
  const wantsSteady = profile.goals.includes('blood-sugar')
  const feelBetter = profile.goals.includes('feel-better')
  const awareOnly = profile.goals.includes('aware') && profile.goals.length === 1 && !profile.goalCustom.trim()
  const budget = Number(profile.budget)
  const tight = profile.studentBudget || (Number.isFinite(budget) && budget > 0 && budget <= 80)

  let swapItem = dairyFree ? 'Firm tofu' : 'Greek yogurt'
  let recommendation = dairyFree
    ? 'For your energy and protein focus, adding tofu or edamame later today could help.'
    : 'For your energy and protein focus, adding tofu, Greek yogurt, or edamame later today could help.'

  if (analysis.id === 'salad') {
    recommendation = wantsProtein
      ? 'Nice fiber here. For your protein focus, tofu, Greek yogurt, or edamame later today could help.'
      : 'Nice fiber in this meal. A small idea for later: edamame or fruit, only if you want it.'
    swapItem = wantsProtein && !dairyFree ? 'Greek yogurt' : 'Edamame'
  }

  if (analysis.id === 'eggs' && !wantsProtein && !wantsSteady) {
    recommendation = 'One gentle next step: fruit is already here. Whole-grain bread is an easy add if you want it another day.'
    swapItem = keto ? 'Eggs' : 'Whole-grain bread'
  }

  if (feelBetter && !wantsProtein && !wantsSteady) {
    recommendation = 'One gentle next step: nothing here needs fixing. If a later snack sounds good, fruit is enough.'
    swapItem = 'Apples'
  }

  if (awareOnly) {
    recommendation = 'A small idea for your next meal: notice one thing you enjoyed about this plate. That counts.'
    swapItem = 'Fresh berries'
  }

  if (wantsSteady) {
    recommendation = dairyFree
      ? 'One gentle next step: tofu or edamame later can make the meal feel steadier. This is general wellness guidance, not medical advice.'
      : 'One gentle next step: Greek yogurt, tofu, or edamame later can make the meal feel steadier. This is general wellness guidance, not medical advice.'
    swapItem = dairyFree ? 'Edamame' : 'Greek yogurt'
  }

  if (keto) {
    swapItem = vegan ? 'Firm tofu' : 'Eggs'
    recommendation = 'Try adding eggs or tofu if that fits the pattern you chose. Skip it if it does not.'
  }

  if (nutFree && /peanut|almond/.test(swapItem)) {
    swapItem = 'Sunflower seed butter'
    recommendation = 'Try adding sunflower seed butter if you want this to last longer. It keeps nuts off the list.'
  }

  if (/gluten/.test(notes) && /bread|pita/.test(swapItem)) {
    swapItem = 'Corn tortillas'
    recommendation = 'Try corn tortillas if you want something sturdy that skips gluten.'
  }

  const budgetNote = tight
    ? 'A budget-friendly swap: dried lentils or bananas usually cost less, and they still help.'
    : null
  if (tight && !keto && swapItem !== 'Dried lentils') {
    swapItem = analysis.id === 'eggs' ? 'Bananas' : 'Dried lentils'
  }

  const custom = profile.goalCustom.trim()
  if (custom && !wantsProtein && !wantsSteady && !feelBetter && !awareOnly) {
    recommendation = `A small idea, with your words in mind (“${custom}”): ${recommendation.charAt(0).toLowerCase()}${recommendation.slice(1)}`
  }

  return {
    summary: analysis.summary,
    recommendation,
    why: analysis.why,
    swapItem,
    budgetNote,
  }
}
