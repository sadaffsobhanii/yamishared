import { useState } from 'react'
import { MealVisual } from '../components/MealVisual'
import { Screen, TabBar, type TabId } from '../components/ui'
import type { GroceryItem, InsightWidgetId, LoggedMeal, Profile, WidgetId } from '../types'

const CATALOG: { id: InsightWidgetId; name: string; wide?: boolean; soon?: boolean }[] = [
  { id: 'protein', name: 'Protein progress' },
  { id: 'fiber', name: 'Fiber progress' },
  { id: 'water', name: 'Water tracker' },
  { id: 'energy', name: 'Energy check-in' },
  { id: 'consistency', name: 'Meal consistency' },
  { id: 'variety', name: 'Nutrition variety' },
  { id: 'grocery', name: 'Grocery-list progress', wide: true },
  { id: 'wins', name: 'Weekly wins', wide: true },
  { id: 'history', name: 'Meal history', wide: true },
  { id: 'goal', name: 'Goal progress', wide: true },
  { id: 'macros', name: 'Macros', wide: true },
  { id: 'glucose', name: 'Blood-glucose support', soon: true },
]

const FROM_HOME: Partial<Record<WidgetId, InsightWidgetId>> = {
  protein: 'protein',
  fiber: 'fiber',
  water: 'water',
  energy: 'energy',
  consistency: 'consistency',
  macros: 'macros',
}

const GOAL_LABEL: Record<string, string> = {
  energy: 'Energy',
  muscle: 'Muscle',
  'blood-sugar': 'Blood sugar',
  'feel-better': 'Around food',
  aware: 'Awareness',
}

const FIBER = /spinach|salad|green|berry|apple|banana|oat|bean|lentil|chickpea|edamame/i
const FRUIT = /berry|apple|banana|lemon|blueberry/i
const VEG = /spinach|salad|green|edamame/i
const PROTEIN = /egg|tofu|chickpea|yogurt|bean|lentil|edamame/i
const GRAIN = /toast|bread|oat/i
const CARB = /pasta|bread|toast|oat|rice|tortilla/i
const FAT = /oil|butter|avocado|nut|cheese|cream|parmesan/i

export function seedInsightWidgets(profile: Profile): InsightWidgetId[] {
  const chosen = profile.widgets.flatMap((id) => {
    const mapped = FROM_HOME[id]
    return mapped ? [mapped] : []
  })
  if ((profile.goals.length > 0 || profile.goalCustom.trim()) && !chosen.includes('goal')) chosen.push('goal')
  return chosen
}

function fiberFoods(meals: LoggedMeal[]) {
  return meals.reduce((total, meal) => total + meal.items.filter((item) => FIBER.test(item)).length, 0)
}

function varietyHits(meals: LoggedMeal[]) {
  const blob = meals.flatMap((meal) => meal.items).join(' ')
  return [
    { id: 'Fruit', on: FRUIT.test(blob) },
    { id: 'Veg', on: VEG.test(blob) },
    { id: 'Protein', on: PROTEIN.test(blob) },
    { id: 'Grains', on: GRAIN.test(blob) },
  ]
}

function goalName(profile: Profile) {
  const names = profile.goals.map((id) => GOAL_LABEL[id]).filter(Boolean)
  if (names.length === 0) return profile.goalCustom.trim() ? 'Your focus' : 'Goal'
  if (names.length === 1) return names[0]
  return `${names[0]} +${names.length - 1}`
}

