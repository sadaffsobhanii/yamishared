import { Phrase } from '../components/Phrase'
import { Yami } from '../components/Yami'
import { Screen } from '../components/ui'
import { getLanguage } from '../data/languages'
import { equippedLook } from '../data/wardrobe'
import type { MealTiming, Profile } from '../types'

export function AnalyzingScreen({ profile, timing }: { profile: Profile; timing: MealTiming }) {
  const language = getLanguage(profile.languageId)
  const look = equippedLook(profile)

  return (
    <Screen className="analyzing">
      <div className="hero">
        <Yami mood={timing.mood} character={look.character} outfit={look.outfit} className="yami-md yami-pulse" />
        <h1>Analyzing…</h1>
        <p className="yami-cue">{timing.line}</p>
        <p className="sub">
          {language ? (
            <>
              <Phrase language={language} kind="encouragement" /> —{' '}
            </>
          ) : null}
          Give me one quiet second. I'm looking this over with you.
        </p>
        <div className="analyzing-bar" aria-hidden="true">
          <span />
        </div>
      </div>
    </Screen>
  )
}
