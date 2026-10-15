import type { LoggedMeal, MealTiming, YamiMood } from '../types'

type MealId = 'breakfast' | 'lunch' | 'dinner'

const WINDOWS: { id: MealId; start: number; end: number }[] = [
  { id: 'breakfast', start: 7 * 60, end: 10 * 60 },
  { id: 'lunch', start: 11 * 60 + 30, end: 14 * 60 },
  { id: 'dinner', start: 17 * 60 + 30, end: 20 * 60 + 30 },
]

const EARLY = 45
const LATE = 90

function minutes(date: Date) {
  return date.getHours() * 60 + date.getMinutes()
}

function cap(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function moodAt(date: Date): YamiMood {
  const now = minutes(date)
  if (now >= 5 * 60 && now < 11 * 60) return 'sleepy'
  if (now >= 11 * 60 && now < 17 * 60) return 'awake'
  return 'drowsy'
}

function isToday(at: number, now: Date) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const from = start.getTime()
  return at >= from && at < from + 86_400_000
}

function covered(meals: LoggedMeal[], id: MealId, now: Date) {
  const window = WINDOWS.find((item) => item.id === id)
  if (!window) return false
  return meals.some((meal) => {
    if (!isToday(meal.loggedAt, now)) return false
    const logged = minutes(new Date(meal.loggedAt))
    return logged >= window.start - EARLY && logged <= window.end + LATE
  })
}

function todayCount(meals: LoggedMeal[], now: Date) {
  return meals.filter((meal) => isToday(meal.loggedAt, now)).length
}

export function mealTiming(now: Date, meals: LoggedMeal[], surface: 'home' | 'snap'): MealTiming {
  const minute = minutes(now)
  const mood = moodAt(now)
  const count = todayCount(meals, now)

  if (minute >= 22 * 60 || minute < 5 * 60) {
    return {
      mood: 'drowsy',
      meal: 'late-night',
      status: 'late',
      line:
        surface === 'snap'
          ? "It's late for a meal. A photo is enough, and a long day is not a failure."
          : "It's late. If you're still eating, keep it gentle.",
    }
  }

  if (minute < 7 * 60) {
    return {
      mood,
      meal: 'breakfast',
      status: 'quiet',
      line:
        surface === 'snap'
          ? "It's early for breakfast. You can log it if you're already eating."
          : "It's early. Breakfast can wait until you're ready.",
    }
  }

  for (const window of WINDOWS) {
    if (minute < window.start || minute > window.end) continue
    if (covered(meals, window.id, now)) {
      const progress = count > 1 ? ` That's ${count} meals today.` : ''
      return {
        mood,
        meal: window.id,
        status: 'logged',
        line:
          surface === 'snap'
            ? `${cap(window.id)} is already logged. This photo can be a little extra.`
            : `${cap(window.id)} is logged. You're on time.${progress}`,
      }
    }
    return {
      mood,
      meal: window.id,
      status: 'on-time',
      line:
        surface === 'snap'
          ? `About time for ${window.id}. A photo keeps the day on track.`
          : `About time for ${window.id}.`,
    }
  }

  for (const window of WINDOWS) {
    if (minute < window.start - EARLY || minute >= window.start) continue
    return {
      mood,
      meal: window.id,
      status: 'early',
      line: surface === 'snap' ? `A bit early for ${window.id}. You can still log it.` : `Almost time for ${window.id}.`,
    }
  }

  for (const window of WINDOWS) {
    if (minute <= window.end || minute > window.end + LATE) continue
    if (covered(meals, window.id, now)) {
      return {
        mood,
        meal: window.id,
        status: 'logged',
        line:
          surface === 'snap'
            ? `${cap(window.id)} is already logged. This photo can be a little extra.`
            : `${cap(window.id)} is in. The next meal can wait.`,
      }
    }
    return {
      mood,
      meal: window.id,
      status: 'late',
      line:
        surface === 'snap'
          ? `This is a little late for ${window.id}. Still worth a photo.`
          : `A little late for ${window.id}. A meal now still counts.`,
    }
  }

  let line = 'There’s a pause between meals. No rush.'
  if (minute > 10 * 60 && minute < 11 * 60 + 30) {
    line = covered(meals, 'breakfast', now) ? 'Breakfast is in. Lunch is coming up.' : 'Breakfast time has passed. Lunch is the next stop.'
  } else if (minute > 14 * 60 && minute < 17 * 60 + 30) {
    line = covered(meals, 'lunch', now) ? 'Lunch is done. Dinner is later.' : 'Afternoon. Dinner is the next meal to aim for.'
  } else if (minute > 20 * 60 + 30 && minute < 22 * 60) {
    line = covered(meals, 'dinner', now) ? 'Dinner is logged. The day stayed on track.' : 'Dinner time has passed. Tomorrow’s rhythm can start fresh.'
  }

  if (surface === 'snap') line = `${line} A photo is enough if you're eating now.`

  return { mood, meal: 'between', status: 'between', line }
}
