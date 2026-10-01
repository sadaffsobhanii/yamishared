import { hasProtein } from './meals'
import type { GroceryItem, LoggedMeal } from '../types'

// Gentle gamification (PRD 6.7 / 7.7): rewards showing up, never restriction. Nothing here resets or shrinks.

export type Week = { meals: LoggedMeal[]; grocery: GroceryItem[]; water: number; checkInDone: boolean; answers?: string[] }

export const WEEK_GOAL = 5

const FIBER = /spinach|salad|green|berry|berries|apple|banana|oat|bean|lentil|chickpea|edamame/i

export function badges(week: Week) {
  const distinct = new Set(week.meals.map((meal) => meal.items.join('|').toLowerCase())).size
  return [
    { id: 'first-meal', label: 'First meal logged', earned: week.meals.length >= 1 },
    { id: 'five-meal', label: '5-Meal Week', earned: week.meals.length >= WEEK_GOAL },
    { id: 'first-week', label: 'First Week Logged', earned: week.checkInDone },
    { id: 'grocery', label: 'Idea to list', earned: week.grocery.some((item) => item.fromMeal) },
    { id: 'variety', label: 'Variety explorer', earned: distinct >= 3 },
    { id: 'water', label: 'Water noticed', earned: week.water >= 3 },
  ]
}

// Yami grows one step for every two meals logged, up to four steps.
export function growth(week: Week) {
  return Math.min(4, Math.floor(week.meals.length / 2))
}

export function wins(week: Week) {
  const list: string[] = []
  const answers = week.answers ?? []
  if (week.meals.length > 0) list.push(`You logged ${week.meals.length} meal${week.meals.length === 1 ? '' : 's'}.`)
  const protein = week.meals.filter((meal) => meal.hadProtein || hasProtein(meal.items)).length
  if (protein > 0) list.push(`Protein showed up in ${protein} of them.`)
  if (answers.includes('I felt more energized')) list.push('You felt more energized.')
  if (answers.includes('Tracking felt easy')) list.push('Tracking felt easy this week.')
  if (week.grocery.some((item) => item.fromMeal)) list.push('You turned a meal idea into a grocery item.')
  if (week.water > 0) list.push(`You noticed ${week.water} glass${week.water === 1 ? '' : 'es'} of water.`)
  list.push('You checked in with yourself. That counts.')
  return list.slice(0, 3)
}

export function nextStep(week: Week) {
  const answers = week.answers ?? []
  if (answers.includes('I got busy')) return 'Save a go-to meal as a favorite, so logging next week is one tap.'
  if (answers.includes('I need simpler ideas')) return "Next week I'll keep it to one easy add per meal."
  if (answers.includes('I want to change my focus')) return 'Head to You and update what you would like to notice.'
  if (!week.meals.some((meal) => FIBER.test(meal.items.join(' ')))) return 'A small variety challenge: try one new vegetable or fruit this week.'
  return 'Keep what felt good — and maybe try one new fruit this week.'
}
