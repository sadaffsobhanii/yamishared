import { useId } from 'react'

type YamiProps = {
  pose?: 'greeting' | 'rest'
  className?: string
}

export function Yami({ pose = 'rest', className = '' }: YamiProps) {
  const rawId = useId().replace(/:/g, '')
  const gradientId = `yami-body-${rawId}`
  const blurId = `yami-fuzz-${rawId}`
  const greeting = pose === 'greeting'

  return (
    <div className={`yami ${className}`}>
      <svg
        viewBox={greeting ? '0 0 240 236' : '48 70 144 160'}
        role="img"
        aria-label={greeting ? 'Yami, a round yellow plush with arms open for a hug' : 'Yami, a round yellow plush, smiling'}
      >
        <defs>
          <radialGradient id={gradientId} cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#FFF8DC" />
            <stop offset="28%" stopColor="#FFE9A3" />
            <stop offset="62%" stopColor="#F7CD5A" />
            <stop offset="100%" stopColor="#E3A92B" />
          </radialGradient>
          <filter id={blurId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        <ellipse cx="120" cy="214" rx="36" ry="7" fill="#6C4AA0" opacity="0.10" />

        {greeting && (
          <g>
            <path
              d="M64 112 C18 100 10 58 48 44"
              fill="none"
              stroke="#FBDD7E"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <path
              d="M176 112 C222 100 230 58 192 44"
              fill="none"
              stroke="#FBDD7E"
              strokeWidth="26"
              strokeLinecap="round"
            />
          </g>
        )}

        <circle cx="100" cy="196" r="16" fill="#EDB63C" />
        <circle cx="140" cy="196" r="16" fill="#E2A92E" />

        <circle cx="120" cy="132" r="76" fill="#F8D66E" opacity="0.45" filter={`url(#${blurId})`} />
        <circle cx="120" cy="130" r="72" fill={`url(#${gradientId})`} />
        <ellipse cx="96" cy="104" rx="26" ry="16" fill="#FFFFFF" opacity="0.38" />

        {greeting && (
          <g>
            <circle cx="46" cy="36" r="16" fill="#FFE9A3" />
            <circle cx="40" cy="30" r="5" fill="#FFFFFF" opacity="0.45" />
            <circle cx="194" cy="36" r="16" fill="#FFE9A3" />
            <circle cx="188" cy="30" r="5" fill="#FFFFFF" opacity="0.45" />
          </g>
        )}

        <path d="M86 116 Q102 130 118 116" fill="none" stroke="#2A2140" strokeWidth="4" strokeLinecap="round" />
        <path d="M122 116 Q138 130 154 116" fill="none" stroke="#2A2140" strokeWidth="4" strokeLinecap="round" />
        <circle cx="74" cy="136" r="13" fill="#F4B6C8" />
        <circle cx="166" cy="136" r="13" fill="#F4B6C8" />
        <path d="M100 146 Q120 162 140 146" fill="none" stroke="#2A2140" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <div className="yami-ground" aria-hidden="true" />
    </div>
  )
}
