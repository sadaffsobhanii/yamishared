import { useState } from 'react'
import { SAMPLES } from '../data/meals'
import type { MealImage } from '../types'

const FALLBACK: Record<string, string> = {
  eggs: '#F6E2C4',
  smoothie: '#E4F0D4',
  pasta: '#F8E6C8',
  salad: '#E3F2D8',
  soup: '#F8E0D2',
  other: '#EEE6F7',
}

export function MealVisual({ image, alt }: { image: MealImage; alt: string }) {
  const [failed, setFailed] = useState(false)
  const src = image.kind === 'photo' ? image.src : image.kind === 'sample' ? SAMPLES.find((sample) => sample.id === image.id)?.src : undefined
  const tint = image.kind === 'sample' ? FALLBACK[image.id] : '#EEE6F7'

  if (!src || failed) {
    return <div className="meal-fallback" style={{ background: tint }} aria-label={alt} />
  }

  return <img className="meal-img" src={src} alt={alt} onError={() => setFailed(true)} />
}
