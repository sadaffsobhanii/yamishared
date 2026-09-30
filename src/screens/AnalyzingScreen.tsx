import { Phrase } from '../components/Phrase'
import { Yami } from '../components/Yami'
import { Screen } from '../components/ui'
import { getLanguage } from '../data/languages'
import type { Profile } from '../types'

export function AnalyzingScreen({ profile }: { profile: Profile }) {
  const language = getLanguage(profile.languageId)

  return (
    <Screen className="analyzing">
      <div className="hero">
        <Yami pose="rest" className="yami-md yami-pulse" />
        <h1>Analyzing…</h1>
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
