import Anthropic from '@anthropic-ai/sdk'
import { MEAL_PROMPT } from '../src/proto/mealPrompt'
import { PLACES } from '../src/proto/places'
import { normalizeReading, type VisionResult } from './reading'

// Reads a meal photo with Claude: every food on the plate, roughly how much, and where it's from.
// Runs on the dev server only, so the API key never reaches the browser.

export type VisionRequest = { image: string; place?: string | null }

export type { VisionItem, VisionResult } from './reading'

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['food', 'meal', 'place', 'items'],
  properties: {
    food: { type: 'boolean' },
    meal: { type: 'string' },
    place: { anyOf: [{ type: 'string', enum: PLACES.map(place => place.id) }, { type: 'null' }] },
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'usda', 'grams', 'size', 'kind', 'whole'],
        properties: {
          name: { type: 'string' },
          usda: { type: 'string' },
          grams: { type: 'number' },
          size: { type: 'string', enum: ['small', 'regular', 'large'] },
          kind: { type: 'string', enum: ['vegetable', 'fruit', 'plant protein', 'animal protein', 'dairy', 'whole grain', 'refined grain', 'fat', 'sweet', 'drink', 'other'] },
          whole: { type: 'boolean' },
        },
      },
    },
  },
}

const SYSTEM = MEAL_PROMPT

let client: Anthropic | null = null

// The client can be swapped in tests so no real request (or key) is needed.
export function setVisionClient(next: Pick<Anthropic, 'beta'> | null) {
  client = next as Anthropic | null
}

export async function readMeal(body: VisionRequest): Promise<VisionResult> {
  client ??= new Anthropic()
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/.exec(body.image)
  if (!match) throw new Error('expected a base64 image data URL')
  const place = PLACES.find(p => p.id === body.place)

  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: match[1] as 'image/jpeg', data: match[2] } },
          { type: 'text', text: place ? `They said they're eating at ${place.label} (id: ${place.id}).` : 'They did not say where they are eating.' },
        ],
      },
    ],
  })

  if (response.stop_reason === 'refusal') throw new Error('refusal')
  if (response.stop_reason === 'max_tokens') throw new Error('truncated')
  const text = response.content.find((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')?.text
  if (!text) throw new Error('empty response')
  return normalizeReading(JSON.parse(text), PLACES.map(p => p.id))
}
