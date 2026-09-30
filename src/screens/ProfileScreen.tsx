import { SafetyNote, Screen, TabBar, type TabId } from '../components/ui'
import { PACES } from '../data/listen'
import { SOURCES } from '../data/meals'
import { VARIANT_OPTIONS } from '../data/variants'
import type { Profile, Variants } from '../types'

const COMING = [
  'An optional chat that explains a recommendation in plain language',
  'Apple Health, a fitness tracker, or a blood-glucose monitor — only if you connect one later',
  'Smarter reminders based on your calendar, routine, or location',
  'Specialized settings for prediabetes and GLP-1 users',
  'Grocery delivery, store comparisons, and price comparisons',
]

export function ProfileScreen({
  profile,
  variants,
  onChange,
  onVariants,
  onTab,
}: {
  profile: Profile
  variants: Variants
  onChange: (patch: Partial<Profile>) => void
  onVariants: (variants: Variants) => void
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
        <h2>Pace</h2>
        <div className="chips">
          {PACES.map((pace) => (
            <button
              key={pace.id}
              type="button"
              className={profile.pace === pace.id ? 'chip selected' : 'chip'}
              aria-pressed={profile.pace === pace.id}
              onClick={() => onChange({ pace: pace.id })}
            >
              {pace.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Reminders</h2>
        <div className="toggles">
          <label className="toggle-row">
            <span>A gentle nudge to log a meal</span>
            <input type="checkbox" checked={profile.reminders} onChange={(event) => onChange({ reminders: event.target.checked })} />
          </label>
          {profile.reminders && (
            <>
              <label className="toggle-row">
                <span>Nudge me at</span>
                <input type="time" value={profile.reminderTime} onChange={(event) => onChange({ reminderTime: event.target.value })} />
              </label>
              <label className="toggle-row">
                <span>Quiet hours from</span>
                <input type="time" value={profile.quietStart} onChange={(event) => onChange({ quietStart: event.target.value })} />
              </label>
              <label className="toggle-row">
                <span>Until</span>
                <input type="time" value={profile.quietEnd} onChange={(event) => onChange({ quietEnd: event.target.value })} />
              </label>
            </>
          )}
        </div>
        <p className="for-line">At most one a day, never during quiet hours. Skipping one is always fine. (Preview only — nothing is sent.)</p>
      </section>

      <section>
        <h2>Where Yami's ideas come from</h2>
        <p className="sub">
          Meal ideas and every “Why?” follow public, evidence-based guidance — not diet trends. Yami never overrides your diet choices or a
          clinician's advice.
        </p>
        <ul className="coming">
          {SOURCES.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
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
      <details className="study">
        <summary>Study settings (for testers)</summary>
        <p className="for-line">Switch between the A/B versions from the PRD's test plan. The link in the address bar keeps your choice, so you can share it.</p>
        {VARIANT_OPTIONS.map((group) => (
          <div key={group.key} className="study-group">
            <p className="swap-kicker">{group.label}</p>
            <div className="chips">
              {group.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={variants[group.key] === option.id ? 'chip selected' : 'chip'}
                  aria-pressed={variants[group.key] === option.id}
                  onClick={() => onVariants({ ...variants, [group.key]: option.id })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="for-line">The onboarding version applies the next time someone starts fresh (reload the page).</p>
      </details>
      <SafetyNote />
    </Screen>
  )
}
