import { MealVisual } from '../components/MealVisual'
import { Yami } from '../components/Yami'
import { CameraIcon, CartIcon, SafetyNote, Screen, TabBar, type TabId } from '../components/ui'
import { mealTiming } from '../data/rhythm'
import { equippedLook } from '../data/wardrobe'
import { useClock } from '../useClock'
import type { GroceryItem, LoggedMeal, Profile, WidgetId } from '../types'

const WIDGET_LABEL: Record<WidgetId, string> = {
  protein: 'Protein',
  fiber: 'Fiber',
  water: 'Water',
  energy: 'Energy',
  consistency: 'Meal consistency',
  macros: 'Macros',
  calories: 'Calories',
  weight: 'Weight',
}

function widgetLine(id: WidgetId, meals: LoggedMeal[], water: number) {
  const proteinMeals = meals.filter((meal) => meal.hadProtein).length
  if (id === 'protein') return proteinMeals > 0 ? `Protein showed up in ${proteinMeals} logged meal${proteinMeals === 1 ? '' : 's'}.` : 'No tally yet. It will notice protein when you log.'
  if (id === 'fiber') return meals.some((meal) => /salad|spinach|berry|apple|oat|bean/i.test(meal.items.join(' '))) ? 'Fiber showed up in something you logged.' : 'Fiber will show up here when a meal includes it.'
  if (id === 'water') return water === 0 ? 'Tap to note a glass. No streak to keep.' : `${water} glass${water === 1 ? '' : 'es'} noted today.`
  if (id === 'energy') return meals.length > 0 ? 'You ate today. Energy is a feeling, not a grade.' : 'Nothing to measure. Energy can just be a check-in.'
  if (id === 'consistency') return meals.length > 0 ? `You logged ${meals.length} meal${meals.length === 1 ? '' : 's'} today.` : 'No pressure. Today can stay open.'
  if (id === 'macros') return 'A light look only: protein and fiber, when they show up. No daily target.'
  if (id === 'calories') return 'Calories stay optional. I am not totaling them.'
  return 'Weight stays optional and quiet. Nothing to enter unless you want to.'
}

export function HomeScreen({
  profile,
  meals,
  grocery,
  water,
  onSnap,
  onWater,
  onTab,
}: {
  profile: Profile
  meals: LoggedMeal[]
  grocery: GroceryItem[]
  water: number
  onSnap: () => void
  onWater: () => void
  onTab: (tab: TabId) => void
}) {
  const widgets: WidgetId[] = [
    ...profile.widgets,
    ...(profile.trackCalories ? (['calories'] as WidgetId[]) : []),
    ...(profile.trackWeight ? (['weight'] as WidgetId[]) : []),
  ]
  const openCount = grocery.filter((item) => !item.done).length
  const timing = mealTiming(useClock(), meals, 'home')
  const look = equippedLook(profile)

  return (
    <Screen className="home" footer={<TabBar current="home" onChange={onTab} />}>
      <header className="home-header">
        <button type="button" className="cart-button" onClick={() => onTab('grocery')} aria-label={`Grocery list, ${openCount} to pick up`}>
          <CartIcon />
          {openCount > 0 ? <span className="cart-badge">{openCount}</span> : null}
        </button>
      </header>

      <div className="yami-presence">
        <Yami mood={timing.mood} character={look.character} outfit={look.outfit} className="yami-md yami-float" />
        <p className="yami-cue">{timing.line}</p>
        <button type="button" className="streak-pill" onClick={() => onTab('profile')}>
          {profile.bestStreak === 0 ? 'Dress Yami' : `${profile.bestStreak}-day streak · Dress Yami`}
        </button>
      </div>

      <button type="button" className="snap-button" onClick={onSnap}>
        <span className="snap-icon">
          <CameraIcon />
        </span>
        Snap a meal
      </button>

      {widgets.length > 0 && (
        <section>
          <h2>Today, if you want</h2>
          <div className="widget-grid">
            {widgets.map((id) =>
              id === 'water' ? (
                <button key={id} type="button" className="widget" onClick={onWater}>
                  <span className="widget-label">{WIDGET_LABEL[id]}</span>
                  <span>{widgetLine(id, meals, water)}</span>
                </button>
              ) : (
                <article key={id} className="widget">
                  <span className="widget-label">{WIDGET_LABEL[id]}</span>
                  <span>{widgetLine(id, meals, water)}</span>
                </article>
              ),
            )}
          </div>
        </section>
      )}

      <section className="today">
        <h2>Recent meals</h2>
        {meals.length === 0 ? (
          <div className="empty">
            <p>No meals logged yet today</p>
            <p className="sub">Whenever you're hungry, a photo is enough.</p>
          </div>
        ) : (
          <ul className="meal-list">
            {meals.map((meal) => (
              <li key={meal.id} className="meal-card">
                <div className="thumb">
                  <MealVisual image={meal.image} alt={meal.items.join(', ')} />
                </div>
                <div className="meal-copy">
                  <p>{meal.summary}</p>
                  <p className="sub">
                    {meal.items.join(' · ')} · {meal.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <SafetyNote />
    </Screen>
  )
}
