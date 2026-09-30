import { useEffect, useRef, useState } from 'react'
import { Yami } from '../components/Yami'
import { Screen } from '../components/ui'
import { DIET_WORDS, GOAL_WORDS, PACES, WIDGET_WORDS, hear, type HearId } from '../data/listen'
import type { Profile, Variants } from '../types'

type SpeechResult = { isFinal: boolean; 0: { transcript: string } }
type SpeechEvent = { results: ArrayLike<SpeechResult> }
type SpeechRec = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type Bubble = { id: string; from: 'yami' | 'you'; text: string; voice?: boolean }

const QUESTIONS: { id: HearId; ask: string; probe: string }[] = [
  {
    id: 'name',
    ask: 'First things first — what should I call you?',
    probe: 'Just a name is enough — whatever you go by.',
  },
  {
    id: 'goals',
    ask: "What's bringing you to Yami? What would feel like a win a few months from now?",
    probe: 'Energy, building muscle, blood sugar, feeling better around food, being more aware — or say it your own way.',
  },
  {
    id: 'diet',
    ask: 'How do you like to eat? Anything I should work around?',
    probe: 'Vegetarian, vegan, keto, an allergy, something a doctor already suggested, eating out a lot — or nothing specific.',
  },
  {
    id: 'past',
    ask: 'Have you tried tracking your food before? What got in the way?',
    probe: 'Too slow to log, numbers that felt stressful, losing motivation, life getting busy — or this might be your first try.',
  },
  {
    id: 'pace',
    ask: 'How much would you like me around — a light touch, a steady rhythm, or more detail?',
    probe: 'A light touch, a steady rhythm, or more detail — whatever feels right.',
  },
  {
    id: 'budget',
    ask: "Let's talk groceries. About how much do you like to spend in a week?",
    probe: 'A rough number is enough. If you are a student, you can say that too.',
  },
  {
    id: 'shop',
    ask: 'And do you usually shop in the store, order online, or a bit of both?',
    probe: 'In the store, online, or both — and a store name, if one comes to mind.',
  },
  {
    id: 'track',
    ask: 'Last one! What would you like to keep an eye on? Only what feels good — nothing more.',
    probe: 'Protein, fiber, water, energy, meal consistency, macros. Calories and weight only if you want them.',
  },
]

function uid() {
  return crypto.randomUUID()
}

type AiResult = { reply: string; done: boolean; updates: Record<string, unknown> }

// Which onboarding topic each profile field answers, so progress and the scripted fallback know what's covered.
const FIELD_TOPIC: Record<string, HearId> = {
  name: 'name',
  goals: 'goals',
  goalCustom: 'goals',
  diets: 'diet',
  allergyNote: 'diet',
  pastApps: 'past',
  pace: 'pace',
  budget: 'budget',
  studentBudget: 'budget',
  shopMode: 'shop',
  shopStore: 'shop',
  widgets: 'track',
  trackCalories: 'track',
  trackWeight: 'track',
}

async function askYami(turns: Bubble[], profile: Partial<Profile>): Promise<AiResult> {
  const response = await fetch('/api/onboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ turns: turns.map(({ from, text }) => ({ from, text })), profile }),
  })
  if (!response.ok) throw new Error(`onboard ${response.status}`)
  return response.json()
}

export function OnboardingScreen({
  profile,
  variant,
  onChange,
  onEnter,
}: {
  profile: Profile
  variant: Variants['onboarding']
  onChange: (patch: Partial<Profile>) => void
  onEnter: () => void
}) {
  if (variant === 'quiz') return <RecapScreen mode="quiz" profile={profile} onChange={onChange} onEnter={onEnter} />
  return <VoiceOnboarding profile={profile} onChange={onChange} onEnter={onEnter} />
}