export function InsightsScreen({
  profile,
  meals,
  grocery,
  water,
  energy,
  onChange,
  onWater,
  onEnergy,
  onTab,
}: {
  profile: Profile
  meals: LoggedMeal[]
  grocery: GroceryItem[]
  water: number
  energy: number | null
  onChange: (patch: Partial<Profile>) => void
  onWater: () => void
  onEnergy: (level: number) => void
  onTab: (tab: TabId) => void
}) {
  const [adding, setAdding] = useState(false)
  const board = profile.insightWidgets
  const proteinMeals = meals.filter((meal) => meal.hadProtein).length
  const bought = grocery.filter((item) => item.done).length
  const needed = grocery.length - bought
  const mix = macroMix(meals)
  const latest = meals[0]

  function toggleWidget(id: InsightWidgetId) {
    onChange({
      insightWidgets: board.includes(id) ? board.filter((item) => item !== id) : [...board, id],
    })
  }

  return (
    <Screen className="insights" footer={<TabBar current="insights" onChange={onTab} />}>
      <header className="insights-head">
        <h1>Insights</h1>
        <button type="button" className="add-widget" aria-label="Add a widget" onClick={() => setAdding(true)}>
          +
        </button>
      </header>

      {board.length === 0 ? (
        <button type="button" className="gallery-empty" onClick={() => setAdding(true)}>
          <span className="add-widget" aria-hidden="true">
            +
          </span>
          Add a widget
        </button>
      ) : (
        <div className="gallery">
          {board.map((id) => {
            const meta = CATALOG.find((item) => item.id === id)
            return (
              <article key={id} className={meta?.wide ? 'gallery-card wide' : 'gallery-card'}>
                <button type="button" className="card-x" aria-label={`Remove ${meta?.name ?? 'widget'}`} onClick={() => toggleWidget(id)}>
                  ×
                </button>
                <WidgetBody
                  id={id}
                  profile={profile}
                  meals={meals}
                  proteinMeals={proteinMeals}
                  fiber={fiberFoods(meals)}
                  water={water}
                  energy={energy}
                  needed={needed}
                  bought={bought}
                  mix={mix}
                  latest={latest}
                  onWater={onWater}
                  onEnergy={onEnergy}
                />
              </article>
            )
          })}
        </div>
      )}

      <p className="safety">General wellness, not medical advice.</p>

      {adding ? (
        <>
          <button type="button" className="sheet-backdrop" aria-label="Close widgets" onClick={() => setAdding(false)} />
          <div className="widget-sheet" role="dialog" aria-label="Add a widget">
            <div className="sheet-head">
              <h2>Add a widget</h2>
              <button type="button" className="text-button" onClick={() => setAdding(false)}>
                Done
              </button>
            </div>
            <div className="picker-grid">
              {CATALOG.map((item) => {
                const on = board.includes(item.id)
                return (
                  <button key={item.id} type="button" className={on ? 'picker-tile on' : 'picker-tile'} onClick={() => toggleWidget(item.id)}>
                    <WidgetGlyph id={item.id} />
                    <span>{item.name}</span>
                    {item.soon ? <em>Soon</em> : null}
                    {on ? <em>Added</em> : null}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      ) : null}
    </Screen>
  )
}

function WidgetBody({
  id,
  profile,
  meals,
  proteinMeals,
  fiber,
  water,
  energy,
  needed,
  bought,
  mix,
  latest,
  onWater,
  onEnergy,
}: {
  id: InsightWidgetId
  profile: Profile
  meals: LoggedMeal[]
  proteinMeals: number
  fiber: number
  water: number
  energy: number | null
  needed: number
  bought: number
  mix: { p: number; c: number; f: number }
  latest?: LoggedMeal
  onWater: () => void
  onEnergy: (level: number) => void
}) {
  if (id === 'protein') {
    return (
      <>
        <span className="card-title">Protein</span>
        <span className="stat">{proteinMeals}</span>
        <span className="caption">{proteinMeals === 1 ? 'meal' : 'meals'}</span>
      </>
    )
  }
  if (id === 'fiber') {
    return (
      <>
        <span className="card-title">Fiber</span>
        <span className="stat">{fiber}</span>
        <span className="caption">{fiber === 1 ? 'food' : 'foods'}</span>
      </>
    )
  }
  if (id === 'water') {
    return (
      <>
        <span className="card-title">Water</span>
        <button type="button" className="glass-row" onClick={onWater} aria-label="Add a glass of water">
          {Array.from({ length: 8 }, (_, index) => (
            <span key={index} className={index < water ? 'glass on' : 'glass'} />
          ))}
        </button>
        <span className="caption">{water} today</span>
      </>
    )
  }
  if (id === 'energy') {
    return (
      <>
        <span className="card-title">Energy</span>
        <div className="energy-row" role="group" aria-label="Energy level">
          {[1, 2, 3, 4, 5].map((level) => (
            <button key={level} type="button" className={energy === level ? 'energy-dot on' : 'energy-dot'} onClick={() => onEnergy(level)} aria-label={`Energy ${level} of 5`}>
              {level}
            </button>
          ))}
        </div>
        <span className="caption">{energy ? `${energy}/5` : 'Tap to rate'}</span>
      </>
    )
  }
  if (id === 'consistency') {
    const days = meals.length > 0 ? 1 : 0
    return (
      <>
        <span className="card-title">Consistency</span>
        <span className="stat">{meals.length}</span>
        <span className="caption">
          {meals.length === 1 ? 'meal' : 'meals'} · {days} {days === 1 ? 'day' : 'days'}
        </span>
      </>
    )
  }
  if (id === 'variety') {
    return (
      <>
        <span className="card-title">Variety</span>
        <div className="variety-row">
          {varietyHits(meals).map((item) => (
            <span key={item.id} className={item.on ? 'variety-pill on' : 'variety-pill'}>
              {item.id}
            </span>
          ))}
        </div>
      </>
    )
  }
  if (id === 'grocery') {
    return (
      <>
        <span className="card-title">Groceries</span>
        <span className="stat">{needed}</span>
        <span className="caption">still needed · {bought} bought</span>
      </>
    )
  }
  if (id === 'wins') {
    const wins = [
      meals.length >= 5 ? '5 meals logged' : meals.length > 0 ? `${meals.length} logged` : null,
      proteinMeals > 0 ? 'Protein added' : null,
    ].filter((win): win is string => Boolean(win))
    return (
      <>
        <span className="card-title">Wins</span>
        {wins.length === 0 ? (
          <span className="caption">None yet</span>
        ) : (
          <div className="win-pills">
            {wins.map((win) => (
              <span key={win}>{win}</span>
            ))}
          </div>
        )}
      </>
    )
  }
  if (id === 'history') {
    return (
      <>
        <span className="card-title">History</span>
        {meals.length === 0 ? (
          <span className="caption">No meals yet</span>
        ) : (
          <>
            <div className="history-row">
              {meals.map((meal) => (
                <div key={meal.id} className="history-thumb">
                  <MealVisual image={meal.image} alt={meal.items.join(', ')} />
                </div>
              ))}
            </div>
            {latest?.suggestion ? <p className="history-note">{latest.suggestion}</p> : null}
          </>
        )}
      </>
    )
  }
  if (id === 'goal') {
    const width = Math.min(meals.length / 5, 1) * 100
    return (
      <>
        <span className="card-title">{goalName(profile)}</span>
        <span className="bar" aria-hidden="true">
          <span style={{ width: `${width}%` }} />
        </span>
        <span className="caption">{meals.length} of 5 meals</span>
      </>
    )
  }
  if (id === 'macros') {
    const max = Math.max(mix.p, mix.c, mix.f, 1)
    return (
      <>
        <span className="card-title">Macros · est.</span>
        <div className="macro-bars">
          <Macro label="P" value={mix.p} max={max} />
          <Macro label="C" value={mix.c} max={max} />
          <Macro label="F" value={mix.f} max={max} />
        </div>
      </>
    )
  }
  return (
    <>
      <span className="card-title">Glucose</span>
      <span className="stat">—</span>
      <span className="caption">Connect later</span>
    </>
  )
}

function Macro({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <span className="macro">
      <span className="macro-label">{label}</span>
      <span className="bar">
        <span style={{ width: `${(value / max) * 100}%` }} />
      </span>
    </span>
  )
}

function macroMix(meals: LoggedMeal[]) {
  const items = meals.flatMap((meal) => meal.items)
  const count = (pattern: RegExp) => items.filter((item) => pattern.test(item)).length
  return { p: count(PROTEIN), c: count(CARB), f: count(FAT) }
}

function WidgetGlyph({ id }: { id: InsightWidgetId }) {
  const path = {
    protein: 'M12 4 v16 M8 8 h8 M8 16 h8',
    fiber: 'M6 16c2-8 10-8 12 0',
    water: 'M12 4c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z',
    energy: 'M13 3 L6 13 h5 l-1 8 8-12 h-5 z',
    consistency: 'M5 7 h14 M5 12 h14 M5 17 h10',
    variety: 'M7 7 h4 v4 H7 z M13 7 h4 v4 h-4 z M7 13 h4 v4 H7 z M13 13 h4 v4 h-4 z',
    grocery: 'M6 7 h12 l-1 11 H7 z M9 7 V6 a3 3 0 0 1 6 0 v1',
    wins: 'M12 4 l2 4 4 .5 -3 3 .8 4.5 L12 14 l-3.8 2 0.8-4.5 -3-3 4-.5 z',
    history: 'M5 6 h14 v12 H5 z M8 10 h8 M8 14 h5',
    goal: 'M5 16 V8 h4 v8 M11 16 V5 h4 v11 M17 16 v-6 h3',
    macros: 'M6 16 V10 M12 16 V6 M18 16 v-4',
    glucose: 'M8 12 h8 M12 8 v8',
  }[id]
  return (
    <svg className="glyph" viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
