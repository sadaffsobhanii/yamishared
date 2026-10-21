// Nutrition for the foods Yami spots in a photo, from USDA FoodData Central.
// https://fdc.nal.usda.gov/api-guide — free key from https://api.data.gov/signup (DEMO_KEY works for light testing).

export type Per100 = { calories: number; protein: number; fat: number; carbs: number; fiber: number; sugar: number; sodium: number }

export type Nutrition = {
  source: 'USDA' | 'Open Food Facts'
  name: string
  match: string
  fdcId: number
  grams: number
  portion: string
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  sugar: number
  sodium: number
  per100: Per100
  link: string
}

type FdcNutrient = { nutrientNumber: string; value: number }
type FdcMeasure = { disseminationText?: string; gramWeight?: number }
type FdcFood = { fdcId: number; description: string; dataType: string; foodNutrients: FdcNutrient[]; foodMeasures?: FdcMeasure[] }

const KEY = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY'
const SEARCH = 'https://api.nal.usda.gov/fdc/v1/foods/search'

// Yami's photo labels are short names; a few read better to USDA as a fuller phrase.
const ALIASES: Record<string, string> = {
  Toast: 'bread toasted',
  Greens: 'lettuce salad',
  Noodles: 'noodles cooked',
  Broth: 'broth',
  Salsa: 'salsa',
  Egg: 'egg',
  Rice: 'rice white cooked',
  'Brown rice': 'rice brown cooked',
  Chicken: 'chicken breast',
  Oats: 'oatmeal',
}

// USDA nutrient numbers (per 100 g in FNDDS and SR Legacy).
const N = { calories: '208', protein: '203', fat: '204', carbs: '205', fiber: '291', sugar: '269', sodium: '307' }

const DISHES = /\b(salad|sauce|soup|sandwich|dip|chips|with|and|baby|cake|pie|casserole|stew|burrito|taco)\b/

const memory = new Map<string, Promise<Nutrition | null>>()
const CACHE_VERSION = 2

function words(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.replace(/(es|s)$/, ''))
}

// Prefer the plain food ("Black beans, NFS") over dishes that contain it ("Black bean salad").
// The main food word must match; extra detail words ("cherry", "roasted") help but aren't required.
function rank(query: string, food: FdcFood) {
  const want = words(query)
  const desc = food.description.toLowerCase()
  const all = words(desc)
  const hits = want.filter(word => all.includes(word)).length
  if (!want.length || !all.includes(want[0]) || hits / want.length < 0.5) return -1
  const first = words(desc.split(',')[0])
  let score = (100 * hits) / want.length
  if (/,\s*nfs\b/.test(desc)) score += 40
  if (first.join(' ') === want.join(' ')) score += 30
  if (DISHES.test(desc.split(',')[0]) && !want.some(word => DISHES.test(word))) score -= 50
  score -= Math.max(0, first.length - want.length) * 8
  score -= desc.length * 0.2
  if (food.dataType === 'Survey (FNDDS)') score += 10
  return score
}

function portion(food: FdcFood) {
  const measures = food.foodMeasures || []
  const typical = measures.find(m => m.disseminationText === 'Quantity not specified' && m.gramWeight)
  const pick = typical || measures.find(m => m.gramWeight)
  if (pick?.gramWeight) return { grams: pick.gramWeight, label: typical ? 'a typical serving' : pick.disseminationText || 'a serving' }
  return { grams: 100, label: '100 g' }
}

function readCache(key: string): Nutrition | null | undefined {
  try {
    const raw = localStorage.getItem(`usda${CACHE_VERSION}:${key}`)
    return raw ? (JSON.parse(raw) as Nutrition | null) : undefined
  } catch {
    return undefined
  }
}

function writeCache(key: string, value: Nutrition | null) {
  try {
    localStorage.setItem(`usda${CACHE_VERSION}:${key}`, JSON.stringify(value))
  } catch {
    // Private mode or full storage: the in-memory cache still covers this session.
  }
}

async function search(query: string, dataType: string) {
  const url = `${SEARCH}?api_key=${encodeURIComponent(KEY)}&query=${encodeURIComponent(query)}&pageSize=25&dataType=${encodeURIComponent(dataType)}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`USDA ${response.status}`)
  const data = (await response.json()) as { foods?: FdcFood[] }
  return data.foods || []
}

async function fetchNutrition(name: string): Promise<Nutrition | null> {
  const query = ALIASES[name] || name
  let foods = await search(query, 'Survey (FNDDS)')
  // FNDDS has the serving sizes; only reach for SR Legacy when FNDDS can't match every word.
  const full = foods.some(food => words(food.description).filter(word => words(query).includes(word)).length === words(query).length)
  if (!full) foods = [...foods, ...(await search(query, 'SR Legacy,Foundation'))]
  const best = foods
    .map(food => ({ food, score: rank(query, food) }))
    .filter(entry => entry.score >= 0)
    .sort((a, b) => b.score - a.score)[0]?.food
  if (!best) return null
  const { grams, label } = portion(best)
  const value = (number: string) => best.foodNutrients.find(n => n.nutrientNumber === number)?.value ?? 0
  const per100: Per100 = {
    calories: value(N.calories),
    protein: value(N.protein),
    fat: value(N.fat),
    carbs: value(N.carbs),
    fiber: value(N.fiber),
    sugar: value(N.sugar),
    sodium: value(N.sodium),
  }
  return {
    ...atGrams(per100, grams),
    source: 'USDA',
    name,
    match: best.description,
    fdcId: best.fdcId,
    portion: label,
    per100,
    link: `https://fdc.nal.usda.gov/food-details/${best.fdcId}/nutrients`,
  }
}

const round = (value: number, digits = 0) => Math.round(value * 10 ** digits) / 10 ** digits

// The amounts for a given weight of food, from its per-100 g values.
export function atGrams(per100: Per100, grams: number) {
  const k = grams / 100
  return {
    grams: Math.round(grams),
    calories: round(per100.calories * k),
    protein: round(per100.protein * k, 1),
    fat: round(per100.fat * k, 1),
    carbs: round(per100.carbs * k, 1),
    fiber: round(per100.fiber * k, 1),
    sugar: round(per100.sugar * k, 1),
    sodium: round(per100.sodium * k),
  }
}

// Same food, resized to the amount actually on the plate.
export function resize(n: Nutrition, grams: number): Nutrition {
  return { ...n, ...atGrams(n.per100, grams) }
}

// Looks up one food, remembering answers so the same food is never fetched twice.
export function nutritionFor(name: string): Promise<Nutrition | null> {
  const key = name.trim().toLowerCase()
  if (!key) return Promise.resolve(null)
  const cached = readCache(key)
  if (cached !== undefined) return Promise.resolve(cached)
  let pending = memory.get(key)
  if (!pending) {
    pending = fetchNutrition(name.trim())
      .then(result => {
        writeCache(key, result)
        return result
      })
      .catch(() => {
        memory.delete(key)
        return null
      })
    memory.set(key, pending)
  }
  return pending
}

export function sourceLink(n: Nutrition) {
  return n.link
}
