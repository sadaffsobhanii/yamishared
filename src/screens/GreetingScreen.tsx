import { useState } from 'react'
import { Yami } from '../components/Yami'
import { PrimaryButton, Screen } from '../components/ui'

export function GreetingScreen({ onStart }: { onStart: () => void }) {
  const [leaving, setLeaving] = useState(false)

  function leave() {
    if (leaving) return
    setLeaving(true)
    window.setTimeout(onStart, 820)
  }

  return (
    <Screen
      className={leaving ? 'greeting is-leaving' : 'greeting'}
      footer={
        <PrimaryButton onClick={leave} disabled={leaving}>
          Let's get started
        </PrimaryButton>
      }
    >
      <div className="hero">
        {leaving ? <div className="swirl" aria-hidden="true" /> : null}
        <Yami pose="greeting" className="yami-lg yami-float" />
        <h1>Hi there! Welcome to Yami.</h1>
        <p className="sub">
          Yami is built around your life — not one strict diet. We'll look for habits that can last, not a perfect plate.
        </p>
      </div>
    </Screen>
  )
}
