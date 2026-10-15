import { useEffect, useRef, useState } from 'react'
import { Bunny, Emoji } from './Bunny'
import { shopStore, withCartItem } from './fuel'
import { freshDeck, MENUS, rank, type DeckCard, type Profile } from './model'
import { useYami } from './store'

export function Boards() {
  const { P, deck, setDeck, board, setBoard, favs, setFavs, bview, setBview, list, setList, toast, setCartOpen, dayMode } = useYami()
  const [nearNote, setNearNote] = useState('')
  const cards = deck ?? freshDeck(P)
  useEffect(() => {
    if (!deck) setDeck(freshDeck(P))
  }, [deck, P, setDeck])

  return (
    <>
      <div className="eyebrow">Meal inspiration</div>
      <h2 className="h">{dayMode === 'exam' ? 'Steady energy' : dayMode === 'late' ? 'Fiber today' : dayMode === 'burnout' ? 'Easy meals' : bview === 'swipe' ? "What's good near campus?" : "This week's cravings"}</h2>
      <div className="seg">
        <button aria-pressed={bview === 'swipe'} onClick={() => setBview('swipe')}>Swipe</button>
        <button aria-pressed={bview === 'board'} onClick={() => setBview('board')}>My board ({board.length})</button>
      </div>
      {bview === 'swipe' && (
        <div className="w" style={{ marginBottom: 12 }}>
          <div className="eyebrow">Around campus</div>
          <p style={{ margin: '6px 0 10px', fontWeight: 700 }}>Meal ideas from dining spots near you.</p>
          <button className="pill primary sm" onClick={findNearby}>Find places near me</button>
          {nearNote && <p className="small" style={{ margin: '8px 0 0' }}>{nearNote}</p>}
        </div>
      )}
      <SocialSave onSave={saveSocial} />
      {bview === 'swipe' ? (
        <Swipe cards={cards} picked={board.length} onDecide={decide} onPhotos={addPhotos} onSeeBoard={() => setBview('board')} />
      ) : board.length ? (
        <>
          <div className="masonry">
            {board.map((card, i) => (
              <div key={`${card.n}-${i}`} className="tile" style={{ background: card.bg, height: [150, 115, 130, 145, 120, 105][i % 6] }}>
                {card.img ? <img className="photo" src={card.img} alt="" /> : <Emoji k={card.k || 'salad'} size={54} />}
                <span className="tag">{favs.includes(card.n) ? '★ ' : ''}{card.n}</span>
              </div>
            ))}
          </div>
          <div className="w" style={{ background: 'var(--sun-soft)', marginTop: 4 }}>
            <b>{board.length} meals picked</b>
            <p className="small" style={{ margin: '4px 0 10px', color: 'var(--ink)' }}>Turn them into a grocery list for {shopStore(P)}.</p>
            <button
              className="pill dark sm"
              onClick={() => {
                let next = list
                board.forEach(card => {
                  next = withCartItem(next, 'Ingredients for ' + card.n, 'your meal inspiration board', P)
                })
                setList(next)
                toast('Added to your grocery cart')
                setCartOpen(true)
              }}
            >
              Make my grocery list
            </button>
          </div>
        </>
      ) : (
        <div className="w center" style={{ padding: 28 }}>
          <Bunny mood="curious" size={90} />
          <p style={{ fontWeight: 700, margin: '10px 0' }}>Your board is empty. Swipe right on meals you want this week.</p>
          <button className="pill primary" onClick={() => setBview('swipe')}>Start swiping</button>
        </div>
      )}
    </>
  )

  function showCampus(note: string) {
    setDeck([...CAMPUS, ...freshDeck(P)])
    setNearNote(note)
  }

  function findNearby() {
    setNearNote('Looking for dining spots near you…')
    if (!navigator.geolocation) {
      showCampus('Location is off, so here are campus staples.')
      return
    }
    navigator.geolocation.getCurrentPosition(async position => {
      try {
        const { latitude, longitude } = position.coords
        const query = `[out:json][timeout:12];node["amenity"~"restaurant|fast_food|cafe"](around:1200,${latitude},${longitude});out 20;`
        const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query })
        const data = await response.json() as { elements?: { tags?: { name?: string } }[] }
        const names = [...new Set((data.elements || []).map(item => item.tags?.name).filter((name): name is string => Boolean(name)))].slice(0, 8)
        if (!names.length) {
          showCampus('No dining spots came back nearby, so here are campus staples.')
          return
        }
        setDeck([...placeCards(names, P), ...freshDeck(P)])
        setNearNote('Ideas from dining spots near you.')
      } catch {
        showCampus('Places did not load, so here are campus staples.')
      }
    }, () => showCampus('Location is off, so here are campus staples.'), { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 })
  }

  function decide(dir: 'L' | 'R' | 'U') {
    const next = [...cards]
    const card = next.shift()
    if (!card) return
    setDeck(next)
    if (dir === 'R' || dir === 'U') setBoard([...board, card])
    if (dir === 'U') {
      setFavs([...favs, card.n])
      toast('Saved as a favorite')
    }
  }

  function saveSocial(card: DeckCard) {
    setBoard([card, ...board])
    setBview('board')
    toast('Saved to your board')
  }

  function addPhotos(files: FileList) {
    const added: DeckCard[] = [...files].map(file => ({
      img: URL.createObjectURL(file),
      n: 'Your meal',
      m: 'From your photos',
      d: 'Recent',
      bg: '#E7DDF9',
      veg: true,
    }))
    setDeck([...added, ...cards])
    toast(`${files.length} photo${files.length > 1 ? 's' : ''} added`)
  }
}

