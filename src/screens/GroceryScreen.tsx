import { useRef, useState } from 'react'
import { formatPrice, matchProduct, orderUrl, productSearchUrl, resolveStore } from '../data/brands'
import { budgetHint } from '../data/grocery'
import { PrimaryButton, Screen, TabBar, type TabId } from '../components/ui'
import type { GroceryItem, Profile } from '../types'

export function GroceryScreen({
  profile,
  items,
  instacartConnected,
  listMode,
  listOnly,
  onListMode,
  onChange,
  onToggleInstacart,
  onBack,
  onTab,
}: {
  profile: Profile
  items: GroceryItem[]
  instacartConnected: boolean
  listMode: 'in-store' | 'online'
  listOnly: boolean
  onListMode: (mode: 'in-store' | 'online') => void
  onChange: (items: GroceryItem[]) => void
  onToggleInstacart: () => void
  onBack: () => void
  onTab: (tab: TabId) => void
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const addLock = useRef(false)
  const store = resolveStore(profile)
  const total = items.reduce((sum, item) => sum + (matchProduct(item.text)?.price ?? 0), 0)
  const destination = orderUrl(profile, instacartConnected)

  function addItem() {
    if (addLock.current) return
    addLock.current = true
    const text = draft.trim()
    if (!text) {
      setAdding(false)
      setDraft('')
      return
    }
    onChange([...items, { id: crypto.randomUUID(), text: text.slice(0, 80), done: false, fromMeal: false }])
    setDraft('')
    setAdding(false)
  }

  function orderNow() {
    if (!destination) return
    window.open(destination, '_blank', 'noopener,noreferrer')
  }

  return (
    <Screen
      className="grocery"
      onBack={onBack}
      footer={
        listOnly ? (
          <TabBar current="grocery" onChange={onTab} />
        ) : (
          <div className="order-footer">
            <button
              type="button"
              className={instacartConnected ? 'instacart connected' : 'instacart'}
              onClick={onToggleInstacart}
            >
              {instacartConnected ? '✓ Connected to Instacart' : 'Connect to Instacart'}
            </button>
            <p className="estimate-note">
              This Instacart button is a preview on this device. Nothing is connected to a real account.
              {listMode === 'online' ? ' Order online opens that preview, or your store if you have not connected it.' : ' In-store keeps this as a shopping list.'}
            </p>
            <div className="estimate">
              <span>Estimated total</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <p className="estimate-note">My prices, not the register — they wander a little.</p>
            <PrimaryButton onClick={orderNow} disabled={!destination || items.length === 0}>
              Order Now
            </PrimaryButton>
            {!destination ? (
              <p className="estimate-note">Tell me a store I know, or connect Instacart, and I can take you there.</p>
            ) : null}
            <TabBar current="grocery" onChange={onTab} />
          </div>
        )
      }
    >
      <h1>Your grocery list</h1>
      {items.length > 0 ? (
        <p className="sub">I've started it off with a few things that'll make next week a little easier. 🛒</p>
      ) : (
        <p className="sub">Your list is empty — swaps you add from a result will land here.</p>
      )}
      {!listOnly && (
        <div className="mode-toggle" role="group" aria-label="List type">
          <button type="button" className={listMode === 'in-store' ? 'chip selected' : 'chip'} onClick={() => onListMode('in-store')}>
            In-store list
          </button>
          <button type="button" className={listMode === 'online' ? 'chip selected' : 'chip'} onClick={() => onListMode('online')}>
            Order online
          </button>
        </div>
      )}

      {items.length > 0 && (
        <ul className="grocery-list">
          {items.map((item) => {
            const product = matchProduct(item.text)
            const href = product ? productSearchUrl(profile, product.brandName) : null
            return (
              <li key={item.id} className={item.done ? 'grocery-card done' : 'grocery-card'}>
                <button
                  type="button"
                  className="check"
                  role="checkbox"
                  aria-checked={item.done}
                  aria-label={item.done ? `Mark ${item.text} as still needed` : `Mark ${item.text} as picked up`}
                  onClick={() =>
                    onChange(items.map((entry) => (entry.id === item.id ? { ...entry, done: !entry.done } : entry)))
                  }
                >
                  {item.done ? '✓' : ''}
                </button>
                <div className="grocery-copy">
                  {product ? (
                    <>
                      <p className="grocery-text">{product.brandName}</p>
                      {item.fromMeal ? <p className="pill">From a meal idea</p> : null}
                      <p className="price">{formatPrice(product.price)}</p>
                      <p className="for-line">for {product.generic}</p>
                      {budgetHint(item.text, profile) ? <p className="for-line">{budgetHint(item.text, profile)}</p> : null}
                      {href ? (
                        <a className="find-link" href={href} target="_blank" rel="noreferrer">
                          Find it at {store.label}
                        </a>
                      ) : (
                        <p className="for-line">I don't have a link for {store.label} yet, so I won't guess one.</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="grocery-text">{item.text}</p>
                      {item.fromMeal ? <p className="pill">From a meal idea</p> : null}
                      {budgetHint(item.text, profile) ? <p className="for-line">{budgetHint(item.text, profile)}</p> : null}
                    </>
                  )}
                </div>
                <button
                  type="button"
                  className="remove"
                  aria-label={`Remove ${item.text}`}
                  onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {adding ? (
        <form
          className="add-form"
          onSubmit={(event) => {
            event.preventDefault()
            addItem()
          }}
        >
          <input
            className="field"
            autoFocus
            value={draft}
            maxLength={80}
            placeholder="Something for the week"
            onChange={(event) => setDraft(event.target.value)}
            onBlur={addItem}
          />
        </form>
      ) : (
        <button
          type="button"
          className="add-row"
          onClick={() => {
            addLock.current = false
            setAdding(true)
          }}
        >
          + Add an item
        </button>
      )}

      </Screen>
  )
}
