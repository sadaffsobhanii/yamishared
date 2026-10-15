import { useState } from 'react'
import { Bunny, Emoji } from './Bunny'
import { money, planLine } from './model'
import { useYami } from './store'

export function You() {
  const { P, setP, setOb, toast, reset, vacation, setVacation, setGate } = useYami()
  const [notesOpen, setNotesOpen] = useState(false)
  const chips = [
    ...P.goals.slice(0, 1).map(item => item === 'Something else' && P.goalNote.trim() ? P.goalNote.trim() : item),
    ...P.diet.filter(d => d !== 'No preference' && d !== 'I have allergies' && d !== 'I have health concerns').slice(0, 1),
    P.sources.delivery >= 2 ? 'Orders delivery' : P.sources.cook >= 2 ? 'Cooks at home' : '',
  ].filter(Boolean)

  function edit(index: number, nextGate: 'allergy' | 'health' | null = null) {
    setGate(nextGate)
    setOb(index)
    setP({ ...P, onboarded: false })
  }

  const allergyValue = [...P.allergies.filter(item => item !== 'Something else'), P.allergyNote].filter(Boolean).join(', ')
  const healthValue = [...P.healthIssues.filter(item => item !== 'Something else'), P.healthIssueNote].filter(Boolean).join(', ')
  const goalValue = P.goals.map(item => item === 'Something else' && P.goalNote.trim() ? P.goalNote.trim() : item).join(', ')

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <span style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--sun-soft)', display: 'grid', placeItems: 'center', flex: 'none' }}>
          <Bunny mood="happy" size={70} />
        </span>
        <div>
          <h2 className="h">{P.name || 'You'}</h2>
          <div className="small">Yami friend since this week</div>
        </div>
      </div>
      <div className="chips" style={{ marginBottom: 14 }}>
        {chips.map((chip, i) => (
          <span key={chip} className={`pill sm ${i ? '' : 'primary'}`} style={i ? { background: 'var(--card)' } : undefined}>{chip}</span>
        ))}
      </div>
      <div className="w hero" style={{ marginBottom: 12 }}>
        <div className="eyebrow">Your plan</div>
        <p>{planLine(P)}</p>
        <button className="pill sm" style={{ background: '#fff', color: 'var(--deep)', marginTop: 10 }} onClick={() => edit(0)}>Edit my plan</button>
      </div>
      <div className="w" style={{ padding: '6px 16px', marginBottom: 12 }}>
        <div className="eyebrow" style={{ paddingTop: 8 }}>About you</div>
        <Row label="Goals" value={goalValue} onClick={() => edit(0)} />
        <Row label="Support" value={P.support.join(', ')} onClick={() => edit(1)} />
        <Row label="What trips me up" value={P.challenge.join(', ')} onClick={() => edit(2)} />
        <Row label="How I eat" value={P.diet.join(', ')} onClick={() => edit(3)} />
        <Row label="Allergies" value={P.diet.includes('I have allergies') ? allergyValue : 'None'} onClick={() => edit(3, P.diet.includes('I have allergies') ? 'allergy' : null)} />
        <Row label="Health" value={P.diet.includes('I have health concerns') ? healthValue : 'None'} onClick={() => edit(3, P.diet.includes('I have health concerns') ? 'health' : null)} />
        <Row label="Cooking" value={P.cooking} onClick={() => edit(6)} />
        <Row label="Where I shop" value={P.stores.join(', ')} onClick={() => edit(9)} />
        <Row label="Weekly budget" value={`${money(P.budgetG)} + ${money(P.budgetE)}`} onClick={() => edit(10)} />
        <Row label="Sleep goal" value={P.sleepGoal} onClick={() => edit(11)} />
      </div>
      <div className="w" style={{ padding: '6px 16px', marginBottom: 12 }}>
        <div className="eyebrow" style={{ paddingTop: 8 }}>What I see</div>
        {(['calories', 'weight', 'protein', 'fiber'] as const).map(key => (
          <div className="row" key={key}>
            <span style={{ fontWeight: 700 }}>{key[0].toUpperCase() + key.slice(1)}</span>
            <button
              className="switch"
              role="switch"
              aria-checked={P.show[key]}
              aria-label={key}
              onClick={() => setP({ ...P, show: { ...P.show, [key]: !P.show[key] } })}
            />
          </div>
        ))}
      </div>
      <div className="w" style={{ marginBottom: 12 }}>
        <button className="row" style={{ border: 0, padding: 0 }} onClick={() => setNotesOpen(open => !open)}>
          <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Emoji k="lock" size={26} />
            <span><b>Health notes</b><br /><span className="small">Private and optional</span></span>
          </span>
          <span style={{ color: '#B7A3E6', fontWeight: 800 }}>&rsaquo;</span>
        </button>
        {notesOpen && (
          <div>
            <p className="small" style={{ margin: '12px 0 8px' }}>Share only what you want. Yami will not diagnose you or turn a note into a treatment plan.</p>
            <textarea
              className="field"
              rows={3}
              placeholder="Anything a clinician already suggested"
              value={P.healthNote}
              onChange={e => setP({ ...P, healthNote: e.target.value })}
            />
          </div>
        )}
      </div>
      <div className="w" style={{ marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
        <Bunny mood="sleepy" size={54} />
        <div style={{ flex: 1 }}>
          <div className="eyebrow">Take a Yami vacation</div>
          {vacation ? (
            <>
              <p style={{ margin: '6px 0 8px', fontWeight: 700 }}>You're away until {vacation}.</p>
              <button className="pill soft sm" onClick={() => { setVacation(null); toast('Welcome back! I saved your spot.') }}>End vacation</button>
            </>
          ) : (
            <div className="chips" style={{ marginTop: 8 }}>
              {[3, 7, 14].map(days => (
                <button
                  key={days}
                  className="chip"
                  onClick={() => {
                    const end = new Date()
                    end.setDate(end.getDate() + days)
                    setVacation(end.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
                    toast('Enjoy your break. Your progress is saved.')
                  }}
                >
                  {days} days
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="small center" style={{ lineHeight: 1.6 }}>
        Yami offers general guidance, not medical advice.<br />
        <button className="ghost" style={{ display: 'inline', margin: 0 }} onClick={reset}>Restart the demo</button>
      </p>
    </>
  )
}

function Row({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button className="row" onClick={onClick}>
      <span style={{ fontWeight: 700 }}>{label}</span>
      <span className="v">{value || 'Not set'} <span style={{ color: '#B7A3E6' }}>&rsaquo;</span></span>
    </button>
  )
}
