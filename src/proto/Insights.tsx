import { useState } from 'react'
import { Bunny } from './Bunny'
import { FuelRing } from './FuelRing'
import { weekData, weekFuel, weekNutrition, type FuelPart } from './fuel'
import { useYami } from './store'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function Insights() {
  const { P, meals, pview, setPview, recovery, fuelReady, go } = useYami()
  const [explain, setExplain] = useState<{ title: string; intro: string; rows: FuelPart[]; tip: string | null } | null>(null)
  const fuel = weekFuel(P, meals)
  const lowest = fuel.parts.filter(part => part.val != null).sort((a, b) => (a.val || 0) - (b.val || 0))[0]

  return (
    <>
      <div className="eyebrow">Insights</div>
      <h2 className="h">{pview === 'today' ? 'Fuel Insights' : 'Insights for this week'}</h2>
      <div className="seg">
        <button aria-pressed={pview === 'today'} onClick={() => setPview('today')}>Today</button>
        <button aria-pressed={pview === 'week'} onClick={() => setPview('week')}>This week</button>
      </div>
      {pview === 'today' ? (
        <>
          <div className="w" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 16 }}>Fuel Score</b>
              <button className="ghost" style={{ margin: 0, textDecoration: 'underline' }} onClick={() => setExplain({ title: `Your Fuel Score: ${fuel.score ?? 'not ready yet'}`, intro: 'This week’s score averages your meal scores, then checks plants, protein, and fiber for your goal.', rows: fuel.parts, tip: lowest?.tip || null })}>Why this score?</button>
            </div>
            <button
              className="throb"
              style={{ position: 'relative', display: 'block', width: 230, height: 230, margin: '6px auto 0' }}
              aria-label={fuelReady ? `See why your Fuel Score is ${fuel.score ?? 'not ready'}` : 'Generate score'}
              onClick={() => fuelReady ? setExplain({ title: `Your Fuel Score: ${fuel.score ?? 'not ready yet'}`, intro: 'This week’s score averages your meal scores, then checks plants, protein, and fiber for your goal.', rows: fuel.parts, tip: lowest?.tip || null }) : go('home')}
            >
              <FuelRing score={recovery || !fuelReady ? null : fuel.score} size={230} />
              <span style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {recovery ? (
                  <><span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 30, color: 'var(--deep)' }}>Recovery</span><span className="small" style={{ fontWeight: 800 }}>Go easy today</span></>
                ) : !fuelReady ? (
                  <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 28, color: 'var(--deep)', textAlign: 'center', lineHeight: 1.05 }}>Generate score</span>
                ) : (
                  <><span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 60, color: 'var(--deep)', lineHeight: 1 }}>{fuel.score ?? '–'}</span><span className="small" style={{ fontWeight: 800 }}>{fuel.score == null ? 'Log a meal' : fuel.score >= 80 ? 'Fueled up' : fuel.score >= 60 ? 'Ready to go' : 'Room to grow'}</span></>
                )}
              </span>
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px 8px', marginTop: 10 }}>
              {fuel.parts.map(part => (
                <button key={part.k} style={{ textAlign: 'left', padding: 4 }} onClick={() => setExplain({ title: part.label, intro: part.why, rows: [part], tip: part.val != null && part.val < 85 ? part.tip : null })}>
                  <span className="small">{part.label}</span>
                  <b style={{ display: 'block', fontFamily: 'var(--display)', fontSize: 22, color: part.val == null ? '#B7A3E6' : part.val >= 70 ? 'var(--purple)' : '#C9A100', fontVariantNumeric: 'tabular-nums' }}>{part.val ?? '–'}</b>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : <WeekView onExplain={setExplain} />}
      {explain && <Explain {...explain} onClose={() => setExplain(null)} />}
    </>
  )
}

