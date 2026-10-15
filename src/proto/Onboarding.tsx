import { useEffect, useState } from 'react'
import { Bunny, RollingYami } from './Bunny'
import {
  ALLERGY_Q,
  HEALTH_Q,
  QUESTIONS,
  SRC,
  FREQ,
  canContinue,
  chipSelected,
  money,
  planLine,
  toggleChip,
  type Profile,
  type Sources,
} from './model'
import { useYami } from './store'

export function Onboarding() {
  const { P, setP, ob, setOb, go, gate, setGate } = useYami()
  const [draft, setDraft] = useState(P.name)
  const [phase, setPhase] = useState<'roll' | 'wave' | 'leaving' | 'survey'>(ob === -2 ? 'roll' : 'survey')
  const extras = (P.diet.includes('I have allergies') ? 1 : 0) + (P.diet.includes('I have health concerns') ? 1 : 0)
  const total = QUESTIONS.length + 2 + extras
  let step = ob + 2
  if (ob > 3) step += extras
  else if (gate === 'allergy') step += 1
  else if (gate === 'health') step += P.diet.includes('I have allergies') ? 2 : 1

  useEffect(() => {
    document.querySelector('.screen')?.scrollTo(0, 0)
  }, [ob, gate])

  useEffect(() => {
    if (phase !== 'roll' && phase !== 'wave') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const wait = reduce ? 700 : phase === 'roll' ? 1250 : 1600
    const timer = window.setTimeout(() => setPhase(phase === 'roll' ? 'wave' : 'leaving'), wait)
    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'leaving') return
    const timer = window.setTimeout(() => setPhase('survey'), 640)
    return () => window.clearTimeout(timer)
  }, [phase])

  function advanceIntro() {
    if (phase === 'roll') setPhase('wave')
    else if (phase === 'wave') setPhase('leaving')
  }

  function back() {
    if (gate === 'health') {
      setGate(P.diet.includes('I have allergies') ? 'allergy' : null)
      return
    }
    if (gate === 'allergy') {
      setGate(null)
      return
    }
    setOb(ob - 1)
  }

  function advance() {
    if (gate === 'allergy') {
      if (P.diet.includes('I have health concerns')) setGate('health')
      else { setGate(null); setOb(ob + 1) }
      return
    }
    if (gate === 'health') {
      setGate(null)
      setOb(ob + 1)
      return
    }
    if (ob === 3 && P.diet.includes('I have allergies')) { setGate('allergy'); return }
    if (ob === 3 && P.diet.includes('I have health concerns')) { setGate('health'); return }
    setOb(ob + 1)
  }

  const swipe = phase === 'leaving' ? ' ob-swipe' : ''
  const bar = (
    <div className={`topbar${swipe}`}>
      {step > 0 ? (
        <button className="back" aria-label="Back" onClick={back}>&lsaquo;</button>
      ) : (
        <span style={{ width: 48 }} />
      )}
      <div className="progress"><b style={{ width: `${Math.max(6, (step / total) * 100)}%` }} /></div>
    </div>
  )

  if (ob === -2) {
    const ready = draft.trim().length > 0
    function saveName() {
      if (!ready) return
      setP({ ...P, name: draft.trim() })
      setOb(-1)
    }
    const arrived = phase === 'leaving' || phase === 'survey'
    return (
      <>
        {phase !== 'survey' && (
          <button
            type="button"
            className={`welcome${phase === 'leaving' ? ' leaving' : ''}`}
            onClick={advanceIntro}
            aria-label={phase === 'roll' ? 'Yami is rolling in' : 'Welcome'}
          >
            <RollingYami mood="happy" size={188} wave={phase !== 'roll'} still={phase !== 'roll'} />
            {phase !== 'roll' && <p className="bubble welcome-line">Welcome!</p>}
          </button>
        )}
        {arrived && (
          <>
            {bar}
            <div className={`ob-body${swipe}`}>
              <div className="hello-yami">
                <RollingYami mood="happy" size={74} still />
                <div className="bubble">Help me get to personalize your experience.</div>
              </div>
              <h3 className="q">What's your name?</h3>
              <label className="lbl" htmlFor="nm" style={{ position: 'absolute', left: -9999 }}>Your name</label>
              <input
                className="field big"
                id="nm"
                autoComplete="given-name"
                placeholder="Your name"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName() }}
              />
            </div>
            <div className={`cta${swipe}`} style={{ position: 'absolute', left: 18, right: 18, bottom: 24 }}>
              <button className="btn" disabled={!ready} onClick={saveName}>Continue</button>
            </div>
          </>
        )}
      </>
    )
  }

  if (ob === -1) {
    return (
      <>
        {bar}
        <div className="center" style={{ marginTop: 8 }}><Bunny mood="happy" size={230} hat={false} /></div>
        <div className="ob-body">
        <div className="bubble">It's nice to meet you, {P.name}! I'm excited to learn what brought you to Yami today.</div>
        </div>
        <div className="cta" style={{ position: 'absolute', left: 18, right: 18, bottom: 24 }}>
          <button className="btn" onClick={() => setOb(0)}>Continue</button>
        </div>
      </>
    )
  }

  if (ob === QUESTIONS.length) {
    return (
      <>
        {bar}
        <div className="center" style={{ marginTop: 8 }}><Bunny mood="proud" size={160} hat={false} /></div>
        <div className="ob-body">
        <div className="bubble">Thank you, {P.name}. We've got you from here.</div>
        <div className="w hero"><div className="eyebrow">Your plan</div><p>{planLine(P)}</p></div>
        <p className="small center" style={{ marginTop: 14 }}>You can change any answer later on the You page.</p>
        </div>
        <div className="cta">
          <button className="btn" onClick={() => { setGate(null); setP({ ...P, onboarded: true }); go('home') }}>Let's begin</button>
        </div>
      </>
    )
  }

  const q = gate === 'allergy' ? ALLERGY_Q : gate === 'health' ? HEALTH_Q : QUESTIONS[ob]
  const ready = canContinue(P, q)
  return (
    <>
      {bar}
      <div className="ob-body">
      <h3 className="q">{q.q}</h3>
      {q.type === 'chips' && q.hint ? <p className="hint">{q.hint}</p> : <div style={{ height: 12 }} />}
      {q.type === 'chips' && (
        <>
          <div className="opts">
            {q.opts.map(option => (
              <button
                key={option}
                className="opt"
                aria-pressed={chipSelected(P, q.key, option)}
                onClick={() => setP(toggleChip(P, q.key, option, q.max))}
              >
                {option}
              </button>
            ))}
          </div>
          {q.text && (!q.textWhen || chipSelected(P, q.key, q.textWhen)) && (
            <>
              <label className="lbl" htmlFor="tx">{q.text.ph}</label>
              <textarea
                className="field big"
                id="tx"
                rows={2}
                placeholder="Type here"
                value={P[q.text.key]}
                onChange={e => setP({ ...P, [q.text!.key]: e.target.value } as Profile)}
              />
            </>
          )}
        </>
      )}
      {q.type === 'sources' && SRC.map(row => (
        <div className="slider w" key={row.key} style={{ marginBottom: 10 }}>
          <div className="top"><span>{row.label}</span><span>{FREQ[P.sources[row.key]]}</span></div>
          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={P.sources[row.key]}
            aria-label={row.label}
            onChange={e => {
              const sources: Sources = { ...P.sources, [row.key]: Number(e.target.value) }
              setP({ ...P, sources })
            }}
          />
          <div className="ends"><span>Rarely</span><span>Most days</span></div>
        </div>
      ))}
      {q.type === 'budget' && (
        <>
          <BudgetSlider label="Groceries" value={P.budgetG} onChange={n => setP({ ...P, budgetG: n })} />
          <BudgetSlider label="Eating out and delivery" value={P.budgetE} onChange={n => setP({ ...P, budgetE: n })} />
        </>
      )}
      </div>
      <div className="cta">
        <button
          className="btn"
          disabled={!ready}
          onClick={advance}
        >
          Continue
        </button>
      </div>
    </>
  )
}

function BudgetSlider({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="slider w" style={{ marginBottom: 10 }}>
      <div className="top"><span>{label}</span><span>{money(value)} a week</span></div>
      <input type="range" min={0} max={150} step={10} value={value} aria-label={label} onChange={e => onChange(Number(e.target.value))} />
      <div className="ends"><span>$0</span><span>$150+</span></div>
    </div>
  )
}
