import { useEffect, useState } from 'react'
import { Bunny, Emoji } from './Bunny'
import { AskBar } from './Chef'
import { SECTION, cartPrice, dollars, instacartLink, shopStore, withCartItem } from './fuel'
import { FOODS, advise, scoreColor, scoreLabel } from './model'
import { labelPhoto } from './scan'
import { useYami } from './store'

export function Log() {
  const store = useYami()
  const { P, log, setLog, meals, setMeals, setList, go, toast, setChat, setCartOpen, setCartMode, recs, setRecs } = store
  const [why, setWhy] = useState(false)
  const [picked, setPicked] = useState<Record<string, 'store' | 'online'>>({})
  const result = log?.step === 'result' ? advise(P, log.items) : null

  useEffect(() => {
    if (!log) {
      setLog({ step: 'start', img: null, k: null, bg: '#E7DDF9', items: [], name: '' })
    }
  }, [log, setLog])

  useEffect(() => {
    if (log?.step === 'analyzing') setChat([])
  }, [log?.step, setChat])

  useEffect(() => {
    if (log?.step !== 'analyzing') return
    let cancel = false
    const photo = log.img
    ;(async () => {
      if (!photo) {
        await new Promise(resolve => window.setTimeout(resolve, 900))
        if (!cancel) setLog(current => current?.step === 'analyzing' ? { ...current, step: 'confirm' } : current)
        return
      }
      try {
        const labeled = await labelPhoto(photo)
        if (cancel) return
        setLog(current => current?.step === 'analyzing' ? { ...current, step: 'confirm', items: labeled.items, name: labeled.name } : current)
      } catch {
        if (!cancel) setLog(current => current?.step === 'analyzing' ? { ...current, step: 'confirm', items: [] } : current)
      }
    })()
    return () => { cancel = true }
  }, [log?.step, log?.img, setLog])

  if (!log) return null

  if (log.step === 'analyzing') {
    return (
      <div className="center" style={{ marginTop: 120 }}>
        <div className="pulse" style={{ display: 'inline-block' }}><Bunny mood="curious" size={120} /></div>
        <h3 className="q">{log.img ? 'Reading your photo…' : "Checking what's on your plate…"}</h3>
      </div>
    )
  }

  function usePhoto(file: File | undefined) {
    if (!file) return
    setLog({
      step: 'analyzing',
      img: URL.createObjectURL(file),
      k: null,
      bg: '#E7DDF9',
      items: [],
      name: 'Your meal',
    })
  }

  if (log.step === 'start') {
    return (
      <>
        <div className="eyebrow">Chef Yami</div>
        <h2 className="h" style={{ marginBottom: 6 }}>What's on your plate?</h2>
        <p className="small" style={{ marginBottom: 16 }}>Take a photo with your camera, or upload one you already have. You can fix anything Yami gets wrong.</p>
        <label className="btn" htmlFor="take-photo" style={{ width: '100%', height: 56, borderRadius: 99, background: 'var(--purple)', color: '#fff', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 18px rgba(140,107,207,.35)' }}>
          <Emoji k="camera" size={22} />
          Take a photo
        </label>
        <input id="take-photo" type="file" accept="image/*" capture="environment" hidden onChange={e => { usePhoto(e.target.files?.[0]); e.target.value = '' }} />
        <label className="btn" htmlFor="upload-photo" style={{ width: '100%', height: 56, borderRadius: 99, background: 'var(--card)', color: 'var(--deep)', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10, border: '1.5px solid var(--line)' }}>
          Upload a photo
        </label>
        <input id="upload-photo" type="file" accept="image/*" hidden onChange={e => { usePhoto(e.target.files?.[0]); e.target.value = '' }} />
        <p className="small" style={{ textAlign: 'center', marginTop: 10 }}>Your photo stays on this device.</p>
        <button
          className="ghost"
          onClick={() => setLog({
            step: 'analyzing',
            img: null,
            k: 'burrito',
            bg: '#E7DDF9',
            items: ['Rice', 'Black beans', 'Salsa'],
            name: 'Your meal',
          })}
        >
          Preview with a sample plate
        </button>
        <div className="eyebrow" style={{ margin: '22px 0 10px' }}>Yami's recommendations</div>
        {recs.length ? recs.map((rec, i) => (
          <div className="w" key={`${rec.meal}-${i}`} style={{ marginBottom: 10 }}>
            <b>{rec.meal}</b>
            <p className="small" style={{ margin: '4px 0 0' }}>{rec.day} · {rec.tip}</p>
            {rec.add && <p className="small" style={{ margin: '4px 0 0' }}>Added {rec.add} · {rec.store}, {rec.section}</p>}
          </div>
        )) : (
          <div className="w center" style={{ padding: 20 }}>
            <Bunny mood="curious" size={54} />
            <p className="small" style={{ margin: '8px 0 0' }}>Log a meal and Yami's ideas will show up here.</p>
          </div>
        )}
      </>
    )
  }

  if (log.step === 'confirm') {
    return (
      <>
        <div className="eyebrow">Log a meal</div>
        <h2 className="h" style={{ marginBottom: 12 }}>Here's what I see.</h2>
        <div className="tile" style={{ height: 200, background: log.bg, marginBottom: 14 }}>
          {log.img ? <img className="photo" src={log.img} alt="Your meal photo" /> : <Emoji k={log.k || 'salad'} size={110} />}
        </div>
        <p className="small" style={{ margin: '0 0 12px' }}>
          {log.img
            ? (log.items.length ? 'Yami labeled this from your photo. Remove or rename anything it got wrong.' : 'Yami could not pick out the foods. Add what is actually on the plate.')
            : 'This is a sample plate. Change anything that is not right.'}
        </p>
        <label className="small" htmlFor="meal-name" style={{ fontWeight: 800 }}>Meal name</label>
        <input id="meal-name" className="field" value={log.name} aria-label="Meal name" style={{ margin: '6px 0 12px' }} onChange={e => setLog({ ...log, name: e.target.value })} />
        {log.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              className="field"
              list="known-foods"
              value={item}
              aria-label={`Food ${i + 1}`}
              onChange={e => {
                const items = log.items.slice()
                items[i] = e.target.value
                setLog({ ...log, items })
              }}
            />
            <button className="pill soft" type="button" aria-label={`Remove ${item || 'food'}`} onClick={() => setLog({ ...log, items: log.items.filter((_, idx) => idx !== i) })}>Remove</button>
          </div>
        ))}
        <datalist id="known-foods">{Object.keys(FOODS).map(food => <option key={food} value={food} />)}</datalist>
        <form
          style={{ display: 'flex', gap: 8, marginTop: 4 }}
          onSubmit={e => {
            e.preventDefault()
            const form = e.currentTarget
            const input = form.elements.namedItem('addi') as HTMLInputElement
            const value = input.value.trim()
            if (!value) return
            const known = Object.keys(FOODS).find(food => food.toLowerCase() === value.toLowerCase()) || value
            setLog({ ...log, items: [...log.items, known] })
            input.value = ''
          }}
        >
          <input className="field" name="addi" list="known-foods" placeholder="Add a food, like tofu" aria-label="Add a food" style={{ flex: 1 }} />
          <button className="pill soft">Add</button>
        </form>
        {log.items.length > 0 && (
          <button className="ghost" type="button" onClick={() => setLog({ ...log, items: [] })}>Clear the guess</button>
        )}
        <div className="cta" style={{ position: 'static', marginTop: 16 }}>
          <button className="btn" disabled={!log.items.some(item => item.trim())} onClick={() => { setWhy(false); setLog({ ...log, name: log.name.trim() || 'Your meal', items: log.items.map(item => item.trim()).filter(Boolean), step: 'result' }) }}>Looks right</button>
        </div>
        <div style={{ height: 120 }} />
        <AskBar />
      </>
    )
  }

  if (!result) return null
  function finish() {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'short' })
    setMeals([...meals, { n: log!.name, p: result!.p, veg: result!.hasVeg, score: result!.score, k: log!.k, items: log!.items.slice() }])
    setRecs([{
      meal: log!.name,
      k: log!.k,
      bg: log!.bg,
      img: log!.img,
      tip: result!.tip,
      add: Object.keys(picked).length ? Object.keys(picked).join(', ') : null,
      store: Object.values(picked).includes('online') ? 'Instacart' : (Object.keys(picked).length ? shopStore(P) : undefined),
      section: result!.missing.length === 1 ? (SECTION[result!.missing[0]] || 'Pantry') : undefined,
      day,
    }, ...recs])
    setLog(null)
  }
  return (
    <>
      <div className="center" style={{ marginTop: 10 }}><Bunny mood={result.mood} size={110} /></div>
      <div className="center" style={{ margin: '-4px 0 6px' }}>
        <span className="pill sm" style={{ background: scoreColor(result.score), color: result.score >= 60 ? '#fff' : 'var(--ink)' }}>Meal score {result.score} · {scoreLabel(result.score)}</span>
      </div>
      <h3 className="q center" style={{ marginBottom: 8 }}>{result.praise}</h3>
      <p className="center" style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--muted)', fontWeight: 600 }}>{result.tip}</p>
      <div className="center">
        <button className="ghost" aria-expanded={why} onClick={() => setWhy(open => !open)}>Why? &rsaquo;</button>
      </div>
      <div className="why" hidden={!why}>{result.why}</div>
      <div className="w" style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span className="small" style={{ flex: 1 }}>{log.items.length} foods · about {result.p}g protein · {result.f}g fiber{P.show.calories ? ` · ${result.c} cal` : ''}</span>
      </div>
      {result.offers.map(offer => {
        const food = offer.item.toLowerCase()
        const choice = picked[offer.item]
        const place = choice === 'online' ? 'Instacart' : shopStore(P)
        const price = cartPrice(offer.item, place)
        return (
          <div className="w" key={offer.item} style={{ marginTop: 12, background: 'var(--sun-soft)' }}>
            <div className="eyebrow" style={{ color: '#8A6200' }}>Missing {offer.gap}</div>
            {choice ? (
              <>
                <p style={{ margin: '6px 0 10px', fontWeight: 700 }}>
                  {offer.item} is in your {place} cart · {SECTION[offer.item] || 'Pantry'} · {dollars(price)}.
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="pill sm dark" onClick={() => { setCartMode(choice === 'online' ? 'online' : 'store'); setCartOpen(true) }}>View cart</button>
                  {choice === 'online' && (
                    <a className="pill primary sm" href={instacartLink([offer.item])} target="_blank" rel="noopener">Open Instacart</a>
                  )}
                </div>
              </>
            ) : (
              <>
                <p style={{ margin: '6px 0 10px', fontWeight: 700 }}>
                  Missing {offer.gap}: add {food}. Do you want me to add {food} into your grocery cart?
                </p>
                <p className="small" style={{ margin: '0 0 10px' }}>{shopStore(P)} · {SECTION[offer.item] || 'Pantry'} · {dollars(cartPrice(offer.item, shopStore(P)))}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    className="pill sm dark"
                    onClick={() => {
                      const from = `Missing ${offer.gap} from your ${log.name.toLowerCase()}`
                      setList(current => withCartItem(current, offer.item, from, P))
                      setCartMode('store')
                      setPicked(current => ({ ...current, [offer.item]: 'store' }))
                      toast(`${offer.item} added from ${shopStore(P)}`)
                    }}
                  >
                    Add to cart
                  </button>
                  <button
                    className="pill primary sm"
                    onClick={() => {
                      const from = `Missing ${offer.gap} from your ${log.name.toLowerCase()}`
                      setList(current => withCartItem(current, offer.item, from, P, true))
                      setCartMode('online')
                      setPicked(current => ({ ...current, [offer.item]: 'online' }))
                      toast(`${offer.item} added for Instacart`)
                    }}
                  >
                    Order online
                  </button>
                </div>
              </>
            )}
          </div>
        )
      })}
      <div className="cta" style={{ position: 'static' }}>
        <button className="btn" onClick={() => { finish(); toast('Meal logged'); go('home') }}>Log it and go home</button>
        <button className="ghost" type="button" onClick={() => setLog({ ...log, step: 'confirm' })}>Fix this plate</button>
      </div>
      <div style={{ height: 80 }} />
      <AskBar />
    </>
  )
}
