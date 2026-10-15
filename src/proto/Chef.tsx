import { useEffect, useRef } from 'react'
import { Bunny } from './Bunny'
import { findGroceries, shopStore, withCartItem } from './fuel'
import { goal, isVeg, type Profile } from './model'
import { useYami } from './store'

const SUGG = ['What should I eat next?', 'Make this meal higher in protein', 'Give me a quick recipe idea', 'Is this good for my goal?']

export function AskBar() {
  const { setChefOpen, chat, setChat, P, log, meals } = useYami()
  return (
    <button
      className="askbar"
      onClick={() => {
        if (!chat.length) {
          const meal = log?.items?.length ? log.items.join(', ') : meals.length ? meals[meals.length - 1].n : ''
          setChat([{ role: 'assistant', content: `Hi ${P.name || 'there'}, I'm Chef Yami.${meal ? ` I see ${meal}.` : ''} Ask me for a recipe, a swap or what to eat next.` }])
        }
        setChefOpen(true)
      }}
    >
      <span className="av"><Bunny mood="happy" size={36} /></span>
      <span className="t">Ask Chef Yami<span className="s">Recipes, swaps and ideas for this meal</span></span>
      <span className="pill primary sm">Ask</span>
    </button>
  )
}

export function Chef() {
  const { P, chat, setChat, setChefOpen, list, setList, toast } = useYami()
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight
  }, [chat])

  function send(text: string) {
    const q = text.trim()
    if (!q) return
    setChat(current => [...current, { role: 'user', content: q }, { role: 'assistant', content: 'Thinking…' }])
    window.setTimeout(() => {
      setChat(current => {
        const next = [...current]
        const last = next[next.length - 1]
        if (last?.role === 'assistant' && last.content === 'Thinking…') next[next.length - 1] = { role: 'assistant', content: fallback(P, q) }
        return next
      })
    }, 600)
  }

  return (
    <div className="sheet" onClick={e => { if (e.target === e.currentTarget) setChefOpen(false) }}>
      <div className="panel" role="dialog" aria-label="Ask Chef Yami">
        <div className="head">
          <Bunny mood="happy" size={40} />
          <div style={{ flex: 1 }}>
            <b style={{ fontFamily: 'var(--display)', fontSize: 19 }}>Chef Yami</b>
            <div className="small">General ideas, not medical advice</div>
          </div>
          <button className="pill soft sm" onClick={() => setChefOpen(false)}>Close</button>
        </div>
        <div className="msgs" ref={scroller}>
          {chat.map((message, i) => {
            const hits = message.role === 'assistant' && message.content !== 'Thinking…' && !message.added ? findGroceries(P, message.content) : []
            return (
              <div key={i}>
                <div className={`msg ${message.role === 'user' ? 'me' : 'bot'}`}>{message.content}</div>
                {hits.length > 0 && (
                  <button
                    className="pill soft sm"
                    style={{ marginTop: 6 }}
                    onClick={() => {
                      let next = list
                      hits.forEach(name => { next = withCartItem(next, name, 'Chef Yami', P) })
                      setList(next)
                      setChat(current => current.map((row, index) => index === i ? { ...row, added: true } : row))
                      toast(`Added to your cart for ${shopStore(P)}`)
                    }}
                  >
                    Add {hits.join(', ')} to cart · {shopStore(P)}
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <div className="sugg">
          {SUGG.map(prompt => <button key={prompt} onClick={() => send(prompt)}>{prompt}</button>)}
        </div>
        <form
          className="composer"
          onSubmit={e => {
            e.preventDefault()
            const input = e.currentTarget.elements.namedItem('ci') as HTMLInputElement
            send(input.value)
            input.value = ''
          }}
        >
          <input name="ci" placeholder="Ask Chef Yami anything" autoComplete="off" aria-label="Message Chef Yami" />
          <button>Send</button>
        </form>
      </div>
    </div>
  )
}

function fallback(P: Profile, q: string) {
  const veg = isVeg(P)
  const protein = veg ? 'tofu, Greek yogurt or edamame' : 'eggs, chicken or Greek yogurt'
  const t = q.toLowerCase()
  if (t.includes('protein')) return `Easy one. Add ${protein} to this meal. A handful of beans or a sprinkle of seeds works too, and both are cheap.`
  if (t.includes('recipe')) return `Try a 10-minute bowl: microwave rice, add ${veg ? 'black beans and tofu' : 'black beans and chicken'}, top with salsa, avocado and a squeeze of lime. Filling, cheap and good for ${goal(P).toLowerCase()}.`
  if (t.includes('next')) return `For your next meal, aim for one protein, one vegetable and one carb you enjoy. Something like ${veg ? 'a tofu stir-fry with rice' : 'a chicken and veggie wrap'} would be perfect.`
  if (t.includes('goal')) return `This meal is a good start. To make it even better for ${goal(P).toLowerCase()}, add a little protein and something green. Small steps count.`
  return 'Great question. A simple rule: pair a protein with a vegetable at each meal, and keep easy snacks like fruit and yogurt around. Want a quick recipe?'
}
