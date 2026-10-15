import type { LoggedMeal, Profile, YamiCharacter, YamiOutfit } from '../types'

export type ClosetItem = {
  id: YamiCharacter | YamiOutfit
  kind: 'character' | 'outfit'
  name: string
  note: string
  streak: number
}

export const CLOSET: ClosetItem[] = [
  { id: 'bunny', kind: 'character', name: 'Bunny', note: 'Yami, from the start', streak: 0 },
  { id: 'chick', kind: 'character', name: 'Sunny', note: 'Another character', streak: 5 },
  { id: 'moon', kind: 'character', name: 'Mochi', note: 'Another character', streak: 10 },
  { id: 'none', kind: 'outfit', name: 'No extra', note: 'Just themselves', streak: 0 },
  { id: 'scarf', kind: 'outfit', name: 'Fall scarf', note: 'A cozy wrap', streak: 0 },
  { id: 'bow', kind: 'outfit', name: 'Lilac bow', note: 'Tied on one ear', streak: 1 },
  { id: 'flower', kind: 'outfit', name: 'Flower crown', note: 'A little garden', streak: 3 },
  { id: 'cap', kind: 'outfit', name: 'Night cap', note: 'For the late hours', streak: 7 },
]

export function mealStreak(meals: LoggedMeal[], now = new Date()) {
  const days = new Set(meals.map((meal) => dayKey(new Date(meal.loggedAt))))
  const cursor = new Date(now)
  cursor.setHours(12, 0, 0, 0)
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(dayKey(cursor))) return 0
  }
  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function unlocked(streak: number, item: ClosetItem) {
  return streak >= item.streak
}

export function nextUnlock(streak: number) {
  return CLOSET.filter((item) => item.streak > streak).sort((a, b) => a.streak - b.streak)[0] ?? null
}

export function equippedLook(profile: Profile): { character: YamiCharacter; outfit: YamiOutfit } {
  const streak = profile.bestStreak
  const character = CLOSET.find((item) => item.kind === 'character' && item.id === profile.character)
  const outfit = CLOSET.find((item) => item.kind === 'outfit' && item.id === profile.outfit)
  return {
    character: character && unlocked(streak, character) ? profile.character : 'bunny',
    outfit: outfit && unlocked(streak, outfit) ? profile.outfit : 'none',
  }
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}
