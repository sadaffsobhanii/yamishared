import Anthropic from '@anthropic-ai/sdk'
import { PLACES } from '../src/proto/places'

// Reads a meal photo with Claude: every food on the plate, roughly how much, and where it's from.
// Runs on the dev server only, so the API key never reaches the browser.

export type VisionRequest = { image: string; place?: string | null }

export type VisionItem = { name: string; usda: string; grams: number; size: 'small' | 'regular' | 'large'; kind: string; whole: boolean }
export type VisionResult = { food: boolean; meal: string; place: string | null; items: VisionItem[] }

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

const SYSTEM = `You read meal photos for Yami, a nutrition app for USC students. Most meals come from USC dining halls (Everybody's Kitchen, Parkside, USC Village Dining Hall) or chains on and near campus such as Starbucks and Chipotle.

List every distinct food or drink you can see, as the person would name it. Split plates into components: a burrito bowl is rice, beans, chicken, salsa, and so on; a dining hall plate is each item on it. Sauces and dressings count when visible. Skip plates, cups, utensils, and packaging.

For each item:
- name: short and natural, in title case ("Cilantro-lime rice", "Grilled chicken", "Iced latte"). Use the chain's own menu name when the place is a chain.
- usda: a plain generic phrase USDA FoodData Central would know ("rice white cooked", "chicken breast grilled", "coffee latte with milk", "black beans"). Never a brand name.
- grams: your best estimate of the amount on the plate or in the cup, in grams (a drink: its volume in ml as grams). Use visible cues like plate size, utensils, and cup size.
- size: small, regular, or large compared with a typical serving of that food.
- kind: the food's main group. Beans, lentils, tofu and edamame are plant protein; eggs, meat and fish are animal protein; yogurt and cheese are dairy.
- whole: true if it's a whole or lightly processed food (vegetables, fruit, beans, plain meat, whole grains), false for processed or packaged foods, pastries, fried snacks and sugary drinks.

meal: a short name for the whole meal ("Chipotle chicken bowl", "Breakfast plate", "Starbucks iced latte").
place: the place id if logos, cups, wrappers, or the food itself make it clear, otherwise null. If the person already said where they are, trust that.
food: false if the photo has no food or drink in it; then return no items.

Estimate honestly; the person can correct anything. Never comment on whether the meal is good or bad.`

let client: Anthropic | null = null

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
  const text = response.content.find((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')?.text
  if (!text) throw new Error('empty response')
  return JSON.parse(text) as VisionResult
}
