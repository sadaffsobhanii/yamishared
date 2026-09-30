import { SafetyNote, Screen, TabBar, type TabId } from '../components/ui'
import type { Profile } from '../types'

const COMING = [
  'An optional chat that explains a recommendation in plain language',
  'Apple Health, a fitness tracker, or a blood-glucose monitor — only if you connect one later',
  'Reminders based on your calendar, routine, or location',
  'Specialized settings for prediabetes and GLP-1 users',
  'Grocery delivery, store comparisons, and price comparisons',
]

export function ProfileScreen({
  profile,
  onChange,
  onTab,
}: {
  profile: Profile
  onChange: (patch: Partial<Profile>) => void
  onTab: (tab: TabId) => void
}) {
  return (
    <Screen className="profile" footer={<TabBar current="profile" onChange={onTab} />}>
      <h1>You</h1>
      <p className="sub">Yami is built around your life — not one strict diet.</p>

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
        <p className="for-line">These stay out of the main flow until they exist.</p>
      </section>
      <SafetyNote />
    </Screen>
  )
}
