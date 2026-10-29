import { normalizeReading } from '../../server/reading'
import { MEAL_PROMPT } from './mealPrompt'
import { PLACES } from './places'
import { labelPhoto } from './scan'

// One place for "what's in this photo": Claude when the dev server has a key, Claude through the viewer's own
// account when the app runs as a shared Claude link, and the on-device reader otherwise.

export type Size = 'small' | 'regular' | 'large'
export type Spotted = { name: string; usda?: string; grams?: number; size: Size; kind?: string; whole?: boolean }
export type Reading = { meal: string; place: string | null; items: Spotted[]; by: 'claude' | 'device'; why?: string }

export const SIZE_FACTOR: Record<Size, number> = { small: 0.6, regular: 1, large: 1.5 }

// Why Yami is not using Claude, in words a person can act on. Shown on screen so a fallback is never silent.
export type VisionStatus = { ok: boolean; why?: string }

let available: Promise<VisionStatus> | null = null

export function visionStatus() {
  available ??= fetch('/api/vision')
    .then((response): VisionStatus => {
      if (response.ok) return { ok: true }
      if (response.status === 503) return { ok: false, why: 'no ANTHROPIC_API_KEY found on the dev server (add it to .env.local and restart)' }
      return { ok: false, why: 'the photo server is not running here. Open the app with npm run dev, not the shared link or the HTML file' }
    })
    .catch((): VisionStatus => ({ ok: false, why: 'the photo server is not running here. Open the app with npm run dev, not the shared link or the HTML file' }))
  return available
}

export function visionAvailable() {
  return visionStatus().then(status => status.ok)
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

// Inside a Claude artifact the page can ask Claude itself (the `sample` capability), on the viewer's own account.
// The artifact must be published with capabilities {sample: {images: true}}, or images are refused.
type SampleJson = { json: (input: string, options: { images: Blob; modelTier: 'default' }) => Promise<unknown> }
type ArtifactRuntime = { use: (name: string) => Promise<unknown> }

let sampler: Promise<SampleJson | null> | null = null

function artifactClaude() {
  sampler ??= (async () => {
    const runtime = (window as unknown as { claude?: ArtifactRuntime }).claude
    if (!runtime) return null
    try {
      return ((await runtime.use('sample')) as SampleJson | null) ?? null
    } catch {
      return null
    }
  })()
  return sampler
}

function dataUrlToBlob(dataUrl: string) {
  const [head, data] = dataUrl.split(',')
  const type = /data:([^;]+)/.exec(head)?.[1] ?? 'image/jpeg'
  const bytes = atob(data)
  const buffer = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i)
  return new Blob([buffer], { type })
}

const ARTIFACT_FORMAT = `Reply with only one JSON object, no other text:
{"food": boolean, "meal": string, "place": one of ${JSON.stringify(PLACES.map(p => p.id))} or null, "items": [{"name": string, "usda": string, "grams": number, "size": "small" | "regular" | "large", "kind": "vegetable" | "fruit" | "plant protein" | "animal protein" | "dairy" | "whole grain" | "refined grain" | "fat" | "sweet" | "drink" | "other", "whole": boolean}]}`

// Error codes from the artifact runtime that mean "this view can't use Claude": fall back quietly with a reason.
const ARTIFACT_WHY: Record<string, string> = {
  not_granted: 'you did not allow this page to use Claude',
  images_unavailable: 'this shared link was published without photo access for Claude',
  rate_limited: 'Claude is busy or your usage limit was reached; try again in a bit',
}

async function readWithArtifactClaude(sample: SampleJson, src: string, place: string | null): Promise<Reading> {
  const said = PLACES.find(p => p.id === place)
  const prompt = `${MEAL_PROMPT}\n\n${said ? `They said they're eating at ${said.label} (id: ${said.id}).` : 'They did not say where they are eating.'}\n\n${ARTIFACT_FORMAT}`
  const raw = await sample.json(prompt, { images: dataUrlToBlob(await shrink(src)), modelTier: 'default' })
  const data = normalizeReading(raw, PLACES.map(p => p.id))
  return { meal: data.meal, place: place ?? data.place, items: data.food ? data.items : [], by: 'claude' }
}

export async function readPhoto(src: string, place: string | null): Promise<Reading> {
  const status = await visionStatus()
  let why = status.why
  if (!status.ok) {
    const sample = await artifactClaude()
    if (sample) {
      try {
        return await readWithArtifactClaude(sample, src, place)
      } catch (error) {
        const code = (error as { code?: string } | null)?.code
        why = (code && ARTIFACT_WHY[code]) ?? 'Claude could not read this photo here'
      }
    }
  }
  if (status.ok) {
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
      why = `Claude could not read this photo (server said ${response.status})`
    } catch {
      why = 'Claude could not read this photo (the request failed)'
    }
  }
  const labeled = await labelPhoto(src)
  return { meal: labeled.name, place, items: labeled.items.map(name => ({ name, size: 'regular' })), by: 'device', why }
}