function VoiceOnboarding({
  profile,
  onChange,
  onEnter,
}: {
  profile: Profile
  onChange: (patch: Partial<Profile>) => void
  onEnter: () => void
}) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [progress, setProgress] = useState(0)
  const [listening, setListening] = useState(false)
  const [live, setLive] = useState('')
  const [thinking, setThinking] = useState(false)
  const [busy, setBusy] = useState(true)
  const [done, setDone] = useState(false)
  const [recap, setRecap] = useState(false)
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [micNote, setMicNote] = useState('')
  const indexRef = useRef(0)
  const aiRef = useRef(true)
  const bubblesRef = useRef<Bubble[]>([])
  const knownRef = useRef<Partial<Profile>>({})
  const answeredRef = useRef(new Set<HearId>())
  const probedRef = useRef(false)
  const heardRef = useRef('')
  const recRef = useRef<SpeechRec | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
  }

  useEffect(() => {
    setBubbles([{ id: uid(), from: 'yami', text: 'Welcome. I would love to get to know you.' }])
    later(() => {
      setBubbles((current) => [...current, { id: uid(), from: 'yami', text: QUESTIONS[0].ask }])
      setBusy(false)
    }, 900)
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      recRef.current?.stop()
    }
  }, [])

  useEffect(() => {
    bubblesRef.current = bubbles
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [bubbles, live, thinking, listening])

  function remember(patch: Partial<Profile>) {
    onChange(patch)
    knownRef.current = { ...knownRef.current, ...patch }
    Object.keys(patch).forEach((field) => {
      const topic = FIELD_TOPIC[field]
      if (topic) answeredRef.current.add(topic)
    })
  }

  function nextOpen(from: number) {
    let next = from
    while (next < QUESTIONS.length && answeredRef.current.has(QUESTIONS[next].id)) next += 1
    return next
  }

  function say(text: string) {
    setBubbles((current) => [...current, { id: uid(), from: 'yami', text }])
  }

  function applyAi(result: AiResult) {
    const patch = Object.fromEntries(Object.entries(result.updates ?? {}).filter(([, value]) => value != null)) as Partial<Profile>
    if (Object.keys(patch).length) remember(patch)
    setThinking(false)
    say(result.reply)
    if (result.done) {
      setProgress(1)
      setDone(true)
    } else {
      setProgress(answeredRef.current.size / QUESTIONS.length)
    }
    setBusy(false)
  }

  function speak(text: string, voice: boolean) {
    if (busy || done) return
    stopMic()
    if (voice) setTyping(false)
    setDraft('')
    setMicNote('')
    setBusy(true)
    const turn: Bubble = { id: uid(), from: 'you', text, voice }
    setBubbles((current) => [...current, turn])
    setThinking(true)

    if (aiRef.current) {
      askYami([...bubblesRef.current, turn], knownRef.current)
        .then(applyAi)
        .catch(() => {
          // No key or the API is unreachable: carry on with the scripted questions from the first open topic.
          aiRef.current = false
          indexRef.current = nextOpen(0)
          scripted(text)
        })
      return
    }
    scripted(text)
  }

  function scripted(text: string) {
    if (indexRef.current >= QUESTIONS.length) {
      setThinking(false)
      say("That's everything I need. Thank you for sharing all that! Here's what I heard.")
      setProgress(1)
      setDone(true)
      setBusy(false)
      return
    }
    const question = QUESTIONS[indexRef.current]
    const heard = hear(question.id, text, question.id !== 'name' || probedRef.current)
    later(() => {
      setThinking(false)
      if (!heard.understood) {
        probedRef.current = true
        setBubbles((current) => [...current, { id: uid(), from: 'yami', text: question.probe }])
        setBusy(false)
        return
      }
      remember(heard.patch)
      answeredRef.current.add(question.id)
      probedRef.current = false
      const next = nextOpen(indexRef.current + 1)
      indexRef.current = next
      setProgress(next / QUESTIONS.length)
      setBubbles((current) => [...current, { id: uid(), from: 'yami', text: heard.reflection }])
      later(() => {
        if (next >= QUESTIONS.length) {
          setBubbles((current) => [
            ...current,
            {
              id: uid(),
              from: 'yami',
              text: "That's everything I need. Thank you for sharing all that! Here's what I heard.",
            },
          ])
          setDone(true)
        } else {
          setBubbles((current) => [...current, { id: uid(), from: 'yami', text: QUESTIONS[next].ask }])
        }
        setBusy(false)
      }, 700)
    }, 650)
  }

  function skip() {
    if (busy || done) return
    if (aiRef.current) {
      speak('Skip for now', false)
      return
    }
    stopMic()
    probedRef.current = false
    setBusy(true)
    setBubbles((current) => [...current, { id: uid(), from: 'you', text: 'Skip for now' }])
    const next = nextOpen(indexRef.current + 1)
    indexRef.current = next
    setProgress(next / QUESTIONS.length)
    later(() => {
      setBubbles((current) => [...current, { id: uid(), from: 'yami', text: 'No problem — we can come back to that.' }])
      later(() => {
        if (next >= QUESTIONS.length) {
          setBubbles((current) => [
            ...current,
            {
              id: uid(),
              from: 'yami',
              text: "That's plenty to get started. Here's what I heard so far.",
            },
          ])
          setDone(true)
        } else {
          setBubbles((current) => [...current, { id: uid(), from: 'yami', text: QUESTIONS[next].ask }])
        }
        setBusy(false)
      }, 500)
    }, 400)
  }

  function stopMic() {
    recRef.current?.stop()
    recRef.current = null
    setListening(false)
    setLive('')
    heardRef.current = ''
  }

  function toggleMic() {
    if (busy || done) return
    if (listening) {
      recRef.current?.stop()
      return
    }
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Ctor) {
      setMicNote("This browser can't transcribe. Type your answer, and I'll treat it as what you said.")
      setTyping(true)
      return
    }
    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.onresult = (event) => {
      let text = ''
      for (let i = 0; i < event.results.length; i += 1) text += event.results[i][0].transcript
      heardRef.current = text
      setLive(text)
    }
    rec.onerror = () => {
      setListening(false)
      setMicNote("I didn't catch that. Try once more, or type it.")
      setTyping(true)
    }
    rec.onend = () => {
      const text = heardRef.current.trim()
      setListening(false)
      setLive('')
      heardRef.current = ''
      recRef.current = null
      if (text) speak(text, true)
      else setMicNote('Tap again when you want to answer.')
    }
    recRef.current = rec
    setMicNote('')
    setTyping(false)
    setListening(true)
    try {
      rec.start()
    } catch {
      setListening(false)
      setMicNote("I can't use the mic here. Type this one, and I'll listen to the words.")
      setTyping(true)
    }
  }

  if (recap) return <RecapScreen mode="recap" profile={profile} onChange={onChange} onEnter={onEnter} />

  const footer = done ? (
    <button type="button" className="btn-primary" onClick={() => setRecap(true)}>
      See what I heard
    </button>
  ) : (
    <div className="chat-compose">
      {typing ? (
        <form
          className="chat-type"
          onSubmit={(event) => {
            event.preventDefault()
            if (draft.trim()) speak(draft.trim(), false)
          }}
        >
          <input
            className="field"
            autoFocus
            value={draft}
            placeholder="Say it in words"
            maxLength={240}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" className="chip selected" disabled={!draft.trim() || busy}>
            Send
          </button>
        </form>
      ) : null}
      <button
        type="button"
        className={listening ? 'mic-button listening' : 'mic-button'}
        onClick={toggleMic}
        disabled={busy}
        aria-pressed={listening}
        aria-label={listening ? 'Stop and send your answer' : 'Answer with your voice'}
      >
        <MicIcon />
      </button>
      <p className="mic-hint">{listening ? 'Listening. Tap when you are done.' : 'Tap and answer out loud.'}</p>
      {micNote ? <p className="note">{micNote}</p> : null}
      <div className="chat-quiet">
        <button type="button" className="text-btn" onClick={() => setTyping((open) => !open)} disabled={busy || listening}>
          {typing ? 'Back to voice' : 'Type instead'}
        </button>
        <button type="button" className="text-btn" onClick={skip} disabled={busy || listening}>
          Skip for now
        </button>
      </div>
      <p className="safety chat-safety">A conversation to get to know you. Not therapy, and not medical advice.</p>
    </div>
  )

  return (
    <Screen className="intake" progress={done ? 1 : progress} corner={<Yami pose="rest" className="yami-corner yami-float" />} footer={footer}>
      <div className="chat-log" aria-live="polite">
        {bubbles.map((bubble) => (
          <div key={bubble.id} className={bubble.from === 'yami' ? 'bubble-row yami' : 'bubble-row you'}>
            {bubble.from === 'yami' ? <Yami pose="rest" className="yami-tiny" /> : null}
            <p className="bubble">
              {bubble.text}
              {bubble.voice ? <span className="bubble-meta">Voice</span> : null}
            </p>
          </div>
        ))}
        {listening ? (
          <div className="bubble-row you">
            <p className="bubble live">{live.trim() || 'Listening…'}</p>
          </div>
        ) : null}
        {thinking ? (
          <div className="bubble-row yami">
            <Yami pose="rest" className="yami-tiny" />
            <p className="bubble thinking" aria-label="Yami is thinking">
              <span />
              <span />
              <span />
            </p>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>
    </Screen>
  )
}

const SHOP_MODES: { id: Profile['shopMode']; label: string }[] = [
  { id: 'in-store', label: 'In the store' },
  { id: 'online', label: 'Online' },
  { id: 'both', label: 'Both' },
]

function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item]
}

