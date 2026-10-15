export type Food = { p: number; f: number; c?: number; t: string[]; carb?: 'refined' | 'whole'; whole?: boolean; plant?: boolean; prot?: string }
export type Sample = { k: string; n: string; items: string[]; bg: string }
export type DeckCard = { k?: string; n: string; m: string; d: string; bg: string; veg: boolean; img?: string | null; src?: string; link?: string }
export type MenuItem = { n: string; p: number; f: number; c: number; veg: boolean; tip: string }
export type Sources = { cook: number; delivery: number; dining: number; prep: number }
export type ShowFlags = { protein: boolean; water: boolean; calories: boolean; weight: boolean; fiber: boolean }

export type Profile = {
  name: string
  goals: string[]
  support: string[]
  supportNote: string
  challenge: string[]
  challengeNote: string
  diet: string[]
  goalNote: string
  allergies: string[]
  allergyNote: string
  healthIssues: string[]
  healthIssueNote: string
  tried: string
  sources: Sources
  cooking: string
  prep: string
  shopFreq: string
  stores: string[]
  storeNote: string
  budgetG: number
  budgetE: number
  show: ShowFlags
  healthNote: string
  health: boolean
  onboarded: boolean
  sleepGoal: string
}

export type LoggedMeal = { n: string; p: number; veg: boolean; score?: number; k?: string | null; items?: string[] }
export type ListItem = { n: string; done?: boolean; from?: string; store?: string; section?: string; price?: number }
export type Rec = { meal: string; k?: string | null; bg?: string; img?: string | null; tip: string; add: string | null; store?: string; section?: string; day: string }
export type SleepLog = { h: number; feel: string; logged: boolean; touched?: boolean }
export type LogDraft = {
  step: 'start' | 'analyzing' | 'confirm' | 'result'
  img: string | null
  k: string | null
  bg: string
  items: string[]
  name: string
  added?: boolean
}
export type OrderDraft = { rest: string; meal: string }
export type ChatMessage = { role: 'user' | 'assistant'; content: string; added?: boolean }

export const DEFAULT: Profile = {
  name: '',
  goals: [],
  support: [],
  supportNote: '',
  challenge: [],
  challengeNote: '',
  diet: [],
  goalNote: '',
  allergies: [],
  allergyNote: '',
  healthIssues: [],
  healthIssueNote: '',
  tried: '',
  sources: { cook: 2, delivery: 2, dining: 1, prep: 0 },
  cooking: '',
  prep: '',
  shopFreq: '',
  stores: [],
  storeNote: '',
  budgetG: 50,
  budgetE: 40,
  show: { protein: true, water: true, calories: false, weight: false, fiber: false },
  healthNote: '',
  health: false,
  onboarded: false,
  sleepGoal: '',
}

export const FOODS: Record<string, Food> = {
  'Rice': { p: 4, f: 1, c: 200, t: ['carb'], carb: 'refined', whole: true },
  'Brown rice': { p: 5, f: 3, c: 215, t: ['carb'], carb: 'whole', whole: true },
  'Black beans': { p: 8, f: 8, c: 110, t: ['protein', 'fiber'], plant: true, prot: 'Beans', whole: true },
  'Salsa': { p: 0, f: 1, c: 20, t: ['veg'], plant: true, whole: true },
  'Chicken': { p: 30, f: 0, c: 180, t: ['protein', 'meat'], prot: 'Chicken', whole: true },
  'Toast': { p: 4, f: 2, c: 80, t: ['carb'], carb: 'refined', whole: false },
  'Avocado': { p: 2, f: 7, c: 160, t: ['fat', 'fiber'], plant: true, whole: true },
  'Noodles': { p: 7, f: 2, c: 220, t: ['carb'], carb: 'refined', whole: false },
  'Broth': { p: 2, f: 0, c: 15, t: [], whole: false },
  'Egg': { p: 6, f: 0, c: 70, t: ['protein'], prot: 'Eggs', whole: true },
  'Pancakes': { p: 6, f: 1, c: 180, t: ['carb'], carb: 'refined', whole: false },
  'Syrup': { p: 0, f: 0, c: 100, t: [], whole: false },
  'Strawberries': { p: 1, f: 3, c: 50, t: ['fruit', 'fiber'], plant: true, whole: true },
  'Greens': { p: 2, f: 3, c: 20, t: ['veg', 'fiber'], plant: true, whole: true },
  'Tomato': { p: 1, f: 1, c: 25, t: ['veg'], plant: true, whole: true },
  'Chickpeas': { p: 7, f: 6, c: 120, t: ['protein', 'fiber'], plant: true, prot: 'Chickpeas', whole: true },
  'Tofu': { p: 15, f: 1, c: 140, t: ['protein'], plant: true, prot: 'Tofu', whole: true },
  'Spinach': { p: 1, f: 1, c: 20, t: ['veg'], plant: true, whole: true },
  'Greek yogurt': { p: 15, f: 0, c: 100, t: ['protein'], prot: 'Yogurt', whole: true },
  'Oats': { p: 5, f: 4, c: 150, t: ['carb'], carb: 'whole', whole: true, plant: true },
}