function Swipe({
  cards,
  picked,
  onDecide,
  onPhotos,
  onSeeBoard,
}: {
  cards: DeckCard[]
  picked: number
  onDecide: (dir: 'L' | 'R' | 'U') => void
  onPhotos: (files: FileList) => void
  onSeeBoard: () => void
}) {
  const top = useRef<HTMLDivElement>(null)
  const stamps = useRef<{ left: HTMLSpanElement | null; right: HTMLSpanElement | null }>({ left: null, right: null })
  const drag = useRef({ on: false, sx: 0, sy: 0, dx: 0, dy: 0 })
  const stack = cards.slice(0, 3).reverse()

  function fly(dir: 'L' | 'R' | 'U') {
    const el = top.current
    if (!el) {
      onDecide(dir)
      return
    }
    el.style.transition = 'transform .3s, opacity .3s'
    el.style.transform = dir === 'R' ? 'translate(130%,10%) rotate(20deg)' : dir === 'L' ? 'translate(-130%,10%) rotate(-20deg)' : 'translateY(-130%)'
    el.style.opacity = '0'
    window.setTimeout(() => onDecide(dir), 260)
  }

  return (
    <>
      {cards.length ? (
        <>
          <div className="deck">
            {stack.map((card, i) => {
              const isTop = i === stack.length - 1
              const rot = isTop ? 0 : i % 2 ? 4 : -3
              return (
                <div
                  key={`${card.n}-${i}`}
                  className="card"
                  ref={isTop ? top : undefined}
                  style={{ background: card.bg, transform: `rotate(${rot}deg) scale(${isTop ? 1 : 0.96})` }}
                  onPointerDown={isTop ? e => {
                    drag.current = { on: true, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0 }
                    top.current?.setPointerCapture(e.pointerId)
                    if (top.current) top.current.style.transition = 'none'
                  } : undefined}
                  onPointerMove={isTop ? e => {
                    if (!drag.current.on || !top.current) return
                    drag.current.dx = e.clientX - drag.current.sx
                    drag.current.dy = e.clientY - drag.current.sy
                    top.current.style.transform = `translate(${drag.current.dx}px,${drag.current.dy}px) rotate(${drag.current.dx / 18}deg)`
                    if (stamps.current.right) stamps.current.right.style.opacity = String(Math.max(0, drag.current.dx / 100))
                    if (stamps.current.left) stamps.current.left.style.opacity = String(Math.max(0, -drag.current.dx / 100))
                  } : undefined}
                  onPointerUp={isTop ? () => {
                    const { dx, dy } = drag.current
                    drag.current.on = false
                    if (dx > 90) fly('R')
                    else if (dx < -90) fly('L')
                    else if (dy < -110) fly('U')
                    else if (top.current) {
                      top.current.style.transition = 'transform .25s'
                      top.current.style.transform = ''
                      if (stamps.current.right) stamps.current.right.style.opacity = '0'
                      if (stamps.current.left) stamps.current.left.style.opacity = '0'
                    }
                  } : undefined}
                >
                  {card.img ? <img className="photo" src={card.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : <Emoji k={card.k || 'salad'} size={170} />}
                  <span className="src">From your camera roll · {card.d}</span>
                  {isTop && (
                    <>
                      <span ref={el => { stamps.current.left = el }} className="stamp" style={{ color: '#716A80', borderColor: '#716A80', left: 22, right: 'auto', transform: 'rotate(-12deg)', opacity: 0 }}>NOT NOW</span>
                      <span ref={el => { stamps.current.right = el }} className="stamp" style={{ color: '#fff', borderColor: '#fff', opacity: 0 }}>ADD</span>
                    </>
                  )}
                  <div className="meta"><b>{card.n}</b>{card.m}</div>
                </div>
              )
            })}
          </div>
          <div className="swipebtns">
            <button aria-label="Not this week" style={{ color: 'var(--muted)' }} onClick={() => fly('L')}>&times;</button>
            <button aria-label="Save as favorite" style={{ background: '#FFE08A' }} onClick={() => fly('U')}>&#9733;</button>
            <button aria-label="Add to board" style={{ background: 'var(--purple)', color: '#fff' }} onClick={() => fly('R')}>&#9829;</button>
          </div>
          <p className="small center" style={{ marginTop: 10 }}>Left: not this week · Star: always · Right: add to board</p>
        </>
      ) : (
        <div className="w center" style={{ marginTop: 20, padding: 28 }}>
          <Bunny mood="proud" size={100} />
          <h3 className="q" style={{ margin: '8px 0' }}>You're all caught up</h3>
          <p className="small">You picked {picked} meals for this week.</p>
          <button className="pill primary" style={{ marginTop: 12 }} onClick={onSeeBoard}>See my board</button>
        </div>
      )}
      <label className="w" htmlFor="addp" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, cursor: 'pointer' }}>
        <Emoji k="camera" size={30} />
        <span style={{ flex: 1 }}>
          <b>Add photos from your camera roll</b><br />
          <span className="small">Only the photos you choose. They stay on this device.</span>
        </span>
      </label>
      <input id="addp" type="file" accept="image/*" multiple hidden onChange={e => { if (e.target.files?.length) onPhotos(e.target.files) }} />
    </>
  )
}

