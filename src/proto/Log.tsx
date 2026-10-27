import { useEffect, useState } from 'react'
import { Bunny, Emoji } from './Bunny'
import { AskBar } from './Chef'
import { SECTION, cartPrice, dollars, instacartLink, shopStore, withCartItem } from './fuel'
import { lookupBarcode, readBarcode } from './barcode'
import { SIZE_FACTOR, readPhoto, visionAvailable } from './camera'
import { applyFixes, rememberFixes, rememberMeal, usuals } from './habits'
import { FOODS, advise, foodFromKind, scoreColor, scoreLabel, type LogDraft, type PortionSize } from './model'
import { PLACES, placeLabel } from './places'
import { preloadPhotoReader } from './scan'
import { nutritionFor, resize, sourceLink, type Nutrition } from './usda'
import { useYami } from './store'

const SIZES: { id: PortionSize; label: string }[] = [
  { id: 'small', label: 'Small' },
  { id: 'regular', label: 'Regular' },
  { id: 'large', label: 'Large' },
]

// How much of a food is on the plate: Yami's estimate, adjusted by the size the person picked.
function plated(log: LogDraft, item: string, base: Nutrition) {
  const spotted = log.spotted?.[item]
  const chosen = log.sizes?.[item] ?? spotted?.size ?? 'regular'
  const grams = spotted?.grams
    ? (spotted.grams * SIZE_FACTOR[chosen]) / SIZE_FACTOR[spotted.size ?? 'regular']
    : base.grams * SIZE_FACTOR[chosen]
  return resize(base, grams)
}

