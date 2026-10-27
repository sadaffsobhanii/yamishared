import { Bunny, Emoji } from './Bunny'
import { useYami } from './store'

export function Weekly() {
  const { weekly, setWeekly, meals, go } = useYami()
  if (weekly == null) return null
  const sample = meals.length < 3
  const count = Math.max(meals.length, 12)
  const cards = [
    { big: String(count), say: 'meals logged this week', mood: 'happy' as const },
    { big: 'burrito', say: 'Your top meal: the burrito bowl. You had it 3 times.', mood: 'wink' as const, emoji: true },
    { big: '4 of 7', say: 'days you hit your protein goal', mood: 'proud' as const },
    { big: '2', say: 'new foods tried. Small wins count.', mood: 'happy' as const },
        { big: '', say: 'Ready for next week? Order something that fits your goals.', mood: 'curious' as const, end: true },
  ]
  const card = cards[weekly] ?? cards[0]
  return (
    <div
      className="story"
      onClick={() => {
        if (!card.end) setWeekly(weekly + 1)
      }}
    >
      <div className="bars">{cards.map((_, i) => <i key={i} className={i <= weekly ? 'on' : ''} />)}</div>
      <button className="close" onClick={e => { e.stopPropagation(); setWeekly(null) }}>Close</button>
      <div className="body">
        <div className="eyebrow" style={{ color: '#FFE08A' }}>Yami Weekly{sample ? ' · sample week' : ''}</div>
        <Bunny mood={card.mood} size={90} />
        {card.big !== '' && (
          <div className="huge">{card.emoji ? <Emoji k="burrito" size={96} /> : card.big}</div>
        )}
        <div className="say">{card.say}</div>
        {card.end ? (
          <button
            className="pill"
            style={{ background: '#FFE08A', color: 'var(--ink)', marginTop: 8 }}
            onClick={e => {
              e.stopPropagation()
              setWeekly(null)
              go('order')
            }}
          >
            Order Smart
          </button>
        ) : (
          <div className="small" style={{ color: '#E2CBC6' }}>Tap to continue</div>
        )}
      </div>
    </div>
  )
}
