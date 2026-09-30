import { useState } from 'react'
import { MealVisual } from '../components/MealVisual'
import { Phrase } from '../components/Phrase'
import { Yami } from '../components/Yami'
import { PrimaryButton, SafetyNote, Screen } from '../components/ui'
import { getLanguage } from '../data/languages'
import { hasProtein } from '../data/meals'
import type { MealResult, Profile, Variants } from '../types'

const FIBER = /spinach|salad|green|berry|berries|apple|banana|oat|bean|lentil|chickpea|edamame|toast|bread/i

export function ResultScreen({
  profile,
  result,
  variant,
  favorite,
  onFavorite,
  onBack,
  onAdd,
  onLog,
}: {
  profile: Profile
  result: MealResult
  variant: Variants['recommendation']
  favorite: boolean
  onFavorite: () => void
  onBack: () => void
  onAdd: () => void
  onLog: () => void
}) {
  const language = getLanguage(profile.languageId)
  const [whyOpen, setWhyOpen] = useState(false)
  const [showScore, setShowScore] = useState(false)
  const hideNumbers = profile.pastApps.includes('numbers-stress') && !profile.trackCalories

  return (
    <Screen className="result" onBack={onBack} footer={<PrimaryButton onClick={onLog}>Log it</PrimaryButton>}>
      <div className="result-photo">
        <MealVisual image={result.image} alt={result.items.join(', ')} />
      </div>
      <p className="items-line">{result.items.join(' · ')}</p>
      <button type="button" className={favorite ? 'chip selected fav-toggle' : 'chip fav-toggle'} aria-pressed={favorite} onClick={onFavorite}>
        {favorite ? '♥ Saved to favorites' : '♡ Save as a favorite'}
      </button>
      <div className="speech">
        <Yami pose="rest" className="yami-sm" />
        <div className="bubble">
          <p>
            {language ? (
              <>
                <Phrase language={language} kind="praise" /> —{' '}
              </>
            ) : null}
            {result.summary}
          </p>
        </div>
      </div>

      {variant === 'data-only' ? (
        <section className="swap-card">
          <p className="swap-kicker">What's in this meal</p>
          <ul className="data-list">
            <li>
              <span>Protein</span>
              <span>{hasProtein(result.items) ? 'Present' : 'Not spotted'}</span>
            </li>
            <li>
              <span>Fiber</span>
              <span>{FIBER.test(result.items.join(' ')) ? 'Present' : 'Not spotted'}</span>
            </li>
            <li>
              <span>Items</span>
              <span>{result.items.length}</span>
            </li>
          </ul>
        </section>
      ) : (
        <section className="swap-card">
          <p className="swap-kicker">A small idea for your next meal</p>
          <p>{result.recommendation}</p>
          {result.budgetNote ? <p className="for-line">{result.budgetNote}</p> : null}
          <button type="button" className="text-button why-toggle" onClick={() => setWhyOpen((open) => !open)} aria-expanded={whyOpen}>
            {whyOpen ? 'Hide why' : 'Why?'}
          </button>
          {whyOpen ? <p className="why">{result.why}</p> : null}
          <button type="button" className="btn-secondary" onClick={onAdd} disabled={result.added}>
            {result.added ? 'Added to your list ✓' : 'Add to grocery list'}
          </button>
        </section>
      )}

      {!hideNumbers && (
        <button type="button" className="text-button" onClick={() => setShowScore((open) => !open)}>
          {showScore ? 'Hide the number' : 'See a quiet number'}
        </button>
      )}
      {showScore ? (
        <p className="sub score-aside">A side note, not a grade: {result.analysis.score}. It is not a verdict on the meal.</p>
      ) : null}
      <SafetyNote />
    </Screen>
  )
}
