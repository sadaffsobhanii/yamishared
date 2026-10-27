import { FOODS, goal, isVeg, type Food, type ListItem, type LoggedMeal, type Profile, type SleepLog } from './model'

export const LIFE = ['Coffee', 'Stressed', 'Feeling off', 'On my period']

export const SECTION: Record<string, string> = {
  'Greek yogurt': 'Dairy', Yogurt: 'Dairy', Eggs: 'Dairy and eggs', Egg: 'Dairy and eggs', Milk: 'Dairy', Cheese: 'Dairy',
  Tofu: 'Refrigerated', Edamame: 'Frozen', Spinach: 'Produce', Strawberries: 'Produce', Berries: 'Produce', Bananas: 'Produce',
  Banana: 'Produce', Apples: 'Produce', Avocado: 'Produce', Broccoli: 'Produce', Carrots: 'Produce', Tomato: 'Produce',
  Greens: 'Produce', Oranges: 'Produce', Watermelon: 'Produce', Chicken: 'Meat', Salmon: 'Seafood', 'Black beans': 'Canned goods',
  Beans: 'Canned goods', Chickpeas: 'Canned goods', Lentils: 'Pantry', Oats: 'Pantry', 'Brown rice': 'Pantry', Rice: 'Pantry',
  'Whole grain bread': 'Bakery', Toast: 'Bakery', 'Peanut butter': 'Pantry', Nuts: 'Snacks', Almonds: 'Snacks', Crackers: 'Snacks', Pretzels: 'Snacks',
  'Electrolyte drink': 'Drinks', Soup: 'Soups', Quinoa: 'Pantry', Hummus: 'Refrigerated', Pasta: 'Pantry',
}

export function sleepGoalHours(P: Profile) {
  const n = parseFloat(P.sleepGoal)
  return Number.isFinite(n) ? n : 8
}

export function shopStore(P: Profile) {
  const inStore = P.stores.filter(name => !/online|instacart/i.test(name))
  if (inStore.length) return inStore[0]
  if (P.stores.some(name => /online|instacart/i.test(name))) return 'Instacart'
  return P.storeNote || 'your store'
}

export function ordersOnline(P: Profile) {
  return !P.stores.some(name => !/online|instacart/i.test(name)) && P.stores.some(name => /online|instacart/i.test(name))
}

export function offersInstacart(P: Profile) {
  return P.stores.some(name => /online|instacart/i.test(name))
}

export function instacartLink(items: string[]) {
  return `https://www.instacart.com/store/s?k=${encodeURIComponent(items.join(' '))}`
}

const SHELF: Record<string, number> = {
  Eggs: 3.49, Egg: 0.39, 'Greek yogurt': 4.49, Yogurt: 3.99, Tofu: 2.69, Milk: 3.29, Cheese: 4.99,
  Spinach: 2.49, Strawberries: 3.99, Berries: 4.49, Bananas: 1.99, Banana: 0.29, Apples: 1.49,
  Avocado: 1.29, Broccoli: 2.29, Carrots: 1.19, Tomato: 0.89, Greens: 3.49, Oats: 3.29,
  'Black beans': 0.99, Beans: 0.99, Chickpeas: 1.29, Lentils: 1.49, Rice: 2.49, 'Brown rice': 2.99,
  Toast: 3.49, 'Whole grain bread': 3.99, 'Electrolyte drink': 1.79, Chicken: 6.99, Salmon: 8.99,
  Noodles: 1.49, Pasta: 1.29, Hummus: 3.49, Quinoa: 4.29, 'Peanut butter': 3.79,
}

const STORE_RATE: Record<string, number> = {
  "Trader Joe's": 1,
  Ralphs: 1.14,
  Target: 1.08,
  'Whole Foods': 1.32,
  Costco: 0.84,
  Sprouts: 1.16,
  'A local market': 1.2,
  Instacart: 1.22,
}

export function cartPrice(name: string, store: string) {
  const base = SHELF[name] ?? 3.29
  const rate = STORE_RATE[store] ?? 1
  return Math.round(base * rate * 100) / 100
}

export function dollars(amount: number) {
  return `$${amount.toFixed(2)}`
}

