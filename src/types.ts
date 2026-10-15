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

export type YamiMood = 'awake' | 'sleepy' | 'drowsy'

export type YamiCharacter = 'bunny' | 'chick' | 'moon'

export type YamiOutfit = 'none' | 'scarf' | 'bow' | 'flower' | 'cap'

export type MealTiming = {
  mood: YamiMood
  line: string
  meal: 'breakfast' | 'lunch' | 'dinner' | 'late-night' | 'between'
  status: 'early' | 'on-time' | 'late' | 'logged' | 'between' | 'quiet'
}

export type WidgetId = 'protein' | 'fiber' | 'water' | 'energy' | 'consistency' | 'macros' | 'calories' | 'weight'

export type LoveId = 'energy' | 'protein' | 'lighter' | 'strength' | 'blood-sugar' | 'peace' | 'eating-well'

export type SupportId =
  | 'what-to-eat'
  | 'ordering'
  | 'simple-meals'
  | 'planning'
  | 'consistent'
  | 'budget'
  | 'understanding'

export type DietChoice =
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'halal'
  | 'gluten-free'
  | 'dairy-free'
  | 'allergies'

export type PastChoice = 'first-time' | 'too-long' | 'numbers-stress' | 'lost-motivation'

export type CookFeel = 'rather-not' | 'simple' | 'few-times' | 'love-kitchen'

export type PrepHabit = 'not-really' | 'like-to-start' | 'sometimes' | 'every-week'

export type ShopFrequency = 'rarely' | 'couple-weeks' | 'weekly' | 'few-times'

export type StoreChoice =
  | 'trader-joes'
  | 'ralphs'
  | 'target'
  | 'whole-foods'
  | 'costco'
  | 'sprouts'
  | 'local'
  | 'instacart'

export type MealSources = {
  home: number
  delivery: number
  out: number
  prep: number
}

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
  loves: LoveId[]
  support: SupportId[]
  supportNote: string
  diets: string[]
  allergyNote: string
  doctorNote: string
  pastApps: string[]
  budget: string
  budgetMinded: boolean
  studentBudget: boolean
  shopMode: '' | 'in-store' | 'online' | 'both'
  shopStore: string
  shopStoreCustom: string
  shopStoreNote: string
  shopStores: StoreChoice[]
  shopFrequency: ShopFrequency | ''
  cookFeel: CookFeel | ''
  mealPrep: PrepHabit | ''
  mealSources: MealSources
  groceryBudget: number
  eatingOutBudget: number
  widgets: WidgetId[]
  insightWidgets: InsightWidgetId[]
  trackCalories: boolean
  trackWeight: boolean
  character: YamiCharacter
  outfit: YamiOutfit
  bestStreak: number
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
  loggedAt: number
  hadProtein: boolean
  suggestion?: string
}

export type Draft = {
  image: MealImage
  items: string[]
  analysisId: SampleId
  timing: MealTiming
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
  timing: MealTiming
}

export const emptyProfile: Profile = {
  name: '',
  languageInput: '',
  languageId: null,
  unrecognizedLanguage: null,
  goals: [],
  goalCustom: '',
  loves: [],
  support: [],
  supportNote: '',
  diets: [],
  allergyNote: '',
  doctorNote: '',
  pastApps: [],
  budget: '',
  budgetMinded: false,
  studentBudget: false,
  shopMode: '',
  shopStore: '',
  shopStoreCustom: '',
  shopStoreNote: '',
  shopStores: [],
  shopFrequency: '',
  cookFeel: '',
  mealPrep: '',
  mealSources: { home: 1, delivery: 1, out: 1, prep: 1 },
  groceryBudget: 50,
  eatingOutBudget: 40,
  widgets: [],
  insightWidgets: [],
  trackCalories: false,
  trackWeight: false,
  character: 'bunny',
  outfit: 'none',
  bestStreak: 0,
}

export function scoreTone(score: number): 'high' | 'mid' | 'low' {
  if (score >= 75) return 'high'
  if (score >= 50) return 'mid'
  return 'low'
}