export function Log() {
  const store = useYami()
  const { P, log, setLog, meals, setMeals, setList, go, toast, setChat, setCartOpen, setCartMode, recs, setRecs } = store
  const [why, setWhy] = useState(false)
  const [picked, setPicked] = useState<Record<string, 'store' | 'online'>>({})
  const [usda, setUsda] = useState<Record<string, Nutrition | null>>({})
  const [usdaOpen, setUsdaOpen] = useState(false)
  const [vision, setVision] = useState<boolean | null>(null)
  const [code, setCode] = useState('')
  const itemsKey = log?.step === 'result' ? log.items.join('|') : ''
  const nutrition: Record<string, Nutrition | null> = {}
  if (log?.step === 'result') {
    for (const item of log.items) {
      const base = log.packaged?.[item] ?? usda[item]
      if (base !== undefined) nutrition[item] = base ? plated(log, item, base) : null
    }
  }
  const usdaReady = log?.step === 'result' ? log.items.every(item => item in nutrition) : false
  // Food groups from the photo fill in for foods Yami's table doesn't know; database numbers override the amounts.
  const measured = Object.fromEntries(
    (log?.step === 'result' ? log.items : []).flatMap(item => {
      const spotted = log?.spotted?.[item]
      const group = !FOODS[item] && spotted?.kind ? foodFromKind(item, spotted.kind, spotted.whole) : null
      const n = nutrition[item]
      if (!group && !n) return []
      return [[item, { ...(group || FOODS[item] || { t: [] }), ...(n ? { p: n.protein, f: n.fiber, c: n.calories } : { p: group!.p, f: group!.f, c: group!.c ?? 80 }) }]]
    }),
  )
  const result = log?.step === 'result' ? advise(P, log.items, measured) : null

  // Once the foods are confirmed, look each one up in USDA FoodData Central (packaged foods already have label data).
  useEffect(() => {
    if (!itemsKey || !log) return
    let cancel = false
    const items = itemsKey.split('|')
    setUsda({})
    setUsdaOpen(false)
    items.forEach(item => {
      if (log.packaged?.[item]) return
      void nutritionFor(log.spotted?.[item]?.usda || item).then(found => {
        if (!cancel) setUsda(current => ({ ...current, [item]: found }))
      })
    })
    return () => { cancel = true }
  }, [itemsKey])

  // Claude reads photos when the dev server has a key; otherwise warm up the on-device reader so the first photo is quick.
  useEffect(() => {
    let cancel = false
    void visionAvailable().then(ok => {
      if (cancel) return
      setVision(ok)
      if (!ok) preloadPhotoReader()
    })
    return () => { cancel = true }
  }, [])

  useEffect(() => {
    if (!log) {
      setLog({ step: 'start', img: null, k: null, bg: '#F7E6E3', items: [], name: '' })
    }
  }, [log, setLog])

  useEffect(() => {
    if (log?.step === 'analyzing') setChat([])
  }, [log?.step, setChat])

  useEffect(() => {
    if (log?.step !== 'analyzing') return
    let cancel = false
    const extra = log.extraImg
    const photo = extra ?? log.img
    const done = (patch: Partial<LogDraft>) => {
      if (!cancel) setLog(current => (current?.step === 'analyzing' ? { ...current, ...patch, step: 'confirm', extraImg: null } : current))
    }
    ;(async () => {
      if (!photo) {
        await new Promise(resolve => window.setTimeout(resolve, 900))
        done({})
        return
      }
      if (log.mode === 'barcode') {
        const digits = await readBarcode(photo)
        const product = digits ? await lookupBarcode(digits).catch(() => null) : null
        if (product) done({ items: [product.name], name: product.name, packaged: { [product.name]: product }, note: undefined })
        else done({ items: [], note: digits ? `Barcode ${digits} isn't in Open Food Facts yet. Add the food by name.` : "Yami couldn't read that barcode. Type the numbers under it, or add the food by name." })
        return
      }
      try {
        const reading = await readPhoto(photo, log.place ?? null)
        const spotted = { ...(log.spotted || {}) }
        const sizes = { ...(log.sizes || {}) }
        const origin = { ...(log.origin || {}) }
        const found = reading.items.map(entry => {
          const name = applyFixes(entry.name)
          spotted[name] = { usda: entry.usda, grams: entry.grams, size: entry.size, kind: entry.kind, whole: entry.whole }
          sizes[name] = entry.size
          origin[name] = entry.name
          return name
        })
        // A second photo adds to the plate; the first one sets it.
        const items = extra ? [...log.items, ...found.filter(name => !log.items.includes(name))] : found
        done({ items, name: extra ? log.name : reading.meal, place: reading.place, by: reading.by, spotted, sizes, origin, note: undefined })
      } catch {
        done({ items: extra ? log.items : [] })
      }
    })()
    return () => { cancel = true }
  }, [log?.step, log?.img, log?.extraImg, setLog])

  if (!log) return null

  if (log.step === 'analyzing') {
    return (
      <div className="center" style={{ marginTop: 120 }}>
        <div className="pulse" style={{ display: 'inline-block' }}><Bunny mood="curious" size={120} /></div>
        <h3 className="q">{log.mode === 'barcode' ? 'Reading the barcode…' : log.img ? 'Reading your photo…' : "Checking what's on your plate…"}</h3>
      </div>
    )
  }

  function usePhoto(file: File | undefined, mode: 'photo' | 'barcode' = 'photo') {
    if (!file) return
    setLog({
      step: 'analyzing',
      mode,
      place: log?.place ?? null,
      img: URL.createObjectURL(file),
      k: null,
      bg: '#F7E6E3',
      items: [],
      name: 'Your meal',
    })
  }

  async function lookUpCode() {
    if (!log) return
    const product = await lookupBarcode(code).catch(() => null)
    if (!product) {
      toast("That barcode isn't in Open Food Facts yet")
      return
    }
    setCode('')
    setLog({ ...log, step: 'confirm', mode: 'barcode', img: null, k: null, items: [product.name], name: product.name, packaged: { [product.name]: product } })
  }

  if (log.step === 'start') {
    return (
      <>
        <div className="eyebrow">Chef Yami</div>
        <h2 className="h" style={{ marginBottom: 6 }}>What's on your plate?</h2>
        <p className="small" style={{ marginBottom: 12 }}>Take a photo with your camera, or upload one you already have. You can fix anything Yami gets wrong.</p>
        <div className="eyebrow" style={{ margin: '4px 0 8px' }}>Where are you eating?</div>
        <div className="chips" style={{ marginBottom: 16 }}>
          {PLACES.map(place => (
            <button
              key={place.id}
              type="button"
              className="chip"
              aria-pressed={log.place === place.id}
              onClick={() => setLog({ ...log, place: log.place === place.id ? null : place.id })}
            >
              {place.label}
            </button>
          ))}
        </div>
        {usuals().length > 0 && (
          <>
            <div className="eyebrow" style={{ margin: '0 0 8px' }}>Your usuals</div>
            {usuals().map(usual => (
              <button
                key={usual.items.join('|')}
                type="button"
                className="w"
                style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 8, border: '1.5px solid var(--line)' }}
                onClick={() => setLog({ step: 'result', img: null, k: null, bg: '#F7E6E3', items: usual.items, name: usual.name, place: usual.place, sizes: usual.sizes, packaged: usual.packaged })}
              >
                <b>{usual.name}</b>
                <span className="small" style={{ display: 'block' }}>
                  {usual.items.join(', ')}
                  {usual.place ? ` · ${placeLabel(usual.place)}` : ''}
                  {usual.count > 1 ? ` · logged ${usual.count} times` : ''}
                </span>
              </button>
            ))}
          </>
        )}
        <label className="btn" htmlFor="take-photo" style={{ width: '100%', height: 56, borderRadius: 99, background: 'var(--purple)', color: '#fff', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 18px rgba(153,0,0,.35)' }}>
          <Emoji k="camera" size={22} />
          Take a photo
        </label>
        <input id="take-photo" type="file" accept="image/*" capture="environment" hidden onChange={e => { usePhoto(e.target.files?.[0]); e.target.value = '' }} />
        <label className="btn" htmlFor="upload-photo" style={{ width: '100%', height: 56, borderRadius: 99, background: 'var(--card)', color: 'var(--deep)', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10, border: '1.5px solid var(--line)' }}>
          Upload a photo
        </label>
        <input id="upload-photo" type="file" accept="image/*" hidden onChange={e => { usePhoto(e.target.files?.[0]); e.target.value = '' }} />
        <label className="btn" htmlFor="scan-barcode" style={{ width: '100%', height: 56, borderRadius: 99, background: 'var(--card)', color: 'var(--deep)', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10, border: '1.5px solid var(--line)' }}>
          Scan a barcode
        </label>
        <input id="scan-barcode" type="file" accept="image/*" capture="environment" hidden onChange={e => { usePhoto(e.target.files?.[0], 'barcode'); e.target.value = '' }} />
        <form style={{ display: 'flex', gap: 8, marginTop: 8 }} onSubmit={e => { e.preventDefault(); void lookUpCode() }}>
          <input className="field" inputMode="numeric" value={code} onChange={e => setCode(e.target.value)} placeholder="Or type the barcode numbers" aria-label="Barcode numbers" style={{ flex: 1 }} />
          <button className="pill soft" disabled={code.replace(/\D/g, '').length < 8}>Look up</button>
        </form>
        <p className="small" style={{ textAlign: 'center', marginTop: 10 }}>
          Tip: shoot from above with the whole plate and any cup or wrapper in frame.
        </p>
        <p className="small" style={{ textAlign: 'center', marginTop: 4 }}>
          {vision ? "Yami sends your photo to Claude to read the foods, and doesn't keep a copy." : 'Your photo stays on this device.'}
        </p>
        <button
          className="ghost"
          onClick={() => setLog({
            step: 'analyzing',
            img: null,
            k: 'burrito',
            bg: '#F7E6E3',
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
            ? (log.items.length ? 'Yami labeled this from your photo. Remove or rename anything it got wrong, and set how much was there.' : 'Yami could not pick out the foods. Add what is actually on the plate.')
            : log.packaged && log.items.length ? 'From the barcode label. Change the amount if you had more or less than one serving.'
            : log.note ? '' : 'This is a sample plate. Change anything that is not right.'}
        </p>
        {log.note && <p className="small" style={{ margin: '0 0 12px', fontWeight: 700 }}>{log.note}</p>}
        {placeLabel(log.place) && <p className="small" style={{ margin: '0 0 12px' }}>At {placeLabel(log.place)}</p>}
        <label className="small" htmlFor="meal-name" style={{ fontWeight: 800 }}>Meal name</label>
        <input id="meal-name" className="field" value={log.name} aria-label="Meal name" style={{ margin: '6px 0 12px' }} onChange={e => setLog({ ...log, name: e.target.value })} />
        {log.items.map((item, i) => {
          const size = log.sizes?.[item] ?? 'regular'
          return (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input
                  className="field"
                  list="known-foods"
                  value={item}
                  aria-label={`Food ${i + 1}`}
                  onChange={e => {
                    // Renaming keeps the food's amount and what Yami first called it.
                    const next = e.target.value
                    const items = log.items.slice()
                    items[i] = next
                    const move = <T,>(map: Record<string, T> | undefined) => {
                      if (!map || !(item in map)) return map
                      const copy = { ...map, [next]: map[item] }
                      delete copy[item]
                      return copy
                    }
                    setLog({ ...log, items, sizes: move(log.sizes), spotted: move(log.spotted), packaged: move(log.packaged), origin: { ...move(log.origin), [next]: log.origin?.[item] ?? item } })
                  }}
                />
                <button className="pill soft" type="button" aria-label={`Remove ${item || 'food'}`} onClick={() => setLog({ ...log, items: log.items.filter((_, idx) => idx !== i) })}>Remove</button>
              </div>
              <div className="seg" role="group" aria-label={`How much ${item || 'food'}`}>
                {SIZES.map(option => (
                  <button key={option.id} type="button" aria-pressed={size === option.id} onClick={() => setLog({ ...log, sizes: { ...(log.sizes || {}), [item]: option.id } })}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
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
        <label className="ghost" htmlFor="extra-photo" style={{ display: 'block', cursor: 'pointer' }}>+ Add another photo (a side or a drink)</label>
        <input
          id="extra-photo"
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={e => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) setLog({ ...log, step: 'analyzing', mode: 'photo', img: log.img ?? URL.createObjectURL(file), extraImg: URL.createObjectURL(file) })
          }}
        />
        {log.items.length > 0 && (
          <button className="ghost" type="button" onClick={() => setLog({ ...log, items: [] })}>Clear the guess</button>
        )}
        <div className="cta" style={{ position: 'static', marginTop: 16 }}>
          <button
            className="btn"
            disabled={!log.items.some(item => item.trim())}
            onClick={() => {
              setWhy(false)
              rememberFixes(log.items.flatMap(item => (log.origin?.[item] ? [[log.origin[item], item] as [string, string]] : [])))
              setLog({ ...log, name: log.name.trim() || 'Your meal', items: log.items.map(item => item.trim()).filter(Boolean), step: 'result' })
            }}
          >
            Looks right
          </button>
        </div>
        <div style={{ height: 120 }} />
        <AskBar />
      </>
    )
  }

  if (!result) return null
  function finish() {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'short' })
    const foods = Object.fromEntries(Object.entries(measured).map(([item, food]) => [item, { ...food, t: food.t ?? [] }]))
    setMeals([...meals, { n: log!.name, p: result!.p, f: result!.f, c: result!.c, veg: result!.hasVeg, score: result!.score, k: log!.k, items: log!.items.slice(), foods }])
    rememberMeal({ name: log!.name, items: log!.items.slice(), sizes: { ...(log!.sizes || {}) }, place: log!.place ?? null, packaged: log!.packaged })
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
        <span className="small" style={{ flex: 1 }}>{log.items.length} {log.items.length === 1 ? 'food' : 'foods'} · about {result.p}g protein · {result.f}g fiber{P.show.calories ? ` · ${result.c} cal` : ''}</span>
      </div>
      <div className="w" style={{ marginTop: 8 }}>
        <span className="small">
          {usdaReady
            ? Object.values(nutrition).some(Boolean)
              ? `Nutrition from ${[...new Set(Object.values(nutrition).flatMap(n => (n ? [n.source === 'USDA' ? 'USDA FoodData Central' : 'the Open Food Facts label'] : [])))].join(' and ')}, for the amount on your plate.`
              : "No database match, so these are Yami's estimates."
            : 'Checking USDA FoodData Central…'}
        </span>
        {usdaReady && Object.values(nutrition).some(Boolean) && (
          <>
            <button className="ghost" type="button" aria-expanded={usdaOpen} onClick={() => setUsdaOpen(open => !open)} style={{ display: 'block' }}>
              {usdaOpen ? 'Hide the breakdown' : 'See the breakdown'}
            </button>
            {usdaOpen && (
              <ul className="small" style={{ margin: '6px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>
                {log.items.map(item => {
                  const n = nutrition[item]
                  return (
                    <li key={item}>
                      {n ? (
                        <>
                          <strong>{item}</strong> ({n.grams} g):{' '}
                          {n.protein} g protein · {n.fiber} g fiber · {n.carbs} g carbs · {n.fat} g fat
                          {P.show.calories ? ` · ${n.calories} cal` : ''}.{' '}
                          <a href={sourceLink(n)} target="_blank" rel="noopener">{n.source}: {n.match}</a>
                        </>
                      ) : (
                        <><strong>{item}</strong>: no database match, Yami's estimate used.</>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
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
