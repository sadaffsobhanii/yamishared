import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Yami } from '../components/Yami'
import { Screen } from '../components/ui'
import { DIET_WORDS, GOAL_WORDS, PACES, WIDGET_WORDS } from '../data/listen'
import type { Profile } from '../types'

const DURATION = 3600

const STEPS = ['Picking your widgets', 'Stocking your grocery list', 'Setting your pace']

// Everything the person told Yami, as little cards that get stirred into their home screen.
function ingredients(profile: Profile) {
  const cards = [
    ...WIDGET_WORDS.filter((widget) => profile.widgets.includes(widget.id)).map((widget) => widget.label),
    ...GOAL_WORDS.filter((goal) => profile.goals.includes(goal.id)).map((goal) => goal.label),
    ...DIET_WORDS.filter((diet) => profile.diets.includes(diet.id)).map((diet) => diet.label),
    PACES.find((pace) => pace.id === profile.pace)?.label ?? '',
    'Grocery list',
    'Meal ideas',
    'Weekly check-in',
  ].filter(Boolean)
  return [...new Set(cards.map((card) => card.charAt(0).toUpperCase() + card.slice(1)))].slice(0, 9)
}

export function CustomizingScreen({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const [step, setStep] = useState(0)
  const cards = ingredients(profile)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    const tick = window.setInterval(() => setStep((current) => Math.min(current + 1, STEPS.length - 1)), DURATION / STEPS.length)
    const done = window.setTimeout(() => doneRef.current(), DURATION)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(done)
    }
  }, [])

  return (
    <Screen className="customizing">
      <div className="hero">
        <div className="stir" aria-hidden="true">
          {cards.map((card, index) => (
            <span
              key={card}
              className="stir-card"
              style={{ '--a': `${(360 / cards.length) * index}deg`, '--d': `${index * 90}ms` } as CSSProperties}
            >
              {card}
            </span>
          ))}
          <Yami pose="greeting" className="stir-yami yami-float" />
        </div>
        <h1>Customizing your Yami experience</h1>
        <p className="sub stir-step" key={step} aria-live="polite">
          {STEPS[step]}…
        </p>
      </div>
    </Screen>
  )
}
