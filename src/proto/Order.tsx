import { useState } from 'react'
import { Bunny } from './Bunny'
import { orderItems } from './fuel'
import { estimate, goal, mealScore, MENUS, orderTip, rank, reason, scoreColor, scoreLabel, type MenuItem, type Profile } from './model'
import { useYami } from './store'

const ETA: Record<string, string> = {
  Chipotle: '15 to 25 min',
  Sweetgreen: '20 to 30 min',
  CAVA: '20 to 30 min',
  'Panda Express': '15 to 25 min',
  Subway: '10 to 20 min',
}

const LATE = 'Late Nights recovery'

function modeLabel(mode: string) {
  return mode === LATE ? 'Late Nights' : mode
}

function findRestaurant(value: string) {
  const text = value.toLowerCase()
  const names = Object.keys(MENUS)
  return names.find(name => name.toLowerCase() === text) || names.find(name => name.toLowerCase().includes(text))
}

function pickValue(P: Profile, mode: string, item: MenuItem) {
  if (mode === LATE) return item.f * 2 + item.p / 3 - item.c / 40
  if (mode === 'More protein' || mode === 'Building strength') return item.p
  if (mode === 'Feeling lighter') return item.p - item.c / 30
  return mealScore(P, item.p, item.f, item.f >= 8) + item.f
}

export function Order() {
  const { P, ord, setOrd, meals, setMeals, toast, dayMode, ordMode, setOrdMode, markNextMeal } = useYami()
  const [query, setQuery] = useState(ord.rest)
  const [draft, setDraft] = useState(ord.meal)
  const modes = [...new Set([...(P.goals.length ? P.goals : ['Simply eating well']), LATE])]
  const mode = ordMode || (dayMode === 'late' ? LATE : goal(P))
  const lateOn = dayMode === 'late'

  function search(value: string) {
    const text = value.trim()
    if (!text) {
      setOrd({ rest: '', meal: '' })
      setQuery('')
      return
    }
    const match = findRestaurant(text)
    setOrd({ rest: match || text, meal: '' })
    setQuery(match || text)
    setDraft('')
    document.querySelector('.screen')?.scrollTo(0, 0)
  }

  function logIt(item: { n: string; p: number; f: number }) {
    setMeals([...meals, {
      n: item.n,
      p: item.p,
      veg: item.f >= 8,
      score: mealScore(P, item.p, item.f, item.f >= 8),
      k: 'burrito',
      items: orderItems(item.n),
    }])
    if (lateOn) markNextMeal()
    toast('Logged. Enjoy your meal!')
  }

  const searchBar = (
    <form
      style={{ display: 'flex', gap: 8, margin: '14px 0 8px' }}
      onSubmit={e => {
        e.preventDefault()
        search(query)
      }}
    >
      <input
        className="field"
        value={query}
        placeholder="Search a restaurant"
        aria-label="Search a restaurant"
        list="restaurants"
        autoComplete="off"
        style={{ flex: 1 }}
        onChange={e => setQuery(e.target.value)}
      />
      <datalist id="restaurants">{Object.keys(MENUS).map(name => <option key={name} value={name} />)}</datalist>
      <button className="pill primary">Search</button>
    </form>
  )

  const modeChips = (
    <>
      <div className="eyebrow" style={{ margin: '10px 0 8px' }}>Ordering for</div>
      <div className="chips">
        {modes.map(item => (
          <button key={item} className="chip" aria-pressed={item === mode} style={{ padding: '8px 14px' }} onClick={() => setOrdMode(item)}>
            {modeLabel(item)}
          </button>
        ))}
      </div>
      {mode === LATE && (
        <p className="small" style={{ margin: '6px 0 0' }}>
          {lateOn ? 'Late Nights is on, so Yami is picking gentle, recovery-friendly meals.' : 'Gentle meals with fiber, a little salt and nothing too heavy.'}
        </p>
      )}
    </>
  )

  if (!ord.rest) {
    const picks = Object.keys(MENUS).flatMap(restaurant => rank(P, MENUS[restaurant], mode).slice(0, 2).map(item => ({ restaurant, item })))
    picks.sort((a, b) => pickValue(P, mode, b.item) - pickValue(P, mode, a.item))
    const top = picks[0]
    const more = picks.slice(1, 7)
    return (
      <>
        <div className="eyebrow">Order smart</div>
        <h2 className="h">Order for your goals.</h2>
        {searchBar}
        <div className="chips" style={{ marginBottom: 6 }}>
          {Object.keys(MENUS).map(name => (
            <button key={name} className="chip" aria-pressed={false} style={{ padding: '7px 12px', fontSize: 13 }} onClick={() => search(name)}>{name}</button>
          ))}
        </div>
        {modeChips}
        {top && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 10px' }}>
              <Bunny mood="wink" size={44} />
              <div>
                <div className="eyebrow">Yami's pick for your goals right now</div>
                <div className="small">{modeLabel(mode)} · near you</div>
              </div>
            </div>
            <MealCard item={top.item} restaurant={top.restaurant} top mode={mode} profile={P} onLog={logIt} />
          </>
        )}
        <div className="eyebrow" style={{ margin: '18px 0 10px' }}>More picks for you</div>
        {more.map(pick => <MealCard key={`${pick.restaurant}-${pick.item.n}`} item={pick.item} restaurant={pick.restaurant} mode={mode} profile={P} onLog={logIt} />)}
        <p className="small" style={{ marginTop: 10 }}>Estimates based on posted nutrition info. Exact numbers vary.</p>
      </>
    )
  }

  const menu = MENUS[ord.rest]
  const ranked = menu ? rank(P, menu, mode) : []
  const known = menu?.find(item => item.n.toLowerCase() === ord.meal.toLowerCase())
  const est = ord.meal ? (known ? { p: known.p, f: known.f, veg: known.f >= 8 } : estimate(ord.meal)) : null
  const typedScore = est ? mealScore(P, est.p, est.f, est.veg) : 0
  const typedTip = known ? known.tip : est ? orderTip(P, est) : ''

  return (
    <>
      <button className="ghost" style={{ margin: '0 0 10px' }} onClick={() => { setOrd({ rest: '', meal: '' }); setQuery(''); setDraft('') }}>‹ All picks</button>
      <div className="eyebrow">Order smart</div>
      <h2 className="h">{ord.rest}</h2>
      {searchBar}
      {modeChips}
      {menu ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 10px' }}>
            <Bunny mood="wink" size={44} />
            <div>
              <div className="eyebrow">Yami suggests at {ord.rest}</div>
              <div className="small">Best first, for {modeLabel(mode).toLowerCase()}</div>
            </div>
          </div>
          {ranked.map((item, index) => <MealCard key={item.n} item={item} restaurant={ord.rest} top={index === 0} mode={mode} profile={P} onLog={logIt} />)}
        </>
      ) : (
        <div className="w" style={{ margin: '18px 0 12px', background: 'var(--sun-soft)' }}>
          <div className="eyebrow" style={{ color: '#8A6200' }}>Yami's tips for {ord.rest}</div>
          <p style={{ margin: '8px 0 0', lineHeight: 1.5 }}>Yami doesn't have this menu yet. Look for a protein you like, add a vegetable side, and get sauces on the side. Type what you're thinking of below and Yami will score it.</p>
        </div>
      )}
      <div className="eyebrow" style={{ margin: '18px 0 8px' }}>Thinking of something else?</div>
      <form
        style={{ display: 'flex', gap: 8 }}
        onSubmit={e => {
          e.preventDefault()
          setOrd({ ...ord, meal: draft.trim() })
        }}
      >
        <input className="field" value={draft} placeholder="Type your meal" aria-label="Meal" autoComplete="off" style={{ flex: 1 }} onChange={e => setDraft(e.target.value)} />
        <button className="pill primary">Check</button>
      </form>
      {est && (
        <div className="w" style={{ margin: '12px 0' }}>
          <div className="eyebrow">Your order</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 20, minWidth: 0 }}>{ord.meal}</div>
            <ScorePill score={typedScore} />
          </div>
          <p style={{ margin: '6px 0 4px', fontWeight: 700 }}>{scoreLabel(typedScore)} for {modeLabel(mode).toLowerCase()}.</p>
          <p className="small" style={{ margin: '0 0 12px' }}>Tip: {typedTip}</p>
          <OrderButtons restaurant={ord.rest} onLog={() => logIt({ n: ord.meal, p: est.p, f: est.f })} />
          {!known && <p className="small" style={{ margin: '10px 0 0' }}>Rough estimate from the meal name.</p>}
        </div>
      )}
      <p className="small" style={{ marginTop: 10 }}>Estimates based on posted nutrition info. Exact numbers vary.</p>
    </>
  )
}

