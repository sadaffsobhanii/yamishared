// Nutrition for the foods Yami spots in a photo, from USDA FoodData Central.
// https://fdc.nal.usda.gov/api-guide — free key from https://api.data.gov/signup (DEMO_KEY works for light testing).

export type Nutrition = {
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

function words(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.replace(/(es|s)$/, ''))
}

// Prefer the plain food ("Black beans, NFS") over dishes that contain it ("Black bean salad").
function rank(query: string, food: FdcFood) {
  const want = words(query)
  const desc = food.description.toLowerCase()
  const all = words(desc)
  if (!want.every(word => all.includes(word))) return -1
  const first = words(desc.split(',')[0])
  let score = 100
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
    const raw = localStorage.getItem(`usda:${key}`)
    return raw ? (JSON.parse(raw) as Nutrition | null) : undefined
  } catch {
    return undefined
  }
}

function writeCache(key: string, value: Nutrition | null) {
  try {
    localStorage.setItem(`usda:${key}`, JSON.stringify(value))
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
  if (!foods.some(food => rank(query, food) >= 0)) foods = await search(query, 'SR Legacy,Foundation')
  const best = foods
    .map(food => ({ food, score: rank(query, food) }))
    .filter(entry => entry.score >= 0)
    .sort((a, b) => b.score - a.score)[0]?.food
  if (!best) return null
  const { grams, label } = portion(best)
  const per100 = (number: string) => best.foodNutrients.find(n => n.nutrientNumber === number)?.value ?? 0
  const amount = (number: string, digits = 0) => {
    const value = (per100(number) * grams) / 100
    const scale = 10 ** digits
    return Math.round(value * scale) / scale
  }
  return {
    name,
    match: best.description,
    fdcId: best.fdcId,
    grams: Math.round(grams),
    portion: label,
    calories: amount(N.calories),
    protein: amount(N.protein, 1),
    fat: amount(N.fat, 1),
    carbs: amount(N.carbs, 1),
    fiber: amount(N.fiber, 1),
    sugar: amount(N.sugar, 1),
    sodium: amount(N.sodium),
  }
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
  return `https://fdc.nal.usda.gov/food-details/${n.fdcId}/nutrients`
}
