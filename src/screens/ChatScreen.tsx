import { useEffect, useRef, useState } from 'react'
import { Yami } from '../components/Yami'
import { Screen, TabBar, type TabId } from '../components/ui'
import type { LoggedMeal, MealResult, Profile } from '../types'

export type ChatBubble = { id: string; from: 'yami' | 'you'; text: string }

function starters(profile: Profile, focus: MealResult | null) {
  if (focus) return ['Why this suggestion?', 'What else could I add?', 'Is there a cheaper swap?']
  const list = ['What should I make for dinner tonight?', 'Easy snack ideas?']
  if (profile.studentBudget || profile.budget) list.push('Cheap groceries for the week?')
  else list.push('How do I meal prep simply?')
  if (profile.widgets.includes('protein') || profile.goals.includes('muscle')) list.push('Easy ways to get more protein?')
  return list
}

export function ChatScreen({
  profile,
  meals,
  focus,
  turns,
  onTurns,
  onTab,
}: {
  profile: Profile
  meals: LoggedMeal[]
  focus: MealResult | null
  turns: ChatBubble[]
  onTurns: (turns: ChatBubble[]) => void
  onTab: (tab: TabId) => void
}) {
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const greeting: ChatBubble = {
    id: 'greeting',
    from: 'yami',
    text: focus
      ? `Happy to talk about this meal — ${focus.items.join(', ').toLowerCase()}. What would you like to know?`
      : `Hi${profile.name ? ` ${profile.name}` : ''}! Ask me anything about meals, groceries, or how you're feeling about food.`,
  }
  const shown = turns.length ? turns : [greeting]

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [shown.length, thinking])

  async function send(text: string) {
    const clean = text.trim()
    if (!clean || thinking) return
    const next = [...shown, { id: crypto.randomUUID(), from: 'you' as const, text: clean }]
    onTurns(next)
    setDraft('')
    setThinking(true)
    let reply: string
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turns: next.map(({ from, text: words }) => ({ from, text: words })),
          profile,
          meals: meals.slice(0, 10).map(({ items, time, suggestion }) => ({ items, time, suggestion })),
          focus: focus ? { items: focus.items, recommendation: focus.recommendation, why: focus.why } : null,
        }),
      })
      if (!response.ok) throw new Error(String(response.status))
      reply = ((await response.json()) as { reply: string }).reply
    } catch {
      reply = "I can't reach my thinking cap right now. Try again in a moment — or snap a meal and I'll share an idea."
    }
    onTurns([...next, { id: crypto.randomUUID(), from: 'yami', text: reply }])
    setThinking(false)
  }

  return (
    <Screen
      className="intake chat"
      footer={
        <div className="chat-footer">
          {turns.length === 0 && (
            <div className="chips chat-starters">
              {starters(profile, focus).map((starter) => (
                <button key={starter} type="button" className="chip" onClick={() => void send(starter)}>
                  {starter}
                </button>
              ))}
            </div>
          )}
          <form
            className="chat-type"
            onSubmit={(event) => {
              event.preventDefault()
              void send(draft)
            }}
          >
            <input className="field" value={draft} placeholder="Ask Yami…" maxLength={400} onChange={(event) => setDraft(event.target.value)} />
            <button type="submit" className="chip selected" disabled={!draft.trim() || thinking}>
              Send
            </button>
          </form>
          <p className="safety chat-safety">General wellness guidance, not medical advice.</p>
          <TabBar current="chat" onChange={onTab} />
        </div>
      }
    >
      <h1>Ask Yami</h1>
      <div className="chat-log" aria-live="polite">
        {shown.map((bubble) => (
          <div key={bubble.id} className={bubble.from === 'yami' ? 'bubble-row yami' : 'bubble-row you'}>
            {bubble.from === 'yami' ? <Yami pose="rest" className="yami-tiny" /> : null}
            <p className="bubble">{bubble.text}</p>
          </div>
        ))}
        {thinking ? (
          <div className="bubble-row yami">
            <Yami pose="rest" className="yami-tiny" />
            <p className="bubble thinking" aria-label="Yami is thinking">
              <span />
              <span />
              <span />
            </p>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>
    </Screen>
  )
}