export const SAMPLES: Sample[] = [
  { k: 'burrito', n: 'Burrito bowl', items: ['Rice', 'Black beans', 'Chicken', 'Salsa'], bg: '#E7DDF9' },
  { k: 'toast', n: 'Avocado toast', items: ['Toast', 'Avocado'], bg: '#FFF0C9' },
  { k: 'ramen', n: 'Ramen', items: ['Noodles', 'Broth', 'Egg'], bg: '#FBD9E1' },
  { k: 'pancakes', n: 'Pancakes', items: ['Pancakes', 'Syrup', 'Strawberries'], bg: '#E2EEFB' },
]

export const DECK: DeckCard[] = [
  { k: 'salad', n: 'Salmon grain bowl', m: 'High protein, about 15 minutes', d: 'Aug 3', bg: '#E7DDF9', veg: false },
  { k: 'ramen', n: 'Miso ramen', m: 'Cozy, about 20 minutes', d: 'Jul 21', bg: '#FBD9E1', veg: true },
  { k: 'taco', n: 'Tofu tacos', m: 'Plant protein, about 15 minutes', d: 'Sep 9', bg: '#FFF0C9', veg: true },
  { k: 'pancakes', n: 'Banana pancakes', m: 'Weekend breakfast', d: 'Jun 30', bg: '#E2EEFB', veg: true },
  { k: 'curry', n: 'Chickpea curry', m: 'High fiber, meal-prep friendly', d: 'Sep 22', bg: '#FDE7B0', veg: true },
  { k: 'bagel', n: 'Bagel and eggs', m: 'Quick breakfast', d: 'Aug 18', bg: '#F3ECFF', veg: true },
  { k: 'sushi', n: 'Sushi night', m: 'With friends', d: 'Jul 4', bg: '#E2EEFB', veg: false },
]

export const MENUS: Record<string, MenuItem[]> = {
  Chipotle: [
    { n: 'Chicken burrito bowl', p: 42, f: 12, c: 640, veg: false, tip: 'Ask for fajita veggies and salsa instead of sour cream.' },
    { n: 'Sofritas bowl', p: 22, f: 16, c: 560, veg: true, tip: 'Add black beans and fajita veggies for extra fiber.' },
    { n: 'Steak salad', p: 35, f: 9, c: 480, veg: false, tip: 'Get the vinaigrette on the side.' },
  ],
  Sweetgreen: [
    { n: 'Harvest bowl', p: 36, f: 8, c: 700, veg: false, tip: 'Ask for half the dressing.' },
    { n: 'Shroomami with tofu', p: 24, f: 10, c: 620, veg: true, tip: 'Add extra tofu for more protein.' },
    { n: 'Kale Caesar with chicken', p: 35, f: 6, c: 430, veg: false, tip: 'Add a side of quinoa if you are extra hungry.' },
  ],
  CAVA: [
    { n: 'Chicken and rice bowl', p: 40, f: 9, c: 690, veg: false, tip: 'Swap half the rice for greens.' },
    { n: 'Falafel greens and grains', p: 16, f: 13, c: 650, veg: true, tip: 'Add hummus and lentils for more protein.' },
    { n: 'Harissa avocado bowl', p: 34, f: 11, c: 780, veg: false, tip: 'Keep it to one dip.' },
  ],
  'Panda Express': [
    { n: 'Grilled teriyaki chicken with super greens', p: 36, f: 5, c: 390, veg: false, tip: 'Choose super greens instead of fried rice.' },
    { n: 'Eggplant tofu with super greens', p: 9, f: 7, c: 420, veg: true, tip: 'Pair with a protein snack later.' },
    { n: 'Broccoli beef with brown rice', p: 18, f: 6, c: 570, veg: false, tip: 'Ask for half rice, half super greens.' },
  ],
  Subway: [
    { n: 'Rotisserie chicken on multigrain', p: 29, f: 5, c: 350, veg: false, tip: 'Load up on spinach, peppers and cucumbers.' },
    { n: 'Veggie Delite with avocado', p: 9, f: 8, c: 290, veg: true, tip: 'Add a bag of baked chips or fruit on the side.' },
    { n: 'Turkey on multigrain', p: 20, f: 5, c: 280, veg: false, tip: 'Add extra veggies, skip the mayo.' },
  ],
}

