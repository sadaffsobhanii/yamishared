import { useState } from 'react'
import { Yami } from '../components/Yami'
import { SafetyNote, Screen, TabBar, type TabId } from '../components/ui'
import { CLOSET, equippedLook, nextUnlock, unlocked, type ClosetItem } from '../data/wardrobe'
import type { LoggedMeal, Profile, YamiCharacter, YamiOutfit } from '../types'

const COMING = [
  'An optional chat that explains a recommendation in plain language',
  'Apple Health, a fitness tracker, or a blood-glucose monitor — only if you connect one later',
  'Reminders based on your calendar, routine, or location',
  'Specialized settings for prediabetes and GLP-1 users',
  'Grocery delivery, store comparisons, and price comparisons',
]

export function ProfileScreen({
  profile,
  meals,
  onChange,
  onTab,
}: {
  profile: Profile
  meals: LoggedMeal[]
  onChange: (patch: Partial<Profile>) => void
  onTab: (tab: TabId) => void
}) {
  const look = equippedLook(profile)
  const coming = nextUnlock(profile.bestStreak)
  const [note, setNote] = useState('')
  const characters = CLOSET.filter((item) => item.kind === 'character')
  const outfits = CLOSET.filter((item) => item.kind === 'outfit')

  function choose(item: ClosetItem) {
    if (!unlocked(profile.bestStreak, item)) {
      setNote(`${item.name} opens with a ${item.streak}-day streak.`)
      return
    }
    setNote('')
    if (item.kind === 'character') onChange({ character: item.id as YamiCharacter })
    else onChange({ outfit: item.id as YamiOutfit })
  }

  return (
    <Screen className="profile" footer={<TabBar current="profile" onChange={onTab} />}>
      <p className="eyebrow">Make it yours</p>
      <h1>Dress Yami</h1>
      <p className="sub">A streak is a meal on back-to-back days. New looks stay yours, even if a day gets skipped later.</p>

      <section className="dresser-stage">
        <Yami mood="awake" character={look.character} outfit={look.outfit} className="yami-lg" />
        <p className="streak-pill">{profile.bestStreak === 0 ? 'No streak yet' : `${profile.bestStreak}-day streak`}</p>
        <p className="sub">
          {profile.bestStreak === 0
            ? 'Log a meal today to begin. The fall scarf is already yours.'
            : coming
              ? `${coming.name} opens at ${coming.streak} days.`
              : 'Every look is open. Dress them however you like.'}
        </p>
        {meals.length === 0 ? <p className="for-line">Nothing logged yet today.</p> : null}
      </section>

      <section>
        <h2>Characters</h2>
        <div className="closet">
          {characters.map((item) => (
            <ClosetCard key={item.id} item={item} streak={profile.bestStreak} selected={look.character === item.id} onChoose={choose} />
          ))}
        </div>
      </section>

      <section>
        <h2>Outfits</h2>
        <div className="closet">
          {outfits.map((item) => (
            <ClosetCard
              key={item.id}
              item={item}
              streak={profile.bestStreak}
              selected={look.outfit === item.id}
              previewCharacter={look.character}
              onChoose={choose}
            />
          ))}
        </div>
        {note ? <p className="for-line">{note}</p> : null}
      </section>

      <section className="swap-card">
        <p className="swap-kicker">Health context, optional</p>
        <p>Share only what you want. Yami will not diagnose you or turn a note into a treatment plan.</p>
        <textarea
          className="field"
          rows={3}
          maxLength={200}
          placeholder="Anything a clinician already suggested"
          value={profile.doctorNote}
          onChange={(event) => onChange({ doctorNote: event.target.value })}
        />
      </section>

      <section>
        <h2>Coming soon</h2>
        <ul className="coming">
          {COMING.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <SafetyNote />
    </Screen>
  )
}

function ClosetCard({
  item,
  streak,
  selected,
  previewCharacter = 'bunny',
  onChoose,
}: {
  item: ClosetItem
  streak: number
  selected: boolean
  previewCharacter?: YamiCharacter
  onChoose: (item: ClosetItem) => void
}) {
  const open = unlocked(streak, item)
  const character = item.kind === 'character' ? (item.id as YamiCharacter) : previewCharacter
  const outfit = item.kind === 'outfit' ? (item.id as YamiOutfit) : 'none'
  return (
    <button type="button" className={selected ? 'closet-card on' : open ? 'closet-card' : 'closet-card locked'} aria-pressed={selected} onClick={() => onChoose(item)}>
      <Yami mood="awake" character={character} outfit={outfit} className="closet-yami" />
      <span>{item.name}</span>
      <span className="lock">{open ? item.note : `${item.streak}-day streak`}</span>
    </button>
  )
}
