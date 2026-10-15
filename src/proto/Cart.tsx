import { Bunny } from './Bunny'
import { cartPrice, dollars, shopStore, withCartItem } from './fuel'
import { useYami } from './store'

export function Cart() {
  const { P, list, setList, board, cartMode, setCartMode, setCartOpen } = useYami()
  const store = shopStore(P)
  const priced = list.map(item => ({
    ...item,
    price: item.price ?? cartPrice(item.n, item.store || (cartMode === 'online' ? 'Instacart' : store)),
  }))
  const subtotal = priced.reduce((sum, item) => sum + item.price, 0)
  const done = list.filter(item => item.done).length

  function close() {
    setCartOpen(false)
  }

  return (
    <div className="sheet" onClick={e => { if (e.target === e.currentTarget) close() }}>
      <div className="panel" role="dialog" aria-label="Your grocery cart">
        <div className="head">
          <div style={{ flex: 1 }}>
            <div className="eyebrow">This week</div>
            <b style={{ fontFamily: 'var(--display)', fontSize: 22 }}>Your grocery cart</b>
          </div>
          <button className="pill soft sm" onClick={close}>Close</button>
        </div>
        <div className="msgs" style={{ gap: 0 }}>
          <div className="seg" style={{ margin: '0 0 6px' }}>
            <button aria-pressed={cartMode === 'store'} onClick={() => setCartMode('store')}>Shop in store</button>
            <button aria-pressed={cartMode === 'online'} onClick={() => setCartMode('online')}>Order online</button>
          </div>
          <p className="small" style={{ margin: '0 0 6px' }}>
            {cartMode === 'store' ? `Shopping at ${store}. Yami only suggests foods you can find there. Tick items as they go in your basket.` : 'Send this list to Instacart and get it delivered.'}
          </p>
          {priced.length ? priced.map((item, i) => (
            <div className="citem" key={`${item.n}-${i}`}>
              <button
                className="box"
                role="checkbox"
                aria-checked={!!item.done}
                aria-label={item.n}
                onClick={() => setList(list.map((row, idx) => idx === i ? { ...row, done: !row.done } : row))}
              >
                {item.done ? '✓' : ''}
              </button>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 700, textDecoration: item.done ? 'line-through' : undefined, color: item.done ? 'var(--muted)' : undefined }}>{item.n}</span>
                <span className="small" style={{ display: 'block', marginTop: 2 }}>From {item.from || 'you'}</span>
                <span className="small" style={{ display: 'block', marginTop: 2, color: 'var(--deep)', fontWeight: 800 }}>{item.store || store} · {item.section || 'Pantry'} · {dollars(item.price)}</span>
              </span>
              <button className="ghost" style={{ margin: 0 }} aria-label={`Remove ${item.n}`} onClick={() => setList(list.filter((_, idx) => idx !== i))}>Remove</button>
            </div>
          )) : (
            <div className="center" style={{ padding: '24px 0' }}>
              <Bunny mood="curious" size={80} />
              <p style={{ fontWeight: 700, margin: '8px 0 4px' }}>Your cart is empty.</p>
              <p className="small">Add foods from Yami's tips, your meal board or below.</p>
            </div>
          )}
          {priced.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
              <div>
                <div className="eyebrow">Subtotal</div>
                <span className="small">Your running grocery tab</span>
              </div>
              <b style={{ fontFamily: 'var(--display)', fontSize: 28 }}>{dollars(subtotal)}</b>
            </div>
          )}
          {board.length > 0 && (
            <button
              className="pill soft sm"
              style={{ marginTop: 12, alignSelf: 'flex-start' }}
              onClick={() => {
                let next = list
                board.forEach(card => {
                  next = withCartItem(next, 'Ingredients for ' + card.n, 'your meal inspiration board', P)
                })
                setList(next)
              }}
            >
              Add ingredients from my board ({board.length})
            </button>
          )}
          <form
            style={{ display: 'flex', gap: 8, marginTop: 14 }}
            onSubmit={e => {
              e.preventDefault()
              const input = e.currentTarget.elements.namedItem('ki') as HTMLInputElement
              const value = input.value.trim()
              if (!value) return
              setList(withCartItem(list, value, 'you', P))
              input.value = ''
            }}
          >
            <input className="field" name="ki" placeholder="Add an item, like bananas" autoComplete="off" aria-label="Add a grocery item" style={{ flex: 1 }} />
            <button className="pill soft">Add</button>
          </form>
        </div>
        <div className="composer" style={{ flexDirection: 'column', gap: 8 }}>
          {cartMode === 'online' ? (
            <>
              <a className="pill primary" href="https://www.instacart.com/" target="_blank" rel="noopener" style={{ justifyContent: 'center', height: 52, fontSize: 16 }}>Order groceries with Instacart</a>
              <span className="small center">Opens Instacart. Your list stays here so you can copy it over.</span>
            </>
          ) : (
            <span className="small center">{done} of {list.length} in your basket · subtotal {dollars(subtotal)} at {store}</span>
          )}
        </div>
      </div>
    </div>
  )
}