export const INTENT: Record<string, string> = {
  'Knowing what to eat': 'Try one new Yami suggestion this week.',
  'Ordering healthier': 'Use Order smart for two deliveries.',
  'Cooking simple meals': 'Cook one 15-minute dinner, twice.',
  'Planning my meals': 'Pick three meals on your board.',
  'Staying consistent': 'Log one meal a day, five days.',
  'Eating well on a budget': 'One grocery run, one plan.',
  'Understanding nutrition': 'Tap "Why?" on three tips.',
}

export const CINTENT: Record<string, string> = {
  'Overeating at meals': 'Pause halfway through dinner, three nights.',
  'Sugary snacks': 'Swap one sugary snack for fruit, three times.',
  'A sweet tooth': 'Pair dessert with protein, like yogurt and berries.',
  'Snacking throughout the day': 'Plan two snacks a day, ahead of time.',
  'Late-night eating': 'A filling dinner with protein, five nights.',
  'Skipping meals': 'Eat something within two hours of waking.',
  'Eating when stressed or bored': 'Check in with yourself before one snack a day.',
  'Sugary drinks': 'Swap one sugary drink for sparkling water each day.',
}

export type ChipKey = 'goals' | 'support' | 'challenge' | 'diet' | 'stores' | 'allergies' | 'healthIssues'
export type SingleKey = 'tried' | 'cooking' | 'prep' | 'shopFreq' | 'sleepGoal'
export type NoteKey = 'supportNote' | 'challengeNote' | 'storeNote' | 'goalNote' | 'allergyNote' | 'healthIssueNote'

export type Question =
  | { type: 'chips'; key: ChipKey | SingleKey; max: number; q: string; hint?: string; opts: string[]; text?: { key: NoteKey; ph: string }; textWhen?: string }
  | { type: 'sources'; q: string }
  | { type: 'budget'; q: string }

export const SRC: { key: keyof Sources; label: string }[] = [
  { key: 'cook', label: 'Cooking at home' },
  { key: 'delivery', label: 'Ordering delivery' },
  { key: 'dining', label: 'Dining hall or eating out' },
  { key: 'prep', label: 'Meal prep' },
]

