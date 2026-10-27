import { useId } from 'react'
import type { YamiCharacter, YamiMood, YamiOutfit } from '../types'

const MOOD_LABEL: Record<YamiMood, string> = {
  awake: 'awake',
  sleepy: 'sleepy-eyed',
  drowsy: 'almost sleepy',
}

const CHARACTER_LABEL: Record<YamiCharacter, string> = {
  bunny: 'Bunny',
  chick: 'Sunny',
  moon: 'Mochi',
}

type Palette = {
  light: string
  mid: string
  deep: string
  ear: string
  inner: string
  lid: string
}

const PALETTE: Record<YamiCharacter, Palette> = {
  bunny: { light: '#FAE8E5', mid: '#E4B1AB', deep: '#B48ADF', ear: '#C9A4E8', inner: '#F6E7A8', lid: '#E4B3AD' },
  chick: { light: '#FFF6D0', mid: '#FFE08A', deep: '#F5C542', ear: '#F5C542', inner: '#FFF3C4', lid: '#FFE7A8' },
  moon: { light: '#FCF4F2', mid: '#EED3CF', deep: '#A99BE0', ear: '#C8BDF0', inner: '#FCF7F5', lid: '#ECD1CC' },
}

export function Yami({
  mood = 'awake',
  character = 'bunny',
  outfit = 'none',
  className = '',
}: {
  mood?: YamiMood
  character?: YamiCharacter
  outfit?: YamiOutfit
  className?: string
}) {
  const rawId = useId().replace(/:/g, '')
  const gradientId = `yami-body-${rawId}`
  const palette = PALETTE[character]
  const worn = outfit === 'none' ? '' : `, wearing a ${outfit === 'scarf' ? 'fall scarf' : outfit === 'bow' ? 'lilac bow' : outfit === 'flower' ? 'flower crown' : 'night cap'}`

  return (
    <div className={`yami ${className}`}>
      <svg viewBox="0 0 200 214" role="img" aria-label={`${CHARACTER_LABEL[character]}, ${MOOD_LABEL[mood]}${worn}`}>
        <defs>
          <radialGradient id={gradientId} cx="38%" cy="34%" r="68%">
            <stop offset="0%" stopColor={palette.light} />
            <stop offset="42%" stopColor={palette.mid} />
            <stop offset="100%" stopColor={palette.deep} />
          </radialGradient>
        </defs>

        <ellipse cx="100" cy="204" rx="46" ry="7" fill="#6C4AA0" opacity="0.12" />
        <Ears character={character} palette={palette} />
        {outfit === 'flower' && <FlowerCrown />}

        <circle cx="100" cy="122" r="74" fill={`url(#${gradientId})`} />
        <ellipse cx="78" cy="100" rx="24" ry="14" fill="#FFFFFF" opacity="0.28" />
        {character !== 'chick' && <ellipse cx="100" cy="150" rx="34" ry="26" fill="#F7F1E6" />}
        <ellipse cx="62" cy="136" rx="13" ry="8" fill="#F4B6C8" opacity="0.95" />
        <ellipse cx="138" cy="136" rx="13" ry="8" fill="#F4B6C8" opacity="0.95" />

        {mood === 'awake' && <AwakeEyes />}
        {mood === 'sleepy' && <SleepyEyes />}
        {mood === 'drowsy' && <DrowsyEyes lid={palette.lid} />}

        {character === 'chick' ? (
          <path d="M90 146 L100 160 L110 146 Z" fill="#F08A2A" />
        ) : (
          <path
            d={mood === 'awake' ? 'M86 156 Q100 170 114 156' : 'M90 158 Q100 166 110 158'}
            fill="none"
            stroke="#2B1414"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        )}

        {outfit === 'bow' && <Bow />}
        {outfit === 'scarf' && <Scarf />}
        {outfit === 'cap' && <NightCap />}
      </svg>
      <div className="yami-ground" aria-hidden="true" />
    </div>
  )
}

function Ears({ character, palette }: { character: YamiCharacter; palette: Palette }) {
  if (character === 'chick') {
    return (
      <g>
        <ellipse cx="78" cy="52" rx="11" ry="18" fill={palette.ear} transform="rotate(-18 78 52)" />
        <ellipse cx="122" cy="52" rx="11" ry="18" fill={palette.ear} transform="rotate(18 122 52)" />
      </g>
    )
  }
  if (character === 'moon') {
    return (
      <g>
        <ellipse cx="72" cy="62" rx="16" ry="22" fill={palette.ear} />
        <ellipse cx="72" cy="64" rx="8" ry="12" fill={palette.inner} />
        <ellipse cx="128" cy="62" rx="16" ry="22" fill={palette.ear} />
        <ellipse cx="128" cy="64" rx="8" ry="12" fill={palette.inner} />
        <path d="M150 46 a12 12 0 1 0 0 24 a7 7 0 1 1 0 -24" fill="#F6E7A8" />
      </g>
    )
  }
  return (
    <g>
      <ellipse cx="66" cy="62" rx="20" ry="40" fill={palette.ear} transform="rotate(-14 66 62)" />
      <ellipse cx="66" cy="66" rx="10" ry="26" fill={palette.inner} transform="rotate(-14 66 66)" />
      <ellipse cx="134" cy="62" rx="20" ry="40" fill={palette.ear} transform="rotate(14 134 62)" />
      <ellipse cx="134" cy="66" rx="10" ry="26" fill={palette.inner} transform="rotate(14 134 66)" />
    </g>
  )
}