const CAMPUS: DeckCard[] = [
  { k: 'burrito', n: 'Dining hall grain bowl', m: 'Campus dining · add greens', d: 'On campus', bg: '#E7DDF9', veg: true },
  { k: 'taco', n: 'Food truck tacos', m: 'Near campus · ask for beans', d: 'On campus', bg: '#FFF0C9', veg: true },
  { k: 'salad', n: 'Campus cafe salad', m: 'Near campus · add a protein', d: 'On campus', bg: '#E2EEFB', veg: true },
  { k: 'ramen', n: 'Late-night ramen', m: 'Near campus · add an egg or tofu', d: 'On campus', bg: '#FBD9E1', veg: true },
]

const BGS = ['#E7DDF9', '#FBD9E1', '#FFF0C9', '#E2EEFB']

function placeCards(names: string[], P: Profile): DeckCard[] {
  return names.map((name, i) => {
    const menuKey = Object.keys(MENUS).find(key => name.toLowerCase().includes(key.toLowerCase()))
    const pick = menuKey ? rank(P, MENUS[menuKey])[0] : undefined
    return {
      k: 'salad',
      n: pick && menuKey ? `${menuKey}: ${pick.n}` : name,
      m: pick ? `Near you · ${pick.tip}` : 'Near you · ask for a protein and a vegetable',
      d: 'Nearby',
      bg: BGS[i % BGS.length],
      veg: pick ? pick.veg : true,
    }
  })
}
const FOODWORDS = ['ramen', 'salad', 'taco', 'bowl', 'pasta', 'soup', 'rice', 'tofu', 'chicken', 'salmon', 'oats', 'yogurt', 'burrito', 'pizza', 'noodles', 'sandwich']

function SocialSave({ onSave }: { onSave: (card: DeckCard) => void }) {
  const [msg, setMsg] = useState('')
  const count = useRef(0)

  function saveLink(raw: string) {
    const value = raw.trim()
    if (!/^https?:\/\//i.test(value)) {
      setMsg('Paste a full link, starting with https://')
      return
    }
    const host = value.toLowerCase()
    const src = host.includes('tiktok') ? 'TikTok' : host.includes('instagram') ? 'Instagram' : host.includes('youtube') || host.includes('youtu.be') ? 'YouTube' : host.includes('pinterest') ? 'Pinterest' : 'the web'
    const tokens = decodeURIComponent(value).toLowerCase().split(/[^a-z]+/)
    const hit = FOODWORDS.find(word => tokens.includes(word))
    const name = hit ? `${hit[0].toUpperCase()}${hit.slice(1)} meal` : 'Saved meal'
    count.current += 1
    onSave({ n: name, m: `Saved from ${src}`, d: 'Today', bg: BGS[count.current % BGS.length], veg: true, k: 'salad', src, link: value })
    setMsg('')
  }

  return (
    <div className="w" style={{ marginBottom: 14 }}>
      <div className="eyebrow">Save from social media</div>
      <form
        style={{ display: 'flex', gap: 8, marginTop: 10 }}
        onSubmit={e => {
          e.preventDefault()
          const input = e.currentTarget.elements.namedItem('link') as HTMLInputElement
          saveLink(input.value)
          input.value = ''
        }}
      >
        <input className="field" name="link" placeholder="Paste a TikTok, Instagram, YouTube or Pinterest link" aria-label="Meal link" style={{ flex: 1 }} />
        <button className="pill soft">Save</button>
      </form>
      <label className="pill soft sm" htmlFor="socialf" style={{ marginTop: 10, cursor: 'pointer' }}>Upload an image or video</label>
      <input
        id="socialf"
        type="file"
        accept="image/*,video/*"
        hidden
        onChange={e => {
          const file = e.target.files?.[0]
          if (!file) return
          const video = file.type.startsWith('video')
          count.current += 1
          onSave({
            n: video ? 'Saved video meal' : 'Saved meal',
            m: 'From your camera roll',
            d: 'Today',
            bg: BGS[count.current % BGS.length],
            veg: true,
            k: 'salad',
            src: 'upload',
            img: video ? null : URL.createObjectURL(file),
          })
          e.target.value = ''
        }}
      />
      {msg && <p id="lmsg" className="small" style={{ margin: '8px 0 0' }}>{msg}</p>}
    </div>
  )
}
