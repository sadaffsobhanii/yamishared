import { LANGUAGES } from './languages'
import type { Profile, WidgetId } from '../types'

export type HearId = 'name' | 'language' | 'goals' | 'diet' | 'past' | 'budget' | 'shop' | 'track'

export type Heard = {
  patch: Partial<Profile>
  reflection: string
  understood: boolean
}

const GOAL_WORDS: { id: string; label: string; words: string[] }[] = [
  { id: 'energy', label: 'more energy', words: ['energy', 'energized', 'tired', 'fatigue'] },
  { id: 'muscle', label: 'building muscle', words: ['muscle', 'muscles', 'strength', 'stronger', 'lifting'] },
  { id: 'blood-sugar', label: 'steadier blood sugar', words: ['blood sugar', 'glucose', 'prediabetes'] },
  { id: 'feel-better', label: 'feeling better around food', words: ['feel better', 'around food', 'guilt', 'relationship with food'] },
  { id: 'aware', label: 'being more aware', words: ['aware', 'awareness', 'mindful', 'noticing'] },
]

const DIET_WORDS: { id: string; label: string; words: string[] }[] = [
  { id: 'vegetarian', label: 'vegetarian', words: ['vegetarian', 'no meat'] },
  { id: 'vegan', label: 'vegan', words: ['vegan'] },
  { id: 'keto', label: 'keto', words: ['keto', 'low carb', 'low-carb'] },
  { id: 'allergies', label: 'an allergy to keep in mind', words: ['allerg', 'allergic', 'intoleran'] },
  { id: 'doctor', label: "something a doctor already suggested", words: ['doctor', 'clinician', 'physician'] },
  { id: 'eating-out', label: 'eating out often', words: ['eat out', 'eating out', 'restaurant', 'takeout', 'take out'] },
]

const PAST_WORDS: { id: string; label: string; words: string[] }[] = [
  { id: 'too-long', label: 'logging took too long', words: ['too long', 'took forever', 'slow to log', 'logging'] },
  { id: 'numbers-stress', label: 'numbers felt stressful', words: ['number', 'calorie counting', 'stressful', 'stressed'] },
  { id: 'lost-motivation', label: 'motivation faded', words: ['motivation', 'gave up', 'quit'] },
  { id: 'life-busy', label: 'life got busy', words: ['busy', 'no time', 'hectic'] },
  { id: 'first-time', label: 'this is a first try', words: ['first try', 'first time', 'never used', 'new to this', "haven't tried", 'have not tried'] },
]

const WIDGET_WORDS: { id: WidgetId; label: string; words: string[] }[] = [
  { id: 'protein', label: 'protein', words: ['protein'] },
  { id: 'fiber', label: 'fiber', words: ['fiber', 'fibre'] },
  { id: 'water', label: 'water', words: ['water', 'hydration'] },
  { id: 'energy', label: 'energy', words: ['energy'] },
  { id: 'consistency', label: 'meal consistency', words: ['consistency', 'how often', 'regular meals', 'meal streak'] },
  { id: 'macros', label: 'macros', words: ['macro'] },
]

const STORES: { label: string; words: string[] }[] = [
  { label: 'Target', words: ['target'] },
  { label: 'Walmart', words: ['walmart'] },
  { label: 'Whole Foods', words: ['whole foods', 'wholefoods'] },
  { label: 'Trader Joe\'s', words: ['trader joe'] },
  { label: 'Kroger', words: ['kroger'] },
  { label: 'Costco', words: ['costco'] },
  { label: 'My local grocery store', words: ['local grocery', 'local store', 'corner store'] },
]

const MONEY_WORDS: Record<string, string> = {
  twenty: '20',
  thirty: '30',
  forty: '40',
  fifty: '50',
  sixty: '60',
  seventy: '70',
  eighty: '80',
  ninety: '90',
  hundred: '100',
}

function lower(raw: string) {
  return raw.toLowerCase().replace(/\s+/g, ' ').trim()
}

function has(text: string, words: string[]) {
  return words.some((word) => text.includes(word))
}

function join(items: string[]) {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function cap(text: string) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}

export function hear(id: HearId, raw: string, acceptAnyway = false): Heard {
  const text = lower(raw)
  if (!text) return { patch: {}, reflection: 'We can leave that for later.', understood: false }

  if (id === 'name') return hearName(raw, text)
  if (id === 'language') return hearLanguage(text, acceptAnyway)
  if (id === 'goals') return hearGoals(raw, text, acceptAnyway)
  if (id === 'diet') return hearDiet(raw, text, acceptAnyway)
  if (id === 'past') return hearPast(text, acceptAnyway)
  if (id === 'budget') return hearBudget(text, acceptAnyway)
  if (id === 'shop') return hearShop(text, acceptAnyway)
  return hearTrack(text, acceptAnyway)
}

