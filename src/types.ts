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

export type SampleId = 'eggs' | 'smoothie' | 'pasta' | 'salad' | 'soup'

export type MealImage =
  | { kind: 'sample'; id: SampleId }
  | { kind: 'photo'; src: string }

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
}

export function scoreTone(score: number): 'high' | 'mid' | 'low' {
  if (score >= 75) return 'high'
  if (score >= 50) return 'mid'
  return 'low'
}