export function withCartItem(list: ListItem[], name: string, from: string, P: Profile, online = false) {
  const store = online ? 'Instacart' : shopStore(P)
  const section = SECTION[name] || 'Pantry'
  const price = cartPrice(name, store)
  const index = list.findIndex(item => item.n.toLowerCase() === name.toLowerCase())
  if (index >= 0) return list.map((item, i) => i === index ? { ...item, from, done: false, store, section, price } : item)
  return [...list, { n: name, from, store, section, price }]
}

export function orderItems(name: string) {
  const text = name.toLowerCase()
  const found = Object.keys(FOODS).filter(key => new RegExp('\\b' + key.toLowerCase().split(' ')[0]).test(text))
  return found.length ? found : [name]
}

// Foods saved with each logged meal (from a photo or a barcode label) count too, not only the ones in FOODS.
function foodBook(meals: LoggedMeal[]): Record<string, Food | undefined> {
  return Object.assign({}, FOODS, ...meals.map(meal => meal.foods || {}))
}

export type FuelPart = { k: string; label: string; val: number | null; why: string; tip: string }

export function sleepScore(P: Profile, sleep: SleepLog) {
  if (!sleep.logged) return null
  const goal = sleepGoalHours(P)
  let score = sleep.h >= goal - 0.5 && sleep.h <= goal + 1.5
    ? 100
    : Math.max(20, 100 - Math.abs(sleep.h < goal ? goal - 0.5 - sleep.h : sleep.h - goal - 1.5) * 22)
  if (sleep.feel === 'Okay') score -= 8
  if (sleep.feel === 'Tired') score -= 18
  return Math.max(10, Math.round(score))
}

export function fuelToday(P: Profile, meals: LoggedMeal[], sleep: SleepLog) {
  const items = meals.flatMap(meal => meal.items || [])
  const book = foodBook(meals)
  const blank: Food = { p: 0, f: 0, t: [], whole: true }
  const info = items.map(name => book[name] || blank)
  const has = meals.length > 0
  const mealQuality = has ? Math.round(meals.reduce((sum, meal) => sum + (meal.score || 0), 0) / meals.length) : null
  const plants = new Set(items.filter(name => book[name]?.plant))
  const proteins = new Set(items.map(name => book[name]?.prot).filter(Boolean))
  const carbs = info.filter(food => food.carb)
  const wholeCarbs = carbs.filter(food => food.carb === 'whole').length
  const wholeFoods = info.filter(food => food.whole !== false).length
  const slept = sleepScore(P, sleep)
  const sleepWhy = slept == null
    ? 'Tell Yami how you slept to see this.'
    : `You slept ${sleep.h} hours${sleep.feel ? ` and felt ${sleep.feel.toLowerCase()}` : ''}. Your goal is ${P.sleepGoal && !P.sleepGoal.includes('sure') ? P.sleepGoal.replace(' or more', '+') : 'about 8 hours'}.`
  const parts: FuelPart[] = [
    { k: 'meal', label: 'Meal quality', val: mealQuality, why: has ? `Your meals today average ${mealQuality} for your goal.` : 'Log a meal to see this.', tip: 'Add a protein and a vegetable to your next meal.' },
    { k: 'sleep', label: 'Sleep', val: slept, why: sleepWhy, tip: 'Aim for a regular bedtime tonight.' },
    { k: 'plants', label: 'Plants', val: has ? Math.min(100, plants.size * 20) : null, why: has ? `${plants.size} different plant${plants.size === 1 ? '' : 's'} today (fruits, veggies, beans, grains). Five or more is great.` : 'Log a meal to see this.', tip: 'Add a new fruit or veggie, like berries or spinach.' },
    { k: 'protein', label: 'Protein types', val: has ? (proteins.size >= 3 ? 100 : proteins.size === 2 ? 85 : proteins.size === 1 ? 60 : 20) : null, why: has ? `${proteins.size} protein source${proteins.size === 1 ? '' : 's'} today${proteins.size ? ': ' + [...proteins].join(', ') : ''}. Mixing them is good for you.` : 'Log a meal to see this.', tip: isVeg(P) ? 'Try a different protein, like tofu, beans or yogurt.' : 'Try a different protein, like eggs, beans or fish.' },
    { k: 'carbs', label: 'Carb quality', val: has ? (carbs.length ? Math.round(40 + 60 * wholeCarbs / carbs.length) : 75) : null, why: has ? (carbs.length ? `${wholeCarbs} of ${carbs.length} carbs today were whole grains.` : 'No carbs logged yet today.') : 'Log a meal to see this.', tip: 'Swap white rice or bread for brown rice, oats or whole grain.' },
    { k: 'whole', label: 'Whole foods', val: has ? Math.round(100 * wholeFoods / Math.max(1, info.length)) : null, why: has ? `${wholeFoods} of ${info.length} foods today were whole or lightly processed.` : 'Log a meal to see this.', tip: 'Pick foods that look like they grew or were caught, not packaged.' },
  ]
  const weights: Record<string, number> = { meal: 0.35, sleep: 0.25, plants: 0.1, protein: 0.1, carbs: 0.1, whole: 0.1 }
  const known = parts.filter(part => part.val != null)
  const score = known.length
    ? Math.round(known.reduce((sum, part) => sum + (part.val || 0) * weights[part.k], 0) / known.reduce((sum, part) => sum + weights[part.k], 0))
    : null
  return { score, parts }
}

