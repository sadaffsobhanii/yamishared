import { useId, type ReactNode } from 'react'
import { EMO } from '../data/emo'
import { SPARKLE } from '../data/sparkle'

export type BunnyMood = 'happy' | 'curious' | 'sleepy' | 'proud' | 'wink'

export function Emoji({ k, size = 28 }: { k: string; size?: number }) {
  return <img className="emo" src={k === 'sparkle' ? SPARKLE : (EMO[k] || '')} width={size} height={size} alt="" />
}

export function Bunny({ mood = 'happy', size = 60, hat = true }: { mood?: BunnyMood; size?: number; hat?: boolean }) {
  const gid = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 200 220" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2=".6" y2="1">
          <stop offset="0" stopColor="#C9B6F2" />
          <stop offset="1" stopColor="#9C7FE0" />
        </linearGradient>
      </defs>
      <path d="M84 72C86 30 72 4 54 6c-18 3 -14 40 12 70z" fill={`url(#${gid})`} />
      <path d="M78 68C78 36 68 18 58 20c-10 2 -8 30 12 50z" fill="#FFE08A" />
      <path d="M116 72C114 30 128 4 146 6c18 3 14 40-12 70z" fill={`url(#${gid})`} />
      <path d="M122 68C122 36 132 18 142 20c10 2 8 30-12 50z" fill="#FFE08A" />
      <path d="M100 60c48 0 72 34 72 74 0 42-30 68-72 68s-72-26-72-68c0-40 24-74 72-74z" fill={`url(#${gid})`} />
      <ellipse cx="100" cy="176" rx="36" ry="24" fill="#FFF8E7" />
      <ellipse cx="100" cy="148" rx="20" ry="13" fill="#FFF8E7" />
      <ellipse cx="58" cy="148" rx="11" ry="7" fill="#F6A6B8" opacity=".6" />
      <ellipse cx="142" cy="148" rx="11" ry="7" fill="#F6A6B8" opacity=".6" />
      <Eyes mood={mood} />
      <path d="M95 140q5 5 10 0q-5 -4 -10 0z" fill="#F28FA5" />
      <Mouth mood={mood} />
      {mood === 'proud' && (
        <>
          <path d="M28 104l3 -8 3 8 8 3 -8 3 -3 8 -3 -8 -8 -3z" fill="#F2C230" />
          <path d="M170 100l2.5 -6 2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5z" fill="#F2C230" />
        </>
      )}
      {mood === 'sleepy' && (
        <text x="148" y="70" fontFamily="Nunito" fontWeight="800" fontSize="20" fill="#9C7FE0">z</text>
      )}
      {hat && (
        <g>
          <rect x="66" y="58" width="68" height="20" rx="5" fill="#FFFFFF" stroke="#E2D9F1" strokeWidth="2" />
          <path d="M68 60c-16-4-18-30 2-32 4-16 26-20 34-6 10-12 32-6 30 10 18 2 16 28 0 28z" fill="#FFFFFF" stroke="#E2D9F1" strokeWidth="2" />
          <path d="M86 46v12M100 42v16M114 46v12" stroke="#E2D9F1" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}

export function RollingYami({ mood = 'happy', size = 84, direction = 1, wave = false, still = false }: { mood?: BunnyMood; size?: number; direction?: 1 | -1; wave?: boolean; still?: boolean }) {
  return (
    <div className={`puff-stage${still ? ' still' : ''}`} style={{ ['--puff' as string]: `${size}px`, height: still ? size : size + 34 }}>
      <div className={`puff-mover${direction < 0 ? ' back' : ''}`}>
        <i className="puff-shadow" />
        <div className="puff-spin">
          <Puffball mood={mood} size={size} wave={wave} />
        </div>
      </div>
    </div>
  )
}

function Puffball({ mood, size, wave = false }: { mood: BunnyMood; size: number; wave?: boolean }) {
  const gid = useId().replace(/:/g, '')
  const eyeY = mood === 'curious' ? 100 : 104
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id={gid} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#D9C8F8" />
          <stop offset="1" stopColor="#8C6BCF" />
        </radialGradient>
      </defs>
      <ellipse cx="64" cy="52" rx="18" ry="28" fill={`url(#${gid})`} transform="rotate(-16 64 52)" />
      <ellipse cx="136" cy="52" rx="18" ry="28" fill={`url(#${gid})`} transform="rotate(16 136 52)" />
      <ellipse cx="64" cy="58" rx="9" ry="16" fill="#FFE08A" transform="rotate(-16 64 58)" />
      <ellipse cx="136" cy="58" rx="9" ry="16" fill="#FFE08A" transform="rotate(16 136 58)" />
      <circle cx="100" cy="108" r="76" fill={`url(#${gid})`} />
      <ellipse cx="100" cy="126" rx="34" ry="24" fill="#FFF8E7" />
      <ellipse cx="70" cy="118" rx="11" ry="7" fill="#F6A6B8" opacity=".8" />
      <ellipse cx="130" cy="118" rx="11" ry="7" fill="#F6A6B8" opacity=".8" />
      {mood === 'sleepy' || mood === 'proud' ? (
        <>
          <path d="M62 104 q16 12 30 0" fill="none" stroke="#2A2238" strokeWidth="5" strokeLinecap="round" />
          <path d="M108 104 q16 12 30 0" fill="none" stroke="#2A2238" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : mood === 'wink' ? (
        <>
          <Eye cx={78} cy={eyeY} />
          <path d="M108 104 q16 10 28 0" fill="none" stroke="#2A2238" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Eye cx={78} cy={eyeY} />
          <Eye cx={122} cy={eyeY} />
        </>
      )}
      {wave && (
        <g className="yami-paw">
          <ellipse cx="168" cy="86" rx="13" ry="20" fill="#B9A0E8" transform="rotate(18 168 86)" />
          <circle cx="158" cy="66" r="5.5" fill="#FFF8E7" />
          <circle cx="167" cy="60" r="5.5" fill="#FFF8E7" />
          <circle cx="176" cy="66" r="5.5" fill="#FFF8E7" />
        </g>
      )}
      <ellipse cx="100" cy="124" rx="6" ry="4.5" fill="#F28FA5" />
      {mood === 'curious'
        ? <ellipse cx="100" cy="136" rx="4.5" ry="5.5" fill="#2A2238" />
        : mood === 'proud'
          ? <path d="M90 130 q10 12 20 0z" fill="#2A2238" />
          : <path d="M90 132 q10 8 20 0" fill="none" stroke="#2A2238" strokeWidth="3.5" strokeLinecap="round" />}
    </svg>
  )
}

function Eye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx="15" ry="17" fill="#3A2D55" />
      <ellipse cx={cx} cy={cy + 3} rx="10" ry="11" fill="#6A4BB0" />
      <ellipse cx={cx} cy={cy + 2} rx="6" ry="7" fill="#2A2238" />
      <circle cx={cx + 5} cy={cy - 6} r="5" fill="#fff" />
      <circle cx={cx - 5} cy={cy + 6} r="2.2" fill="#fff" />
    </>
  )
}

