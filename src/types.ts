export type PhraseKind = 'greeting' | 'endearment' | 'praise' | 'encouragement' | 'enjoy'

export type Phrase = {
  text: string
  romanization?: string
}

export type Language = {
  id: string
  englishName: string
  nativeName: string
  nativeRomanization?: string
  aliases: string[]
  phrases: Record<PhraseKind, Phrase>
}

export type SampleId = 'eggs' | 'smoothie' | 'pasta' | 'salad' | 'soup' | 'other'

export type MealImage =
  | { kind: 'sample'; id: SampleId }
  | { kind: 'photo'; src: string }
  | { kind: 'none' }

export type Pace = '' | 'gentle' | 'steady' | 'detailed'

export type FavoriteMeal = {
  id: string
  image: MealImage
  items: string[]
  analysisId: SampleId
}

// Prototype study arms from PRD section 8. The first value of each is the default.
export type Variants = {
  onboarding: 'voice' | 'quiz'
  logging: 'edit' | 'photo-only'
  recommendation: 'next-step' | 'data-only'
  grocery: 'cart' | 'list-only'
  checkin: 'on' | 'off'
}

export type WidgetId = 'protein' | 'fiber' | 'water' | 'energy' | 'consistency' | 'macros' | 'calories' | 'weight'

export type InsightWidgetId =
  | 'protein'
  | 'fiber'
  | 'water'
  | 'energy'
  | 'consistency'
  | 'variety'
  | 'grocery'
  | 'wins'
  | 'history'
  | 'goal'
  | 'macros'
  | 'glucose'

export type Analysis = {
  id: SampleId
  keywords: string[]
  items: string[]
  score: number
  summary: string
  why: string
  swapItem: string
}

export type Profile = {
  name: string
  languageInput: string
  languageId: string | null
  unrecognizedLanguage: string | null
  goals: string[]
  goalCustom: string
  diets: string[]
  allergyNote: string
  doctorNote: string
  pastApps: string[]
  budget: string
  studentBudget: boolean
  shopMode: '' | 'in-store' | 'online' | 'both'
  shopStore: string
  shopStoreCustom: string
  widgets: WidgetId[]
  insightWidgets: InsightWidgetId[]
  trackCalories: boolean
  trackWeight: boolean
  pace: Pace
  reminders: boolean
  reminderTime: string
  quietStart: string
  quietEnd: string
}

export type GroceryItem = {
  id: string
  text: string
  done: boolean
  fromMeal?: boolean
}

export type LoggedMeal = {
  id: string
  image: MealImage
  items: string[]
  summary: string
  time: string
  hadProtein: boolean
  suggestion?: string
}

export type Draft = {
  image: MealImage
  items: string[]
  analysisId: SampleId
}

export type MealResult = {
  image: MealImage
  items: string[]
  analysis: Analysis
  summary: string
  recommendation: string
  why: string
  swapItem: string
  budgetNote: string | null
  added: boolean
}

export const emptyProfile: Profile = {
  name: '',
  languageInput: '',
  languageId: null,
  unrecognizedLanguage: null,
  goals: [],
  goalCustom: '',
  diets: [],
  allergyNote: '',
  doctorNote: '',
  pastApps: [],
  budget: '',
  studentBudget: false,
  shopMode: '',
  shopStore: '',
  shopStoreCustom: '',
  widgets: [],
  insightWidgets: [],
  trackCalories: false,
  trackWeight: false,
  pace: '',
  reminders: false,
  reminderTime: '12:30',
  quietStart: '21:00',
  quietEnd: '08:00',
}

export function scoreTone(score: number): 'high' | 'mid' | 'low' {
  if (score >= 75) return 'high'
  if (score >= 50) return 'mid'
  return 'low'
}
