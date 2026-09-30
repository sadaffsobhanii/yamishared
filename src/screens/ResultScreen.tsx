import { useState } from 'react'
import { MealVisual } from '../components/MealVisual'
import { Phrase } from '../components/Phrase'
import { Yami } from '../components/Yami'
import { PrimaryButton, SafetyNote, Screen } from '../components/ui'
import { getLanguage } from '../data/languages'
import type { MealResult, Profile } from '../types'

export function ResultScreen({
  profile,
  result,
  onBack,
  onAdd,
  onLog,
}: {
  profile: Profile
  result: MealResult
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