export const QUESTIONS: Question[] = [
  { type: 'chips', key: 'goals', max: 2, q: 'What would you love more of right now?', hint: 'Choose up to two', opts: ['More energy', 'More protein', 'Feeling lighter', 'Building strength', 'Steadier blood sugar', 'Feeling at peace with food', 'Simply eating well', 'Something else'], text: { key: 'goalNote', ph: 'What else would you love more of?' }, textWhen: 'Something else' },
  { type: 'chips', key: 'support', max: 2, q: 'Where do you need the most support right now?', hint: 'Choose up to two', opts: ['Knowing what to eat', 'Ordering healthier', 'Cooking simple meals', 'Planning my meals', 'Staying consistent', 'Eating well on a budget', 'Understanding nutrition'], text: { key: 'supportNote', ph: "Anything else you'd like us to know? (optional)" } },
  { type: 'chips', key: 'challenge', max: 2, q: 'What tends to trip you up?', hint: 'Choose up to two', opts: ['Overeating at meals', 'Sugary snacks', 'A sweet tooth', 'Snacking throughout the day', 'Late-night eating', 'Skipping meals', 'Eating when stressed or bored', 'Sugary drinks'], text: { key: 'challengeNote', ph: 'Something else? (optional)' } },
  { type: 'chips', key: 'diet', max: 10, q: 'How do you like to eat?', hint: 'Choose as many as you like', opts: ['No preference', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Halal', 'Gluten-free', 'Dairy-free', 'I have allergies', 'I have health concerns'] },
  { type: 'chips', key: 'tried', max: 1, q: 'Have you tried a food app before?', opts: ['This is my first time', 'Logging took too long', 'The numbers felt stressful', 'I lost motivation along the way'] },
  { type: 'sources', q: 'Where do most of your meals come from?' },
  { type: 'chips', key: 'cooking', max: 1, q: 'How do you feel about cooking?', opts: ["I'd rather not cook", 'Simple meals are my thing', 'I cook a few times a week', 'I love being in the kitchen'] },
  { type: 'chips', key: 'prep', max: 1, q: 'Do you meal prep?', opts: ['Not really', "I'd like to start", 'Sometimes', 'Every week'] },
  { type: 'chips', key: 'shopFreq', max: 1, q: 'How often do you shop for groceries?', opts: ['Rarely', 'Every couple of weeks', 'Once a week', 'A few times a week'] },
  { type: 'chips', key: 'stores', max: 9, q: 'Where do you like to shop?', hint: 'Choose as many as you like', opts: ["Trader Joe's", 'Ralphs', 'Target', 'Whole Foods', 'Costco', 'Sprouts', 'A local market', 'Online, like Instacart'], text: { key: 'storeNote', ph: 'Another store we should know about? (optional)' } },
  { type: 'budget', q: 'What feels comfortable to spend on food each week?' },
  { type: 'chips', key: 'sleepGoal', max: 1, q: 'How much sleep helps you feel your best?', opts: ['6 hours', '7 hours', '8 hours', '9 hours or more', "I'm not sure yet"] },
]

export const ALLERGY_Q: Question = {
  type: 'chips', key: 'allergies', max: 12, q: 'What are you allergic to?', hint: 'Choose as many as you like',
  opts: ['Peanuts', 'Tree nuts', 'Milk', 'Eggs', 'Shellfish', 'Fish', 'Wheat', 'Soy', 'Sesame', 'Something else'],
  text: { key: 'allergyNote', ph: 'Anything else you are allergic to?' }, textWhen: 'Something else',
}

export const HEALTH_Q: Question = {
  type: 'chips', key: 'healthIssues', max: 12, q: 'What health issues are you eating for?', hint: 'Choose as many as you like',
  opts: ['Diabetes', 'Prediabetes', 'High blood pressure', 'High cholesterol', 'PCOS', 'IBS', 'Something else'],
  text: { key: 'healthIssueNote', ph: 'Anything else you are eating for?' }, textWhen: 'Something else',
}

export const FREQ = ['Rarely', 'Sometimes', 'Often', 'Most days']
export const ENERGY = [
  { e: '1f634', l: 'Tired' },
  { e: '1f610', l: 'Okay' },
  { e: '1f60a', l: 'Good' },
  { e: '1f929', l: 'Great' },
]

export function money(n: number) {
  return n >= 150 ? '$150+' : '$' + n
}

export function goal(P: Profile) {
  const named = P.goals.find(item => item !== 'Something else')
  if (named) return named
  if (P.goalNote.trim()) return P.goalNote.trim()
  return 'Simply eating well'
}

export function isVeg(P: Profile) {
  return P.diet.includes('Vegetarian') || P.diet.includes('Vegan')
}

export function topSource(P: Profile) {
  const s = P.sources
  return (Object.entries(s) as [keyof Sources, number][]).sort((a, b) => b[1] - a[1])[0][0]
}

export function planLine(P: Profile) {
  const g = goal(P)
  const src = topSource(P)
  const how: Record<keyof Sources, string> = {
    cook: 'easy home-cooked ideas',
    delivery: 'smart delivery orders',
    dining: 'good picks when you eat out',
    prep: 'a simple weekly prep plan',
  }
  const total = P.budgetG + P.budgetE
  return `We'll focus on ${g.toLowerCase()}, with ${how[src]}, on about ${money(total)} a week.`
}

export function proteinToday(meals: LoggedMeal[]) {
  return meals.reduce((a, m) => a + (m.p || 0), 0)
}

export function foodCalories(name: string) {
  return FOODS[name]?.c ?? 80
}

export function plateCalories(items: string[]) {
  return items.reduce((sum, name) => sum + foodCalories(name), 0)
}

export function dayTotals(meals: LoggedMeal[]) {
  let fiber = 0
  let calories = 0
  meals.forEach(meal => {
    const items = meal.items || []
    items.forEach(name => { fiber += FOODS[name]?.f || 0 })
    const menu = Object.values(MENUS).flat().find(item => item.n.toLowerCase() === meal.n.toLowerCase())
    calories += menu ? menu.c : items.length ? plateCalories(items) : Math.round((meal.p || 0) * 8)
  })
  return { protein: proteinToday(meals), fiber: Math.round(fiber), calories }
}

export function yamiLine(P: Profile, meals: LoggedMeal[]) {
  const n = meals.length
  const p = proteinToday(meals)
  if (!n) return `Welcome, ${P.name || 'friend'}. Snap your first meal and I'll suggest one small next step.`
  if (p >= 60) return `You're at ${p}g of protein today. That's your energy showing up.`
  if (meals.some(m => m.veg)) return 'Nice, you got some veggies in today. One small step at a time.'
  return `${n} meal${n > 1 ? 's' : ''} logged today. No pressure, no perfect. I'm right here.`
}

export function advise(P: Profile, items: string[]) {
  const info = items.map(n => FOODS[n] || { p: 3, f: 1, t: [] as string[] })
  const p = info.reduce((a, x) => a + x.p, 0)
  const f = info.reduce((a, x) => a + x.f, 0)
  const c = plateCalories(items)
  const has = (t: string) => info.some(x => x.t.includes(t))
  const hasVeg = has('veg')
  const vegan = P.diet.includes('Vegan')
  const veg = isVeg(P)
  const g = goal(P)
  const missing: string[] = []
  const gaps: string[] = []
  if (p < 20) {
    missing.push(vegan ? 'Tofu' : veg ? 'Greek yogurt' : 'Eggs')
    gaps.push('protein')
  }
  if (!hasVeg) {
    missing.push('Spinach')
    gaps.push('vegetables')
  } else if (f < 8) {
    missing.push('Strawberries')
    gaps.push('fiber')
  }
  let praise = p >= 25 ? 'Solid protein!' : f >= 8 ? 'Nice fiber!' : hasVeg ? 'Nice veggies!' : 'Thanks for logging!'
  let tip: string
  let why: string
  let mood: 'happy' | 'wink' | 'proud' = 'happy'
  if (!missing.length) {
    mood = 'proud'
    praise = 'This is a great plate!'
    tip = 'Protein, fiber and veggies all in one. Keep enjoying meals like this.'
    why = 'This meal has a good balance. Nothing is missing, so just remember a glass of water.'
  } else {
    mood = gaps.includes('protein') ? 'happy' : 'wink'
    const list = missing.length === 1 ? missing[0] : `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}`
    tip = `Your plate is missing ${gaps.join(' and ')}. ${list} would fill that in.`
    why = `A plate feels steadier with protein, vegetables and some fiber. Since your goal is ${g.toLowerCase()}, these are the pieces this meal was light on.`
  }
  if (P.tried === 'The numbers felt stressful') tip = tip.replace(/\d+g /g, '')
  const offers = missing.map((item, index) => ({ item, gap: gaps[index] || 'balance' }))
  return { p, f, c, praise, tip, why, add: missing[0] ?? null, missing, offers, mood, hasVeg, score: mealScore(P, p, f, hasVeg) }
}

export function mealScore(P: Profile, p: number, f: number, hasVeg: boolean) {
  const g = goal(P)
  const W = (g === 'More protein' || g === 'Building strength') ? [0.55, 0.2, 0.25]
    : g === 'More energy' ? [0.4, 0.35, 0.25]
      : g === 'Steadier blood sugar' ? [0.3, 0.45, 0.25]
        : g === 'Feeling lighter' ? [0.4, 0.3, 0.3]
          : [0.3, 0.3, 0.4]
  const v = W[0] * Math.min(p / 30, 1) + W[1] * Math.min(f / 10, 1) + W[2] * (hasVeg ? 1 : 0)
  return Math.max(1, Math.min(100, Math.round(35 + 65 * v)))
}

export function scoreLabel(n: number) {
  return n >= 80 ? 'Great for your goal' : n >= 60 ? 'Solid' : 'Room to grow'
}

export function scoreColor(n: number) {
  return n >= 80 ? '#8C6BCF' : n >= 60 ? '#B7A3E6' : '#F2C230'
}

const QUOTES: Record<string, string[]> = {
  'More energy': ['Good energy starts with a good breakfast.', 'Feed yourself like someone you love.', 'Tired is information, not failure. Let us refuel.', 'Steady meals, steady days.', 'Small fuel, often, beats one big push.'],
  'More protein': ['Strong is built one meal at a time.', 'A little protein at every meal adds up fast.', 'Fuel the body that carries you.', 'Consistency beats intensity, every time.', 'Every plate is a chance to build.'],
  'Feeling lighter': ['Progress, not perfection. Every meal is a fresh start.', 'Small swaps add up to big changes.', 'Your body is your home. Treat it kindly.', 'One good choice makes the next one easier.', 'Be patient with yourself. Change is quiet before it shows.'],
  'Building strength': ['Strong is built one meal and one rep at a time.', 'Fuel the body that carries you.', 'Consistency beats intensity, every time.', 'Rest and food are part of the training.', 'Show up, refuel, repeat.'],
  'Steadier blood sugar': ['Steady plates make steady days.', 'Pair it up: carbs with protein or fiber.', 'Small habits keep things balanced.', 'Every balanced meal is a quiet win.', 'Gentle and consistent wins the day.'],
  'Feeling at peace with food': ['There are no good or bad foods. Just nourishing choices.', 'You do not have to earn your meals.', 'Eat with curiosity, not guilt.', 'Food is fuel, comfort and connection.', 'Listen to your body. It is on your side.'],
  'Simply eating well': ['One more vegetable is always a good idea.', 'Eat the rainbow, one color at a time.', 'Small steps count.', 'Good food, good mood.', 'Nourish first, then flourish.'],
}

export function todaysQuote(P: Profile) {
  const list = QUOTES[goal(P)] || QUOTES['Simply eating well']
  const day = Math.floor(Date.now() / 864e5)
  return list[day % list.length]
}

const KW: [string, number, number][] = [['chicken', 30, 0], ['steak', 30, 0], ['beef', 25, 0], ['salmon', 28, 0], ['fish', 25, 0], ['shrimp', 20, 0], ['turkey', 20, 0], ['tofu', 15, 1], ['egg', 12, 0], ['falafel', 12, 5], ['chickpea', 10, 6], ['lentil', 10, 8], ['bean', 8, 8], ['yogurt', 15, 0], ['quinoa', 4, 4], ['brown rice', 4, 3], ['salad', 2, 4], ['greens', 2, 4], ['veggie', 2, 4], ['broccoli', 3, 4], ['spinach', 1, 2], ['avocado', 2, 7], ['fruit', 1, 3]]

export function estimate(text: string) {
  const t = text.toLowerCase()
  let p = 4
  let f = 1
  let veg = false
  KW.forEach(([k, pp, ff]) => {
    if (new RegExp('\\b' + k).test(t)) { p += pp; f += ff }
  })
  if (/salad|greens|veggie|broccoli|spinach|vegetable/.test(t)) veg = true
  return { p: Math.min(p, 60), f: Math.min(f, 20), veg }
}

export function orderTip(P: Profile, est: { p: number; veg: boolean; f: number }) {
  if (est.p < 20) return isVeg(P) ? 'Add tofu, beans or a side of edamame for more protein.' : 'Add a protein like chicken, eggs or beans.'
  if (!est.veg) return 'Add a side of veggies or ask for extra greens.'
  if (est.f < 8) return 'Add beans or swap to brown rice for more fiber.'
  return 'Great choice. Get sauces on the side so you can add as much as you like.'
}

export function rank(P: Profile, items: MenuItem[], mode?: string) {
  let list = items.filter(x => !isVeg(P) || x.veg)
  if (!list.length) list = items
  const g = mode || goal(P)
  if (g === 'Late Nights recovery') return list.slice().sort((a, b) => (b.f * 2 + b.p / 3 - b.c / 40) - (a.f * 2 + a.p / 3 - a.c / 40))
  const score = (x: MenuItem) =>
    g === 'More protein' || g === 'Building strength' ? x.p
      : g === 'Steadier blood sugar' ? x.f * 3 + x.p / 3
        : g === 'Feeling lighter' ? x.p - x.c / 30
          : g === 'More energy' ? x.p + x.f * 2
            : x.f * 2 + x.p / 2
  return list.slice().sort((a, b) => score(b) - score(a))
}

export function reason(P: Profile, x: MenuItem, mode?: string) {
  const g = mode || goal(P)
  if (g === 'Late Nights recovery') return `Gentle and filling, with ${x.f}g of fiber to help you bounce back`
  if (g === 'Feeling lighter') return `Satisfying and lighter, with ${x.p}g of protein`
  if (g === 'More protein' || g === 'Building strength') return `${x.p}g of protein, a strong pick for your goal`
  if (g === 'Steadier blood sugar') return `${x.f}g of fiber to keep things steady`
  if (g === 'More energy') return 'Protein and fiber together for lasting energy'
  return `A balanced choice with ${x.f}g of fiber`
}

export function intention(P: Profile) {
  return CINTENT[P.challenge[0]] || INTENT[P.support[0]] || 'One veggie at dinner, three nights.'
}

export function freshDeck(P: Profile): DeckCard[] {
  return DECK.filter(d => !isVeg(P) || d.veg).map(d => ({ ...d }))
}

export function toggleChip(P: Profile, key: ChipKey | SingleKey, option: string, max: number): Profile {
  const next = { ...P }
  if (max === 1) {
    if (key === 'tried') next.tried = option
    else if (key === 'cooking') next.cooking = option
    else if (key === 'prep') next.prep = option
    else if (key === 'shopFreq') next.shopFreq = option
    else if (key === 'sleepGoal') next.sleepGoal = option
    return next
  }
  const chipKey = key as ChipKey
  let arr = [...next[chipKey]]
  if (arr.includes(option)) arr = arr.filter(x => x !== option)
  else {
    if (option === 'No preference') arr = []
    else arr = arr.filter(x => x !== 'No preference')
    if (arr.length >= max) arr.shift()
    arr.push(option)
  }
  next[chipKey] = arr
  if (chipKey === 'diet' && !next.diet.includes('I have allergies')) {
    next.allergies = []
    next.allergyNote = ''
  }
  if (chipKey === 'diet' && !next.diet.includes('I have health concerns')) {
    next.healthIssues = []
    next.healthIssueNote = ''
  }
  return next
}

export function chipSelected(P: Profile, key: ChipKey | SingleKey, option: string) {
  if (key === 'tried') return P.tried === option
  if (key === 'cooking') return P.cooking === option
  if (key === 'prep') return P.prep === option
  if (key === 'shopFreq') return P.shopFreq === option
  if (key === 'sleepGoal') return P.sleepGoal === option
  return (P[key as ChipKey] as string[]).includes(option)
}

export function canContinue(P: Profile, q: Question) {
  if (q.type !== 'chips') return true
  const picked = q.key === 'tried' ? Boolean(P.tried)
    : q.key === 'cooking' ? Boolean(P.cooking)
      : q.key === 'prep' ? Boolean(P.prep)
        : q.key === 'shopFreq' ? Boolean(P.shopFreq)
          : q.key === 'sleepGoal' ? Boolean(P.sleepGoal)
            : (P[q.key] as string[]).length > 0
  if (!picked) return false
  if (q.text && q.textWhen && chipSelected(P, q.key, q.textWhen) && !P[q.text.key].trim()) return false
  return true
}