function hearName(raw: string, text: string): Heard {
  const named = raw.match(/\b(?:my name is|i'm|i am|call me|this is|i go by)\s+([A-Za-z][A-Za-z'’.-]*(?:\s+[A-Za-z][A-Za-z'’.-]*){0,2})/i)
  let name = named?.[1]?.trim() ?? ''
  if (!name && text.split(' ').length <= 3 && /[a-z]/i.test(text)) {
    name = raw.trim().replace(/[.!?]/g, '')
  }
  if (!name) return { patch: {}, reflection: '', understood: false }
  name = name
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  return { patch: { name }, reflection: `${name}. Thank you. I'll use that.`, understood: true }
}

function hearLanguage(text: string, acceptAnyway: boolean): Heard {
  if (/\b(just english|only english|english only|no other|don't speak another|do not speak another)\b/.test(text) || /^(no|nope|nah|english)$/.test(text)) {
    return {
      patch: { languageInput: 'English', languageId: 'english', unrecognizedLanguage: null },
      reflection: "English is home base. I'll meet you there.",
      understood: true,
    }
  }

  const hits = LANGUAGES.filter((language) =>
    language.aliases.some((alias) => alias.length >= 3 && text.includes(alias.toLowerCase())),
  )
  const chosen = hits.find((language) => language.id !== 'english') ?? hits[0]
  if (chosen) {
    return {
      patch: { languageInput: chosen.englishName, languageId: chosen.id, unrecognizedLanguage: null },
      reflection:
        chosen.id === 'english'
          ? "English is home base. I'll meet you there."
          : `I'll keep a little ${chosen.englishName} nearby.`,
      understood: true,
    }
  }

  if (!acceptAnyway) return { patch: {}, reflection: '', understood: false }
  const note = text.slice(0, 40)
  return {
    patch: { languageInput: note, languageId: null, unrecognizedLanguage: note },
    reflection: "I don't have phrases for that yet, so I'll stay in English and remember you mentioned it.",
    understood: true,
  }
}

function hearGoals(raw: string, text: string, acceptAnyway: boolean): Heard {
  const goals = GOAL_WORDS.filter((goal) => has(text, goal.words)).map((goal) => goal.id)
  if (goals.length === 0 && !acceptAnyway) return { patch: {}, reflection: '', understood: false }
  const labels = GOAL_WORDS.filter((goal) => goals.includes(goal.id)).map((goal) => goal.label)
  const reflection = labels.length
    ? `${cap(join(labels))}. I'll let that shape the ideas — not a strict plan.`
    : "I'll hold onto your words, and keep the ideas flexible."
  return {
    patch: { goals, goalCustom: labels.length ? '' : raw.trim() },
    reflection,
    understood: true,
  }
}

function hearDiet(raw: string, text: string, acceptAnyway: boolean): Heard {
  const diets = DIET_WORDS.filter((diet) => has(text, diet.words)).map((diet) => diet.id)
  const nothing = /\b(nothing specific|no restriction|no restrictions|eat everything|anything is fine)\b/.test(text)
  if (diets.length === 0 && nothing) {
    return {
      patch: { diets: ['none'], allergyNote: '', doctorNote: '' },
      reflection: "Nothing specific to plan around. Grocery ideas can stay open.",
      understood: true,
    }
  }
  if (diets.length === 0 && !acceptAnyway) return { patch: {}, reflection: '', understood: false }
  const allergy = raw.match(/allerg(?:y|ic)(?:\s+to)?\s+([^.,]+)/i)?.[1]?.trim() ?? ''
  const nut = /\b(peanut|tree nut|nuts)\b/i.test(raw) ? 'nuts' : ''
  const dairy = /\b(dairy|lactose)\b/i.test(raw) ? 'dairy' : ''
  const allergyNote = [allergy, nut, dairy].filter(Boolean).join(', ')
  const doctorNote = diets.includes('doctor') ? raw.trim() : ''
  const labels = DIET_WORDS.filter((diet) => diets.includes(diet.id)).map((diet) => diet.label)
  return {
    patch: { diets, allergyNote, doctorNote },
    reflection: labels.length
      ? `I'll keep grocery ideas inside that: ${join(labels)}.`
      : "I'll remember what you said, and we can refine it later.",
    understood: true,
  }
}

function hearPast(text: string, acceptAnyway: boolean): Heard {
  const pastApps = PAST_WORDS.filter((item) => has(text, item.words)).map((item) => item.id)
  if (/\b(no|nope|they were fine|nothing)\b/.test(text) && pastApps.length === 0) {
    return { patch: { pastApps: [] }, reflection: "Good to know they didn't get in the way. We'll still keep this light.", understood: true }
  }
  if (pastApps.length === 0 && !acceptAnyway) return { patch: {}, reflection: '', understood: false }
  const labels = PAST_WORDS.filter((item) => pastApps.includes(item.id)).map((item) => item.label)
  const quiet = pastApps.includes('numbers-stress')
  return {
    patch: { pastApps },
    reflection: quiet
      ? "Numbers can stay quiet. We'll go by what you choose to notice."
      : labels.length
        ? `${cap(join(labels))}. I'll keep the tracking lighter because of that.`
        : "I'll keep the pace gentle either way.",
    understood: true,
  }
}

function hearBudget(text: string, acceptAnyway: boolean): Heard {
  const digits = text.match(/\$?\s*(\d{1,4})\b/)
  const word = Object.keys(MONEY_WORDS).find((key) => text.includes(key))
  const budget = digits?.[1] ?? (word ? MONEY_WORDS[word] : '')
  const studentBudget = /\b(student|college|campus|broke)\b/.test(text)
  if (!budget && !studentBudget && !acceptAnyway) return { patch: {}, reflection: '', understood: false }
  const patch: Partial<Profile> = { studentBudget }
  if (budget) patch.budget = budget
  const reflection = [
    budget ? `About $${budget} a week.` : 'No exact number — that is fine.',
    studentBudget ? "I'll lean toward simpler, lower-cost ideas." : 'Ideas can stay inside what feels comfortable.',
  ].join(' ')
  return { patch, reflection, understood: true }
}

function hearShop(text: string, acceptAnyway: boolean): Heard {
  const store = STORES.find((item) => has(text, item.words))?.label ?? ''
  const online = /\b(online|delivery|instacart|order)\b/.test(text)
  const inStore = /\b(in store|in-store|in the store|in person|aisle)\b/.test(text)
  const both = /\bboth\b/.test(text) || (online && inStore)
  const shopMode: Profile['shopMode'] = both ? 'both' : online ? 'online' : inStore || store ? 'in-store' : ''
  if (!shopMode && !acceptAnyway) return { patch: {}, reflection: '', understood: false }
  const modeLabel = shopMode === 'both' ? 'Both in-store and online' : shopMode === 'online' ? 'Ordering online' : 'An in-store list'
  return {
    patch: { shopMode: shopMode || 'in-store', shopStore: store, shopStoreCustom: '' },
    reflection: store ? `${modeLabel}, often at ${store}.` : `${modeLabel}. You can name a store later.`,
    understood: true,
  }
}

function hearTrack(text: string, acceptAnyway: boolean): Heard {
  const widgets = WIDGET_WORDS.filter((widget) => has(text, widget.words)).map((widget) => widget.id)
  const wantsCalories = /\bcalories?\b/.test(text) && !/\b(no|not|without|don't|dont|off)\b[^.]{0,16}\bcalories?\b/.test(text)
  const wantsWeight = /\bweight\b/.test(text) && !/\b(no|not|without|don't|dont|off)\b[^.]{0,16}\bweight\b/.test(text)
  if (widgets.length === 0 && !wantsCalories && !wantsWeight && !acceptAnyway) {
    return { patch: {}, reflection: '', understood: false }
  }
  const chosen = widgets.length ? widgets : wantsCalories || wantsWeight ? [] : (['protein', 'energy'] as WidgetId[])
  const labels = WIDGET_WORDS.filter((widget) => chosen.includes(widget.id)).map((widget) => widget.label)
  if (wantsCalories) labels.push('calories')
  if (wantsWeight) labels.push('weight')
  const quiet = !wantsCalories && !wantsWeight
  return {
    patch: { widgets: chosen, trackCalories: wantsCalories, trackWeight: wantsWeight },
    reflection: `${cap(join(labels)) || 'A light home screen'}. ${quiet ? 'Calories and weight stay off unless you ask later.' : 'Only what you asked for is on.'}`,
    understood: true,
  }
}