export function weekFuel(P: Profile, meals: LoggedMeal[]) {
  const scored = meals.map(meal => meal.score).filter((value): value is number => value != null)
  const mealsAvg = scored.length ? Math.round(scored.reduce((sum, value) => sum + value, 0) / scored.length) : 0
  const items = meals.flatMap(meal => meal.items || [])
  const book = foodBook(meals)
  const plants = new Set(items.filter(name => book[name]?.plant)).size
  const proteinG = meals.reduce((sum, meal) => sum + (meal.p || 0), 0)
  const fiberG = Math.round(items.reduce((sum, name) => sum + (book[name]?.f || 0), 0))
  const count = Math.max(1, meals.length)
  const g = goal(P)
  const proteinTarget = g === 'More protein' || g === 'Building strength' ? 30 : 20
  const fiberTarget = g === 'Steadier blood sugar' || g === 'More energy' ? 10 : 8
  const plantScore = Math.min(100, Math.round((plants / Math.max(3, meals.length)) * 100))
  const proteinScore = Math.min(100, Math.round((proteinG / count / proteinTarget) * 100))
  const fiberScore = Math.min(100, Math.round((fiberG / count / fiberTarget) * 100))
  const weights = g === 'More protein' || g === 'Building strength'
    ? { meals: 0.45, plants: 0.1, protein: 0.3, fiber: 0.15 }
    : g === 'More energy'
      ? { meals: 0.4, plants: 0.2, protein: 0.2, fiber: 0.2 }
      : g === 'Steadier blood sugar'
        ? { meals: 0.35, plants: 0.15, protein: 0.15, fiber: 0.35 }
        : g === 'Feeling lighter'
          ? { meals: 0.4, plants: 0.25, protein: 0.2, fiber: 0.15 }
          : { meals: 0.5, plants: 0.2, protein: 0.15, fiber: 0.15 }
  const score = meals.length
    ? Math.round(mealsAvg * weights.meals + plantScore * weights.plants + proteinScore * weights.protein + fiberScore * weights.fiber)
    : null
  const parts: FuelPart[] = [
    { k: 'meals', label: 'Meals', val: meals.length ? mealsAvg : null, why: meals.length ? `Your meal scores this week average ${mealsAvg}, for ${g.toLowerCase()}.` : 'Log a meal to start this week.', tip: 'Log another meal so the week average can move.' },
    { k: 'plants', label: 'Plants', val: meals.length ? plantScore : null, why: meals.length ? `${plants} different plant${plants === 1 ? '' : 's'} this week.` : 'Log a meal to see plants.', tip: 'Add a fruit, vegetable, bean, or grain.' },
    { k: 'protein', label: 'Protein', val: meals.length ? proteinScore : null, why: meals.length ? `${proteinG}g of protein across ${meals.length} meal${meals.length === 1 ? '' : 's'}.` : 'Log a meal to see protein.', tip: 'Add a protein you already like.' },
    { k: 'fiber', label: 'Fiber', val: meals.length ? fiberScore : null, why: meals.length ? `${fiberG}g of fiber this week.` : 'Log a meal to see fiber.', tip: 'Add beans, oats, fruit, or greens.' },
  ]
  return {
    score,
    parts,
    steps: [
      { label: 'Plants', val: meals.length ? plantScore : 0 },
      { label: 'Protein', val: meals.length ? proteinScore : 0 },
      { label: 'Fiber', val: meals.length ? fiberScore : 0 },
      { label: 'Meals', val: meals.length ? mealsAvg : 0 },
    ],
  }
}