function WeekView({ onExplain }: { onExplain: (next: { title: string; intro: string; rows: FuelPart[]; tip: string | null }) => void }) {
  const { P, meals, sleep, sampleWeek, setSampleWeek } = useYami()
  const week = weekData(P, meals, sleep, sampleWeek)
  const nutrition = weekNutrition(meals, week.sample)
  const best = week.days.map((day, index) => ({ ...day, index })).filter(day => day.f != null).sort((a, b) => (b.f || 0) - (a.f || 0))[0]
  const slept = week.days.filter(day => day.f != null && day.s != null)
  const good = slept.filter(day => (day.s || 0) >= 7)
  const short = slept.filter(day => (day.s || 0) < 7)
  const average = (rows: typeof slept) => Math.round(rows.reduce((sum, day) => sum + (day.f || 0), 0) / rows.length)
  const pair = good.length && short.length ? [average(good), average(short)] : null

  return (
    <>
      {week.sample && (
        <p className="small" style={{ margin: '-4px 0 10px' }}>
          Showing a sample week so you can see how it works. Today uses your real data.{' '}
          <button className="ghost" style={{ display: 'inline', margin: 0 }} onClick={() => setSampleWeek(false)}>Hide sample</button>
        </p>
      )}
      <button
        className="w"
        style={{ display: 'block', width: '100%', marginBottom: 12 }}
        onClick={() => onExplain({
          title: `Fuel Score this week: ${week.avg} average`,
          intro: `Each day's Fuel Score blends your meals and sleep. ${best ? `Your best day was ${DAY_NAMES[best.index]} at ${best.f}.` : ''}`,
          rows: week.days.map((day, index) => ({
            k: String(index),
            label: DAY_NAMES[index] + (day.today ? ' (today)' : ''),
            val: day.f,
            why: day.f == null ? 'Not logged yet.' : `${day.s != null ? `Slept ${day.s} hours. ` : ''}${day.f >= 80 ? 'Strong meals with plants and protein.' : day.f >= 65 ? 'Solid meals, with room for more plants or protein.' : 'Lighter on whole foods or sleep.'}`,
            tip: '',
          })),
          tip: week.avg < 75 ? 'Add one more plant to each meal this week.' : 'Keep your bedtime steady to protect your great week.',
        })}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="eyebrow">Fuel Score this week</div>
          <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 24, fontVariantNumeric: 'tabular-nums' }}>{week.avg}<span className="small"> avg</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, margin: '12px 0 6px' }}>
          {week.days.map((day, index) => (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{day.f ?? ''}</span>
              <i style={{ display: 'block', width: '100%', borderRadius: 10, height: day.f != null ? Math.max(8, day.f) : 14, background: day.f == null ? '#EFE9FA' : day.today ? 'var(--sun)' : day.f >= 75 ? 'var(--purple)' : '#B7A3E6' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {DAYS.map((label, index) => <span key={label + index} style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 800, color: index === week.today ? 'var(--ink)' : 'var(--muted)' }}>{index === week.today ? 'Today' : label}</span>)}
        </div>
        <p className="small" style={{ margin: '10px 0 0' }}>Tap to see why</p>
      </button>
      <div className="w" style={{ marginBottom: 12 }}>
        <div className="eyebrow">Nutrition this week</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
          <Stat label="Different plants" value={`${nutrition.plants}`} extra=" / 30" />
          <Stat label="Protein types" value={`${nutrition.proteins}`} />
          <Stat label="Fiber" value={`${nutrition.fiber}g`} />
          <Stat label="Whole-grain carbs" value={nutrition.wholeCarb == null ? (week.sample ? '55%' : '–') : `${nutrition.wholeCarb}%`} />
          <Stat label="Whole foods" value={nutrition.whole == null ? (week.sample ? '78%' : '–') : `${nutrition.whole}%`} />
        </div>
      </div>
      <div className="w" style={{ background: 'var(--sun-soft)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <Bunny mood={week.avg >= 70 ? 'proud' : 'happy'} size={50} />
        <div>
          <div className="eyebrow" style={{ color: '#8A6200' }}>Sleep and food go hand in hand</div>
          <div style={{ fontWeight: 700, lineHeight: 1.4, marginTop: 2 }}>
            {pair ? `Your Fuel Score averaged ${pair[0]} after 7+ hours of sleep, and ${pair[1]} after less. ` : ''}
            {week.avg >= 70 ? `Good job, ${P.name || 'friend'}, you're on track!` : "Let's aim a little higher this week. One small swap is a great start."}
          </div>
        </div>
      </div>
    </>
  )
}

function Stat({ label, value, extra }: { label: string; value: string; extra?: string }) {
  return (
    <div>
      <span className="small">{label}</span>
      <b style={{ display: 'block', fontFamily: 'var(--display)', fontSize: 24 }}>{value}{extra && <span className="small">{extra}</span>}</b>
    </div>
  )
}

function Explain({ title, intro, rows, tip, onClose }: { title: string; intro: string; rows: FuelPart[]; tip: string | null; onClose: () => void }) {
  return (
    <div className="sheet" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="panel" role="dialog" aria-label={title}>
        <div className="head">
          <div style={{ flex: 1 }}>
            <div className="eyebrow">Why this score</div>
            <b style={{ fontFamily: 'var(--display)', fontSize: 21 }}>{title}</b>
          </div>
          <button className="pill soft sm" onClick={onClose}>Close</button>
        </div>
        <div className="msgs" style={{ gap: 0 }}>
          <p style={{ margin: '0 0 8px', lineHeight: 1.5, fontWeight: 600 }}>{intro}</p>
          {rows.map(row => (
            <div key={row.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #EFE9FA' }}>
              <span style={{ flex: 'none', width: 44, textAlign: 'right', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 20, color: row.val == null ? '#B7A3E6' : row.val >= 70 ? 'var(--deep)' : '#8A6200' }}>{row.val ?? '–'}</span>
              <span><b>{row.label}</b><span className="small" style={{ display: 'block', marginTop: 2, lineHeight: 1.45 }}>{row.why}</span></span>
            </div>
          ))}
          {tip && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--sun-soft)', borderRadius: 18, padding: 12, marginTop: 14 }}>
              <Bunny mood="wink" size={46} />
              <div>
                <div className="eyebrow" style={{ color: '#8A6200' }}>One idea to raise it</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{tip}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