function ScorePill({ score }: { score: number }) {
  return <span className="pill sm" style={{ flex: 'none', background: scoreColor(score), color: score >= 60 ? '#fff' : 'var(--ink)' }}>{score}</span>
}

function OrderButtons({ restaurant, onLog }: { restaurant: string; onLog: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <a className="pill primary sm" href={`https://www.doordash.com/search/store/${encodeURIComponent(restaurant)}/`} target="_blank" rel="noopener">Order on DoorDash</a>
      <button className="pill soft sm" onClick={onLog}>I ordered this</button>
    </div>
  )
}

function MealCard({
  item, restaurant, top, mode, profile, onLog,
}: {
  item: MenuItem
  restaurant: string
  top?: boolean
  mode: string
  profile: Profile
  onLog: (item: { n: string; p: number; f: number }) => void
}) {
  const score = mealScore(profile, item.p, item.f, item.f >= 8)
  const tip = mode === LATE ? 'Add a water or electrolyte drink to your order.' : `Tip: ${item.tip}`
  return (
    <div className="w" style={{ marginBottom: 10, background: top ? 'linear-gradient(135deg,#FFF3C4,#FBEDEA)' : undefined, padding: top ? 18 : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ minWidth: 0 }}>
          <span className="small" style={{ display: 'block' }}>{restaurant} · {ETA[restaurant] || '20 to 30 min'}</span>
          <span style={{ display: 'block', fontFamily: 'var(--display)', fontWeight: 800, fontSize: top ? 22 : 18, lineHeight: 1.2, marginTop: 2 }}>{item.n}</span>
        </span>
        <ScorePill score={score} />
      </div>
      <div style={{ display: 'flex', gap: 6, margin: '8px 0 6px', flexWrap: 'wrap' }}>
        <span className="pill sm soft">{item.p}g protein</span>
        <span className="pill sm soft">{item.f}g fiber</span>
      </div>
      <p style={{ margin: '4px 0 2px', fontWeight: 700, fontSize: 14 }}>{reason(profile, item, mode)}.</p>
      <p className="small" style={{ margin: '0 0 10px' }}>{tip}</p>
      <OrderButtons restaurant={restaurant} onLog={() => onLog(item)} />
    </div>
  )
}
