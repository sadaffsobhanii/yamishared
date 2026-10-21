import { labelPhoto } from './scan'

// One place for "what's in this photo": Claude when the dev server has a key, the on-device reader otherwise.

export type Size = 'small' | 'regular' | 'large'
export type Spotted = { name: string; usda?: string; grams?: number; size: Size; kind?: string; whole?: boolean }
export type Reading = { meal: string; place: string | null; items: Spotted[]; by: 'claude' | 'device' }

export const SIZE_FACTOR: Record<Size, number> = { small: 0.6, regular: 1, large: 1.5 }

let available: Promise<boolean> | null = null

export function visionAvailable() {
  available ??= fetch('/api/vision')
    .then(response => response.ok)
    .catch(() => false)
  return available
}

// Phone photos are large; a 1024 px JPEG is plenty to read a plate and much faster to send.
async function shrink(src: string, max = 1024) {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not open the photo'))
    image.src = src
  })
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.85)
}

export async function readPhoto(src: string, place: string | null): Promise<Reading> {
  if (await visionAvailable()) {
    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: await shrink(src), place }),
      })
      if (response.ok) {
        const data = (await response.json()) as { food: boolean; meal: string; place: string | null; items: Spotted[] }
        return { meal: data.meal || 'Your meal', place: place ?? data.place, items: data.food ? data.items : [], by: 'claude' }
      }
    } catch {
      // Fall back to the on-device reader below.
    }
  }
  const labeled = await labelPhoto(src)
  return { meal: labeled.name, place, items: labeled.items.map(name => ({ name, size: 'regular' })), by: 'device' }
}