function Closed({ cx, up }: { cx: number; up: boolean }) {
  return <path d={`M${cx - 9} 130q9 ${up ? -10 : 7} 18 0`} stroke="#2A2238" strokeWidth="4.5" fill="none" strokeLinecap="round" />
}

function Eyes({ mood }: { mood: BunnyMood }) {
  if (mood === 'sleepy') return <><Closed cx={80} up={false} /><Closed cx={120} up={false} /></>
  if (mood === 'proud') return <><Closed cx={80} up /><Closed cx={120} up /></>
  if (mood === 'wink') return <><Eye cx={78} cy={124} /><Closed cx={122} up /></>
  if (mood === 'curious') return <><Eye cx={78} cy={122} /><Eye cx={122} cy={122} /></>
  return <><Eye cx={78} cy={124} /><Eye cx={122} cy={124} /></>
}

function Mouth({ mood }: { mood: BunnyMood }) {
  const mouths: Record<BunnyMood, ReactNode> = {
    happy: <path d="M92 150q8 7 16 0" stroke="#2A2238" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    curious: <ellipse cx="100" cy="153" rx="4.5" ry="5.5" fill="#2A2238" />,
    sleepy: <path d="M95 151q5 3 10 0" stroke="#2A2238" strokeWidth="3" fill="none" strokeLinecap="round" />,
    proud: <path d="M90 147q10 12 20 0z" fill="#2A2238" />,
    wink: <path d="M92 150q8 7 16 0" stroke="#2A2238" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
  }
  return mouths[mood]
}