const SAMPLE_WEEK = [
  { f: 72, s: 7.5 }, { f: 81, s: 7.2 }, { f: 68, s: 6.1 }, { f: 85, s: 8 }, { f: 74, s: 6.5 }, { f: 79, s: 8.5 }, { f: 80, s: 7.5 },
]

export function weekData(P: Profile, meals: LoggedMeal[], sleep: SleepLog, sampleWeek: boolean) {
  const today = (new Date().getDay() + 6) % 7
  const fuel = fuelToday(P, meals, sleep)
  const days = [0, 1, 2, 3, 4, 5, 6].map(index => {
    if (index === today) return { f: fuel.score, s: sleep.logged ? sleep.h : null, today: true, sample: false }
    if (sampleWeek) return { f: SAMPLE_WEEK[index].f, s: SAMPLE_WEEK[index].s, today: false, sample: true }
    return { f: null as number | null, s: null as number | null, today: false, sample: false }
  })
  const values = days.map(day => day.f).filter((value): value is number => value != null)
  return {
    days,
    today,
    sample: sampleWeek,
    avg: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0,
    fuel,
  }
}

export function weekNutrition(meals: LoggedMeal[], sample: boolean) {
  const items = meals.flatMap(meal => meal.items || [])
  const book = foodBook(meals)
  const plants = new Set(items.filter(name => book[name]?.plant))
  const proteins = new Set(items.map(name => book[name]?.prot).filter(Boolean))
  const blank: Food = { p: 0, f: 0, t: [], whole: true }
  const info = items.map(name => book[name] || blank)
  const carbs = info.filter(food => food.carb)
  const wholeCarb = carbs.length ? Math.round(100 * carbs.filter(food => food.carb === 'whole').length / carbs.length) : null
  const whole = info.length ? Math.round(100 * info.filter(food => food.whole !== false).length / info.length) : null
  const fiber = Math.round(items.reduce((sum, name) => sum + (book[name]?.f || 0), 0))
  return {
    plants: plants.size + (sample ? 14 : 0),
    proteins: proteins.size + (sample ? 4 : 0),
    fiber: fiber + (sample ? 84 : 0),
    wholeCarb,
    whole,
  }
}

export function findGroceries(P: Profile, text: string) {
  const lower = text.toLowerCase()
  const found: string[] = []
  Object.keys(SECTION).forEach(name => {
    const key = name.toLowerCase()
    const pattern = new RegExp('\\b' + key.replace(/s$/, '') + '(s|es)?\\b')
    const stem = key.replace(/s$/, '')
    if (pattern.test(lower) && !found.some(item => item.toLowerCase().startsWith(stem) || key.startsWith(item.toLowerCase().replace(/s$/, '')))) found.push(name)
  })
  return found
    .filter(name => !found.some(other => other !== name && other.toLowerCase().includes(name.toLowerCase().replace(/s$/, ''))))
    .filter(name => !(isVeg(P) && (name === 'Chicken' || name === 'Salmon')) && !(P.diet.includes('Vegan') && ['Greek yogurt', 'Yogurt', 'Eggs', 'Egg', 'Milk', 'Cheese'].includes(name)))
}

export function drawRing(canvas: HTMLCanvasElement, score: number | null) {
  const context = canvas.getContext('2d')
  if (!context) return
  const width = canvas.width
  const center = width / 2
  context.clearRect(0, 0, width, width)
  for (let radius = width * 0.24; radius <= width * 0.48; radius += width * 0.022) {
    const count = Math.round(2 * Math.PI * radius / (width * 0.024))
    const tone = (radius - width * 0.24) / (width * 0.24)
    for (let i = 0; i < count; i++) {
      const angle = i / count * 2 * Math.PI - Math.PI / 2
      const on = score != null && i / count < score / 100
      context.beginPath()
      context.arc(center + radius * Math.cos(angle), center + radius * Math.sin(angle), width * (0.0065 + (1 - tone) * 0.0035), 0, 7)
      context.fillStyle = on
        ? `rgba(${Math.round(153 + 102 * tone)},${Math.round(204 * tone)},0,${0.95 - tone * 0.4})`
        : 'rgba(227,168,163,.28)'
      context.fill()
    }
  }
}
