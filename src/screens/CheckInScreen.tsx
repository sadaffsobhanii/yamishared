import { useRef, useState } from 'react'
import { Yami } from '../components/Yami'
import { PrimaryButton, Screen } from '../components/ui'
import { badges, nextStep, wins } from '../data/progress'
import type { GroceryItem, LoggedMeal, Profile } from '../types'

const CHIPS = ['I felt more energized', 'Tracking felt easy', 'I got busy', 'I need simpler ideas', 'I want to change my focus']

export function CheckInScreen({
  done,
  profile,
  meals,
  grocery,
  water,
  answers: saved,
  onDone,
  onBack,
}: {
  done: boolean
  profile: Profile
  meals: LoggedMeal[]
  grocery: GroceryItem[]
  water: number
  answers: string[]
  onDone: (answers: string[]) => void
  onBack: () => void
}) {
  const [answers, setAnswers] = useState<string[]>([])
  const [recording, setRecording] = useState(false)
  const [heard, setHeard] = useState(false)
  const [micNote, setMicNote] = useState('')
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)

  async function toggleMic() {
    if (recording) {
      recorder.current?.stop()
      stream.current?.getTracks().forEach((track) => track.stop())
      setRecording(false)
      setHeard(true)
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicNote("I can't use the mic here — the chips are enough.")
      return
    }
    try {
      const live = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.current = live
      const media = new MediaRecorder(live)
      recorder.current = media
      media.start()
      setRecording(true)
      setMicNote('Listening. Tap again when you want to stop.')
    } catch {
      setMicNote("I can't use the mic here — the chips are enough.")
    }
  }

  if (done) {
    const week = { meals, grocery, water, checkInDone: true, answers: saved }
    const earned = badges(week).filter((badge) => badge.earned)
    return (
      <Screen className="checkin recap-week" onBack={onBack} footer={<PrimaryButton onClick={onBack}>Back home</PrimaryButton>}>
        <div className="hero">
          <Yami pose="rest" className="yami-md yami-float" />
          <h1>Your Sunday recap{profile.name ? `, ${profile.name}` : ''}</h1>
          <p className="sub">Three wins, and one small idea. That's it.</p>
        </div>
        <section className="swap-card">
          <p className="swap-kicker">Three wins this week</p>
          <ol className="wins">
            {wins(week).map((win) => (
              <li key={win}>{win}</li>
            ))}
          </ol>
        </section>
        <section className="swap-card">
          <p className="swap-kicker">One small idea for next week</p>
          <p>{nextStep(week)}</p>
        </section>
        {earned.length > 0 && (
          <div className="badge-row">
            {earned.map((badge) => (
              <span key={badge.id} className="badge">
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </Screen>
    )
  }

  return (
    <Screen
      className="checkin"
      onBack={onBack}
      footer={
        <PrimaryButton onClick={() => onDone(answers)} disabled={answers.length === 0 && !heard}>
          Save this check-in
        </PrimaryButton>
      }
    >
      <div className="checkin-top">
        <Yami pose="rest" className="yami-sm yami-float" />
        <h1>Time for your Yami check-in</h1>
        <p className="sub">Tell Yami how this week felt. This is optional, and short.</p>
      </div>
      <button type="button" className={recording ? 'chip selected' : 'chip'} onClick={() => void toggleMic()}>
        {recording ? 'Stop recording' : heard ? 'Voice noted' : 'Record a voice note'}
      </button>
      {micNote ? <p className="note">{micNote}</p> : null}
      <div className="options">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            className={answers.includes(chip) ? 'option selected' : 'option'}
            onClick={() => setAnswers((current) => (current.includes(chip) ? current.filter((item) => item !== chip) : [...current, chip]))}
          >
            {chip}
          </button>
        ))}
      </div>
    </Screen>
  )
}