function AwakeEyes() {
  return (
    <g>
      <ellipse cx="74" cy="118" rx="16" ry="20" fill="#2B1414" />
      <ellipse cx="126" cy="118" rx="16" ry="20" fill="#2B1414" />
      <ellipse cx="70" cy="110" rx="5" ry="6.5" fill="#FFFFFF" />
      <ellipse cx="122" cy="110" rx="5" ry="6.5" fill="#FFFFFF" />
      <circle cx="80" cy="124" r="2.4" fill="#FFFFFF" opacity="0.75" />
      <circle cx="132" cy="124" r="2.4" fill="#FFFFFF" opacity="0.75" />
    </g>
  )
}

function SleepyEyes() {
  return (
    <g>
      <path d="M58 120 Q74 132 90 120" fill="none" stroke="#2B1414" strokeWidth="4" strokeLinecap="round" />
      <path d="M110 120 Q126 132 142 120" fill="none" stroke="#2B1414" strokeWidth="4" strokeLinecap="round" />
      <g fill="#8E6BB5" fontFamily="Nunito, sans-serif" fontWeight="800">
        <text x="158" y="58" fontSize="16">
          z
        </text>
        <text x="170" y="44" fontSize="12">
          z
        </text>
      </g>
    </g>
  )
}

function DrowsyEyes({ lid }: { lid: string }) {
  return (
    <g>
      <ellipse cx="74" cy="124" rx="15" ry="12" fill="#2B1414" />
      <ellipse cx="126" cy="124" rx="15" ry="12" fill="#2B1414" />
      <ellipse cx="70" cy="120" rx="4" ry="4" fill="#FFFFFF" />
      <ellipse cx="122" cy="120" rx="4" ry="4" fill="#FFFFFF" />
      <path d="M58 118 Q74 104 90 118 Q74 114 58 118" fill={lid} />
      <path d="M110 118 Q126 104 142 118 Q126 114 110 118" fill={lid} />
    </g>
  )
}

function Scarf() {
  return (
    <g>
      <path d="M68 172 Q100 202 132 172 Q118 188 100 186 Q82 188 68 172" fill="#E07A3D" />
      <path d="M116 180 C124 206 138 208 142 196" fill="none" stroke="#E07A3D" strokeWidth="11" strokeLinecap="round" />
      <path d="M120 186 C126 202 136 204 140 196" fill="none" stroke="#F6E7A8" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  )
}

function Bow() {
  return (
    <g>
      <ellipse cx="46" cy="78" rx="12" ry="8" fill="#F4B6C8" transform="rotate(-20 46 78)" />
      <ellipse cx="62" cy="74" rx="12" ry="8" fill="#F7C9D6" transform="rotate(16 62 74)" />
      <circle cx="54" cy="76" r="4" fill="#E89AB4" />
    </g>
  )
}

function FlowerCrown() {
  return (
    <g>
      <Flower cx={78} cy={58} petal="#F7C1D4" />
      <Flower cx={100} cy={48} petal="#F6E7A8" />
      <Flower cx={124} cy={58} petal="#F7C1D4" />
      <path d="M86 62 Q100 70 116 62" fill="none" stroke="#8FBF6A" strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

function Flower({ cx, cy, petal }: { cx: number; cy: number; petal: string }) {
  return (
    <g>
      <circle cx={cx - 6} cy={cy} r="5" fill={petal} />
      <circle cx={cx + 6} cy={cy} r="5" fill={petal} />
      <circle cx={cx} cy={cy - 6} r="5" fill={petal} />
      <circle cx={cx} cy={cy + 5} r="5" fill={petal} />
      <circle cx={cx} cy={cy} r="3.5" fill="#F08A2A" />
    </g>
  )
}

function NightCap() {
  return (
    <g>
      <path d="M88 82 Q110 16 164 46 Q174 60 152 72 Q122 46 94 86 Z" fill="#4C3D86" />
      <circle cx="166" cy="44" r="9" fill="#F6E7A8" />
    </g>
  )
}
