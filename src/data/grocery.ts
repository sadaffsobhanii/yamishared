import type { GroceryItem, Profile } from '../types'

function add(list: string[], item: string) {
  if (!list.includes(item)) list.push(item)
}

export function seedGrocery(profile: Profile): GroceryItem[] {
  const diets = new Set(profile.diets)
  const notes = `${profile.allergyNote} ${profile.doctorNote}`.toLowerCase()
  const goals = new Set(profile.goals)
  const vegan = diets.has('vegan')
  const dairyFree = vegan || /dairy|lactose/.test(notes)
  const keto = diets.has('keto')
  const tight = profile.studentBudget || (Number(profile.budget) > 0 && Number(profile.budget) <= 80)
  const picks: string[] = []

  if (dairyFree) add(picks, 'Oat milk')
  if (keto) add(picks, vegan ? 'Firm tofu' : 'Eggs')
  else if (goals.has('energy')) add(picks, 'Overnight oats')
  else if (goals.has('muscle')) add(picks, vegan || dairyFree ? 'Firm tofu' : 'Greek yogurt')
  else if (goals.has('blood-sugar')) add(picks, dairyFree ? 'Edamame' : 'Greek yogurt')
  else if (goals.has('feel-better')) add(picks, 'Fresh berries')
  else if (goals.has('aware') || profile.goalCustom.trim()) add(picks, 'Lemons')
  else add(picks, 'Apples')

  if (tight) add(picks, 'Bananas')
  if (tight && !keto) add(picks, 'Dried lentils')
  if (diets.has('eating-out')) add(picks, 'Hummus')
  if (picks.length < 2) add(picks, 'Bananas')
  if (picks.length < 2) add(picks, dairyFree ? 'Firm tofu' : 'Eggs')

  return picks.slice(0, 3).map((text) => ({
    id: crypto.randomUUID(),
    text,
    done: false,
  }))
}

export function budgetHint(text: string, profile: Profile): string | null {
  const tight = profile.studentBudget || (Number(profile.budget) > 0 && Number(profile.budget) <= 80)
  if (!tight) return null
  if (/yogurt|oat milk|olive oil|chocolate/i.test(text)) {
    return 'A gentler price: the store brand is usually enough.'
  }
  if (/lentil|banana|egg|oat/i.test(text)) {
    return 'This is one of the more affordable picks on the list.'
  }
  return null
}