// The end-of-conversation recap doubles as the tap-through quiz for the onboarding A/B test.
function RecapScreen({
  mode,
  profile,
  onChange,
  onEnter,
}: {
  mode: 'recap' | 'quiz'
  profile: Profile
  onChange: (patch: Partial<Profile>) => void
  onEnter: () => void
}) {
  const diets = profile.diets.filter((id) => id !== 'none')
  return (
    <Screen
      className="intake recap"
      progress={1}
      corner={<Yami pose="rest" className="yami-corner yami-float" />}
      footer={
        <button type="button" className="btn-primary" onClick={onEnter}>
          {mode === 'quiz' ? 'Enter Yami' : 'Looks right — enter Yami'}
        </button>
      }
    >
      <h1>{mode === 'quiz' ? 'A few quick questions' : "Here's what I heard"}</h1>
      <p className="sub">
        {mode === 'quiz' ? 'Tap what fits. Skip anything you like — you can change it later.' : 'Tap anything to change it. You can always update this later.'}
      </p>

      <section className="recap-block">
        <h2>Name</h2>
        <input
          className="field"
          value={profile.name}
          placeholder="What should I call you?"
          maxLength={40}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </section>

      <section className="recap-block">
        <h2>What you'd like help with</h2>
        <div className="chips">
          {GOAL_WORDS.map((goal) => (
            <button
              key={goal.id}
              type="button"
              className={profile.goals.includes(goal.id) ? 'chip selected' : 'chip'}
              aria-pressed={profile.goals.includes(goal.id)}
              onClick={() => onChange({ goals: toggle(profile.goals, goal.id) })}
            >
              {goal.label}
            </button>
          ))}
        </div>
        {profile.goalCustom ? <p className="note">In your words: “{profile.goalCustom}”</p> : null}
      </section>

      <section className="recap-block">
        <h2>How you eat</h2>
        <div className="chips">
          {DIET_WORDS.map((diet) => (
            <button
              key={diet.id}
              type="button"
              className={diets.includes(diet.id) ? 'chip selected' : 'chip'}
              aria-pressed={diets.includes(diet.id)}
              onClick={() => onChange({ diets: toggle(diets, diet.id) })}
            >
              {diet.label}
            </button>
          ))}
        </div>
      </section>

      <section className="recap-block">
        <h2>How much you'd like me around</h2>
        <div className="chips">
          {PACES.map((pace) => (
            <button
              key={pace.id}
              type="button"
              className={profile.pace === pace.id ? 'chip selected' : 'chip'}
              aria-pressed={profile.pace === pace.id}
              onClick={() => onChange({ pace: pace.id })}
            >
              {pace.label}
            </button>
          ))}
        </div>
        {profile.pace ? <p className="note">{PACES.find((pace) => pace.id === profile.pace)?.blurb}</p> : null}
      </section>

      <section className="recap-block">
        <h2>Weekly grocery budget</h2>
        <label className="money">
          <span>$</span>
          <input
            inputMode="numeric"
            value={profile.budget}
            placeholder="Optional"
            maxLength={4}
            onChange={(event) => onChange({ budget: event.target.value.replace(/\D/g, '') })}
          />
        </label>
        <label className="toggle-row">
          <span>Keep ideas student-budget friendly</span>
          <input type="checkbox" checked={profile.studentBudget} onChange={(event) => onChange({ studentBudget: event.target.checked })} />
        </label>
      </section>

      <section className="recap-block">
        <h2>Where you shop</h2>
        <div className="chips">
          {SHOP_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={profile.shopMode === mode.id ? 'chip selected' : 'chip'}
              aria-pressed={profile.shopMode === mode.id}
              onClick={() => onChange({ shopMode: mode.id })}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </section>

      <section className="recap-block">
        <h2>On your home screen</h2>
        <div className="chips">
          {WIDGET_WORDS.map((widget) => (
            <button
              key={widget.id}
              type="button"
              className={profile.widgets.includes(widget.id) ? 'chip selected' : 'chip'}
              aria-pressed={profile.widgets.includes(widget.id)}
              onClick={() => onChange({ widgets: toggle(profile.widgets, widget.id) })}
            >
              {widget.label}
            </button>
          ))}
        </div>
        <div className="toggles">
          <label className="toggle-row">
            <span>Show calories</span>
            <input type="checkbox" checked={profile.trackCalories} onChange={(event) => onChange({ trackCalories: event.target.checked })} />
          </label>
          <label className="toggle-row">
            <span>Show weight</span>
            <input type="checkbox" checked={profile.trackWeight} onChange={(event) => onChange({ trackWeight: event.target.checked })} />
          </label>
        </div>
        <p className="note">Calories and weight stay off unless you want them.</p>
      </section>
    </Screen>
  )
}

function MicIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 11 a6 6 0 0 0 12 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 17 v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
