import { useEffect, useRef, useState } from 'react'
import { Yami } from '../components/Yami'
import { Screen } from '../components/ui'
import { hear, type HearId } from '../data/listen'
import type { Profile } from '../types'

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
    ask: 'What should I call you?',
    probe: 'Just a name is enough — whatever you go by.',
  },
  {
    id: 'language',
    ask: 'Is there another language you speak at home? Even a little is welcome.',
    probe: 'English is fine. Or name the language, however you say it.',
  },
  {
    id: 'goals',
    ask: 'What would you like this to help with?',
    probe: 'Energy, building muscle, blood sugar, feeling better around food, being more aware — or say it your own way.',
  },
  {
    id: 'diet',
    ask: 'How do you like to eat? Any foods you leave out, or a way of eating that matters to you?',
    probe: 'Vegetarian, vegan, keto, an allergy, something a doctor already suggested, eating out a lot — or nothing specific.',
  },
  {
    id: 'past',
    ask: 'Have nutrition apps gotten in the way before?',
    probe: 'Too slow to log, numbers that felt stressful, losing motivation, life getting busy — or this might be your first try.',
  },
  {
    id: 'budget',
    ask: 'What feels comfortable to spend on groceries in a week?',
    probe: 'A rough number is enough. If you are a student, you can say that too.',
  },
  {
    id: 'shop',
    ask: 'Do you usually shop in the store, order online, or both?',
    probe: 'In the store, online, or both — and a store name, if one comes to mind.',
  },
  {
    id: 'track',
    ask: 'What would you like to notice? Not everything — just what would feel good on your home screen.',
    probe: 'Protein, fiber, water, energy, meal consistency, macros. Calories and weight only if you want them.',
  },
]

function uid() {
  return crypto.randomUUID()
}

export function OnboardingScreen({
  onChange,
  onEnter,
}: {
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
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [micNote, setMicNote] = useState('')
  const indexRef = useRef(0)
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
    setBubbles([{ id: uid(), from: 'yami', text: 'Welcome. I love to get to know you.' }])
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
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [bubbles, live, thinking, listening])

  function speak(text: string, voice: boolean) {
    if (busy || done) return
    stopMic()
    setTyping(false)
    setDraft('')
    setMicNote('')
    setBusy(true)
    setBubbles((current) => [...current, { id: uid(), from: 'you', text, voice }])
    setThinking(true)

    const question = QUESTIONS[indexRef.current]
    const heard = hear(question.id, text, probedRef.current)
    later(() => {
      setThinking(false)
      if (!heard.understood) {
        probedRef.current = true
        setBubbles((current) => [...current, { id: uid(), from: 'yami', text: question.probe }])
        setBusy(false)
        return
      }
      onChange(heard.patch)
      probedRef.current = false
      const next = indexRef.current + 1
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
              text: "That's plenty for now. Your home screen, the ideas I offer, your grocery list, and the pace of tracking will follow this conversation.",
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
    stopMic()
    probedRef.current = false
    setBusy(true)
    setBubbles((current) => [...current, { id: uid(), from: 'you', text: 'Skip for now' }])
    const next = indexRef.current + 1
    indexRef.current = next
    setProgress(next / QUESTIONS.length)
    later(() => {
      setBubbles((current) => [...current, { id: uid(), from: 'yami', text: 'We can leave that for later.' }])
      later(() => {
        if (next >= QUESTIONS.length) {
          setBubbles((current) => [
            ...current,
            {
              id: uid(),
              from: 'yami',
              text: "That's plenty for now. Your home screen, the ideas I offer, your grocery list, and the pace of tracking will follow what you did share.",
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

  const footer = done ? (
    <button type="button" className="btn-primary" onClick={onEnter}>
      Enter Yami
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

function MicIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 11 a6 6 0 0 0 12 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 17 v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
