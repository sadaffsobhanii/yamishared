import { useState } from 'react'
import { Bunny, Emoji } from './Bunny'
import { FuelRing } from './FuelRing'
import { LIFE, cartPrice, dollars, shopStore, weekFuel, withCartItem } from './fuel'
import { dayTotals, goal, isVeg } from './model'
import { useYami, type DayMode } from './store'

export function Home() {
  const {
    P, setP, meals, list, go, setWeekly, setCartOpen,
    tags, setTags, recovery, setRecovery, vacation, setPview, setList, toast,
    dayMode, setDayMode, fuelReady, revealFuel, lnDone, toggleLn,
  } = useYami()
  const [check, setCheck] = useState<string | null>(null)
  const [glasses, setGlasses] = useState(0)
  const [boxes, setBoxes] = useState<string[]>([])
  const [spin, setSpin] = useState<number | 'ask' | 'done'>(fuelReady ? 'done' : 'ask')
  const totals = dayTotals(meals)
  const seen = [
    P.show.calories ? { label: 'Calories', value: meals.length ? String(totals.calories) : '—' } : null,
    P.show.weight ? { label: 'Weight', value: '—' } : null,
    P.show.protein ? { label: 'Protein', value: `${totals.protein}g` } : null,
    P.show.fiber ? { label: 'Fiber', value: `${totals.fiber}g` } : null,
  ].filter((item): item is { label: string; value: string } => item != null)
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()
  const openCount = list.filter(row => !row.done).length
  const report = weekFuel(P, meals)
  const spinning = typeof spin === 'number'
  const revealed = spin === 'done'
  const ringScore = revealed ? report.score : spinning ? report.steps[spin].val : null
  const status = !revealed
    ? (spinning ? report.steps[spin].label : 'Generate score')
    : recovery ? 'Recovery day' : dayMode === 'exam' ? 'Exam mode' : dayMode === 'late' ? 'Rejuvenate' : dayMode === 'burnout' ? 'Keep it easy' : report.score == null ? 'Log a meal' : report.score >= 80 ? 'Fueled up' : report.score >= 60 ? 'Ready to go' : 'Room to grow'
  const line = !revealed
    ? (spinning ? 'Reading this week.' : 'Your week, your goals.')
    : recovery
      ? 'Rest today.'
      : dayMode === 'exam'
        ? 'Steady energy.'
        : dayMode === 'late'
          ? 'Water and fiber.'
          : dayMode === 'burnout'
            ? 'Easy meals.'
            : report.score == null
              ? 'Log a meal this week.'
              : 'Meals, plants, protein, and fiber.'

  function generateScore() {
    if (spin !== 'ask') return
    setSpin(0)
    window.setTimeout(() => setSpin(1), 420)
    window.setTimeout(() => setSpin(2), 840)
    window.setTimeout(() => setSpin(3), 1260)
    window.setTimeout(() => {
      setSpin('done')
      revealFuel()
    }, 1680)
  }

  function chooseMode(mode: DayMode) {
    if (dayMode === mode) {
      setDayMode('casual')
      setGlasses(0)
      setBoxes([])
      return
    }
    setDayMode(mode)
    setGlasses(0)
    setBoxes([])
    if (mode === 'late' && !P.show.fiber) setP({ ...P, show: { ...P.show, fiber: true } })
  }

  function toggleBox(id: string) {
    setBoxes(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  }

  function addFoods(foods: string[], from: string) {
    let next = list
    foods.forEach(item => { next = withCartItem(next, item, from, P) })
    setList(next)
    const place = shopStore(P)
    const total = foods.reduce((sum, item) => sum + cartPrice(item, place), 0)
    toast(`Added to your ${place} cart · ${dollars(total)}`)
  }

  function toggleTag(tag: string) {
    if (tags.includes(tag)) {
      setTags(tags.filter(item => item !== tag))
      return
    }
    setTags([...tags, tag])
    if (tag === 'Coffee') toast("Noted. I'll watch how coffee affects your sleep.")
    else if (tag === 'Stressed') toast('Thanks for telling me. Simple, comforting meals today.')
    else if (tag === 'On my period') toast('Noted. Iron-rich foods like beans and spinach can help.')
    else setCheck(tag)
  }

  function choose(feel: string) {
    setCheck(null)
    if (feel === 'Great') {
      toast('Love that. Keep enjoying your day!')
      return
    }
    if (feel === 'Skip') return
    setRecovery(true)
    let next = list
    next = withCartItem(next, 'Electrolyte drink', "Yami's recovery day plan", P)
    next = withCartItem(next, isVeg(P) ? 'Greek yogurt' : 'Eggs', "Yami's recovery day plan", P)
    next = withCartItem(next, 'Bananas', "Yami's recovery day plan", P)
    setList(next)
    toast('Recovery day plan ready')
  }

  return (
    <>
      <div className="hello">
        <div>
          <div className="small">{date}</div>
          <h2 className="h">Hi, {P.name || 'friend'}</h2>
        </div>
        <button className="cartbtn" aria-label={`Your grocery cart, ${openCount} items`} onClick={() => setCartOpen(true)}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6E0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" />
            <circle cx="10" cy="20" r="1.4" />
            <circle cx="17" cy="20" r="1.4" />
          </svg>
          {openCount > 0 && <span className="badge">{openCount}</span>}
        </button>
      </div>
      {seen.length > 0 && (
        <div className="w" style={{ display: 'grid', gridTemplateColumns: `repeat(${seen.length}, 1fr)`, gap: 8, marginBottom: 12 }}>
          {seen.map(item => (
            <div key={item.label}>
              <span className="small">{item.label}</span>
              <b style={{ display: 'block', fontFamily: 'var(--display)', fontSize: 22 }}>{item.value}</b>
            </div>
          ))}
        </div>
      )}
      <button
        id="hFuel"
        className="w wide"
        style={{ display: 'block', width: '100%', marginBottom: 12, textAlign: 'left' }}
        onClick={() => {
          if (spin === 'ask') generateScore()
          else if (spin === 'done') { setPview('today'); go('progress') }
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={spinning ? 'throb hot' : 'throb'} style={{ position: 'relative', width: 110, height: 110, flex: 'none', display: 'block' }}>
            <FuelRing score={recovery ? null : ringScore} size={110} />
            <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontWeight: 800, fontSize: recovery ? 18 : revealed ? 28 : 22, color: 'var(--deep)', textAlign: 'center', lineHeight: 1.05, padding: 18 }}>
              {recovery ? 'Rest' : revealed ? (report.score ?? '–') : spinning ? ringScore : ''}
            </span>
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="eyebrow">Fuel Score</span>
            <span style={{ display: 'block', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 22, margin: '2px 0 4px' }}>{status}</span>
            <span className="small" style={{ display: 'block', lineHeight: 1.4 }}>{line}</span>
            {revealed && <span className="small" style={{ display: 'block', marginTop: 6, fontWeight: 800, color: 'var(--deep)' }}>See why</span>}
          </span>
        </div>
      </button>
      {vacation && (
        <div className="w" style={{ background: 'var(--lav)', marginBottom: 12 }}>
          <b>You're on a Yami vacation until {vacation}.</b>
          <p className="small" style={{ margin: '6px 0 0' }}>Your progress is saved. Enjoy the break.</p>
        </div>
      )}
      {recovery && (
        <div className="w" style={{ background: 'var(--sun-soft)', marginBottom: 12 }}>
          <div className="eyebrow" style={{ color: '#8A6200' }}>Recovery day</div>
          <p style={{ margin: '6px 0 10px', fontWeight: 700 }}>Easy foods are in your cart: an electrolyte drink, {isVeg(P) ? 'Greek yogurt' : 'eggs'} and bananas.</p>
          <button className="pill dark sm" onClick={() => setCartOpen(true)}>View cart</button>
        </div>
      )}
      <div className="w wide" style={{ marginBottom: 12 }}>
        <div className="eyebrow">Today's mode</div>
        <p className="small" style={{ margin: '4px 0 10px' }}>Yami changes what it recommends the moment you pick one.</p>
        <div className="chips">
          {(['exam', 'late', 'burnout'] as DayMode[]).map(mode => (
            <button key={mode} className="chip" aria-pressed={dayMode === mode} onClick={() => chooseMode(mode)}>
              {mode === 'exam' ? 'Exam mode' : mode === 'late' ? 'Late-night mode' : 'Burnt-out mode'}
            </button>
          ))}
        </div>
      </div>
      {dayMode === 'late' && (
        <div className="w wide" style={{ background: 'var(--sun-soft)', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Bunny mood="happy" size={54} />
            <div>
              <div className="eyebrow" style={{ color: '#8A6200' }}>From Yami</div>
              <p style={{ margin: '4px 0 0', fontWeight: 700 }}>No worries, it happens to the best of us. Had a fun night.</p>
            </div>
          </div>
          <div className="eyebrow" style={{ marginTop: 14 }}>Meals</div>
          <div className="chips" style={{ marginTop: 8 }}>
            {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map(step => (
              <button key={step} className="chip" aria-pressed={!!lnDone[step]} onClick={() => toggleLn(step)} style={{ textTransform: 'capitalize' }}>{step}</button>
            ))}
          </div>
          <div className="eyebrow" style={{ marginTop: 14 }}>Check these off today</div>
          <div className="chips" style={{ marginTop: 8 }}>
            {['Drinking water through the day', 'Eating lots of fiber'].map(item => (
              <button key={item} className="chip" aria-pressed={boxes.includes(item)} onClick={() => toggleBox(item)}>{item}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
            {['Morning', 'Midday', 'Afternoon', 'Evening'].map((label, index) => (
              <button
                key={label}
                className="chip"
                aria-pressed={glasses > index}
                style={{ flex: 1, padding: '8px 4px' }}
                onClick={() => setGlasses(glasses === index + 1 ? index : index + 1)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="small" style={{ margin: '0 0 10px' }}>{glasses} of 4 glasses of water today.</p>
          <button className="pill dark sm" onClick={() => addFoods(['Oats', 'Black beans', 'Spinach', 'Strawberries'], "Yami's late-night mode")}>
            Add fiber foods · {dollars(['Oats', 'Black beans', 'Spinach', 'Strawberries'].reduce((sum, item) => sum + cartPrice(item, shopStore(P)), 0))}
          </button>
        </div>
      )}
      {dayMode === 'burnout' && (
        <div className="w wide" style={{ background: 'var(--sun-soft)', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Bunny mood="sleepy" size={54} />
            <div>
              <div className="eyebrow" style={{ color: '#8A6200' }}>From Yami</div>
              <p style={{ margin: '4px 0 0', fontWeight: 700 }}>This week is a lot. Keep meals easy, and still hit what matters.</p>
            </div>
          </div>
          <p style={{ margin: '10px 0', fontWeight: 700 }}>{isVeg(P) ? 'Toast and yogurt, or oats with fruit.' : 'Eggs and toast, or yogurt and fruit.'} About ten minutes, with enough protein for your goal.</p>
          <div className="chips">
            {['One easy meal', 'Protein on the plate', 'No extra cooking'].map(item => (
              <button key={item} className="chip" aria-pressed={boxes.includes(item)} onClick={() => toggleBox(item)}>{item}</button>
            ))}
          </div>
          <button className="pill dark sm" style={{ marginTop: 12 }} onClick={() => addFoods(isVeg(P) ? ['Toast', 'Greek yogurt', 'Bananas'] : ['Eggs', 'Toast', 'Bananas'], "Yami's burnt-out mode")}>
            Add an easy meal · {dollars((isVeg(P) ? ['Toast', 'Greek yogurt', 'Bananas'] : ['Eggs', 'Toast', 'Bananas']).reduce((sum, item) => sum + cartPrice(item, shopStore(P)), 0))}
          </button>
        </div>
      )}
      <div className="w wide" style={{ marginBottom: 12 }}>
        <div className="eyebrow">Anything Yami should know about today?</div>
        <p className="small" style={{ margin: '4px 0 10px' }}>One tap. Private, and never judged.</p>
        <div className="chips">
          {LIFE.map(tag => (
            <button key={tag} className="chip" aria-pressed={tags.includes(tag)} onClick={() => toggleTag(tag)}>{tag}</button>
          ))}
        </div>
      </div>
      <div className="w wide" style={{ background: 'linear-gradient(135deg,#FFF3C4,#FBEDEA)', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ position: 'relative', width: 86, height: 92, flex: 'none' }}>
            <span className="tile" style={{ position: 'absolute', left: 0, top: 10, width: 60, height: 78, background: '#FBD9E1', transform: 'rotate(-8deg)' }}><Emoji k="ramen" size={32} /></span>
            <span className="tile" style={{ position: 'absolute', left: 22, top: 2, width: 60, height: 78, background: '#F7E6E3', transform: 'rotate(6deg)', boxShadow: '0 4px 10px rgba(0,0,0,.1)' }}><Emoji k="salad" size={34} /></span>
          </span>
          <span style={{ flex: 1 }}>
            <span className="eyebrow">{dayMode ? "Today's focus" : 'Meal inspiration'}</span>
            <span style={{ display: 'block', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 18, lineHeight: 1.2, margin: '4px 0' }}>{dayMode === 'exam' ? 'Steady energy while you study' : dayMode === 'late' ? 'Fiber-rich meals to feel better' : dayMode === 'burnout' ? 'Easy meals that still hit your goals' : 'Ideas for this week'}</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button className="pill primary sm" onClick={() => go('order')}>Order Smart</button>
        </div>
      </div>
      <button className="w wide" style={{ background: 'var(--ink)', color: '#fff', display: 'flex', gap: 12, alignItems: 'center' }} onClick={() => setWeekly(0)}>
        <span style={{ flex: 1 }}>
          <span className="eyebrow" style={{ color: '#FFE08A' }}>Yami Weekly</span>
          <span style={{ display: 'block', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 19, margin: '4px 0 8px' }}>Click here to see your weekly food recap</span>
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(P.goals.length ? P.goals : [goal(P)]).map(item => <span key={item} className="pill sm" style={{ background: 'rgba(255,255,255,.14)', color: '#fff' }}>{item}</span>)}
          </span>
        </span>
        <Bunny mood="proud" size={62} />
      </button>
      {check && (
        <div className="sheet" onClick={e => { if (e.target === e.currentTarget) setCheck(null) }}>
          <div className="panel" role="dialog" aria-label="Check in">
            <div className="head">
              <Bunny mood="curious" size={48} />
              <div style={{ flex: 1 }}>
                <b style={{ fontFamily: 'var(--display)', fontSize: 18 }}>Sorry you're feeling off. How are you doing?</b>
              </div>
            </div>
            <div className="msgs" style={{ gap: 8 }}>
              {['Great', 'A little slow', 'Rough'].map(option => (
                <button key={option} className="pill soft" style={{ justifyContent: 'flex-start' }} onClick={() => choose(option)}>{option}</button>
              ))}
              <button className="ghost" onClick={() => choose('Skip')}>Skip</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
