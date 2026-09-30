import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Getting to know you"
    >
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="back" onClick={onClick} aria-label="Back">
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M10.5 3 L5 8 L10.5 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export function PrimaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button type="button" className="btn-primary" {...props}>
      {children}
    </button>
  )
}

export function Screen({
  children,
  footer,
  progress,
  onBack,
  corner,
  className = '',
}: {
  children: ReactNode
  footer?: ReactNode
  progress?: number
  onBack?: () => void
  corner?: ReactNode
  className?: string
}) {
  const showTop = progress != null || onBack || corner
  return (
    <div className={`screen ${className}`}>
      {showTop && (
        <div className="screen-top">
          {progress != null ? <ProgressBar value={progress} /> : <div className="progress-spacer" />}
          <div className="screen-nav">
            {onBack ? <BackButton onClick={onBack} /> : <span className="back-spacer" />}
            {corner}
          </div>
        </div>
      )}
      <div className="screen-body">{children}</div>
      {footer ? <div className="screen-footer">{footer}</div> : null}
    </div>
  )
}

export function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 7.5 L9.2 5.5 H14.8 L16 7.5 H19 A2 2 0 0 1 21 9.5 V17 A2 2 0 0 1 19 19 H5 A2 2 0 0 1 3 17 V9.5 A2 2 0 0 1 5 7.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 6 H7 L9 16 H18 L20 8 H8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="19" r="1.3" fill="currentColor" />
      <circle cx="17" cy="19" r="1.3" fill="currentColor" />
    </svg>
  )
}

export type TabId = 'home' | 'insights' | 'grocery' | 'profile'

export function TabBar({ current, onChange }: { current: TabId; onChange: (tab: TabId) => void }) {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'insights', label: 'Insights' },
    { id: 'grocery', label: 'Groceries' },
    { id: 'profile', label: 'You' },
  ]
  return (
    <nav className="tabbar" aria-label="Main">
      {tabs.map((tab) => (
        <button key={tab.id} type="button" className={current === tab.id ? 'tab active' : 'tab'} onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

export function SafetyNote() {
  return (
    <p className="safety">
      General wellness guidance, not medical advice. Meal ideas, prices, and any number here are estimates — not an exact or clinical measure.
    </p>
  )
}

export function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M9.2 3.2 L12.8 6.8 L5.5 14.1 H2 V10.6 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}
