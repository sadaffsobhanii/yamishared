import Anthropic from '@anthropic-ai/sdk'

// Runs on the dev server only, so the API key never reaches the browser.

export type OnboardTurn = { from: 'yami' | 'you'; text: string }

export type OnboardRequest = {
  turns: OnboardTurn[]
  profile: Record<string, unknown>
}

const GOALS = ['weight', 'energy', 'muscle', 'blood-sugar', 'feel-better', 'aware']
const DIETS = ['vegetarian', 'vegan', 'keto', 'allergies', 'doctor', 'eating-out', 'none']
const PAST = ['too-long', 'numbers-stress', 'lost-motivation', 'life-busy', 'first-time']
const WIDGETS = ['protein', 'fiber', 'water', 'energy', 'consistency', 'macros']

const nullable = (schema: Record<string, unknown>) => ({ anyOf: [schema, { type: 'null' }] })
const enumList = (values: string[]) => nullable({ type: 'array', items: { type: 'string', enum: values } })

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['reply', 'updates', 'done'],
  properties: {
    reply: { type: 'string' },
    done: { type: 'boolean' },
    updates: {
      type: 'object',
      additionalProperties: false,
      required: [
        'name',
        'goals',
        'goalCustom',
        'diets',
        'allergyNote',
        'pastApps',
        'pace',
        'budget',
        'studentBudget',
        'shopMode',
        'shopStore',
        'widgets',
        'trackCalories',
        'trackWeight',
      ],
      properties: {
        name: nullable({ type: 'string' }),
        goals: enumList(GOALS),
        goalCustom: nullable({ type: 'string' }),
        diets: enumList(DIETS),
        allergyNote: nullable({ type: 'string' }),
        pastApps: enumList(PAST),
        pace: nullable({ type: 'string', enum: ['gentle', 'steady', 'detailed'] }),
        budget: nullable({ type: 'string' }),
        studentBudget: nullable({ type: 'boolean' }),
        shopMode: nullable({ type: 'string', enum: ['in-store', 'online', 'both'] }),
        shopStore: nullable({ type: 'string' }),
        widgets: enumList(WIDGETS),
        trackCalories: nullable({ type: 'boolean' }),
        trackWeight: nullable({ type: 'boolean' }),
      },
    },
  },
}

const SYSTEM = `You are Yami, a warm, non-judgmental nutrition companion — think of a mom who cares what's on your plate, never a coach who scolds. You are running a short getting-to-know-you conversation when someone first opens the app.

Your job is to learn these things, roughly in this order, one at a time:
1. name — what to call them
2. goals — what they want help with (losing weight, more energy, building muscle, steadier blood sugar, feeling better around food, being more aware of eating habits — or their own words)
3. diet — how they eat and anything to work around (vegetarian, vegan, keto, allergies, something a doctor suggested, eating out often, or nothing specific)
4. past tracking — whether they've tracked food before and what got in the way (logging took too long, numbers felt stressful, lost motivation, life got busy, or this is their first try)
5. pace — how much they'd like Yami around: a light touch (gentle), a steady rhythm (steady), or more detail (detailed)
6. budget — roughly what they spend on groceries per week, and whether they're on a student budget
7. shopping — in the store, online, or both, and a store name if they mention one
8. home screen — what they'd like to keep an eye on (protein, fiber, water, energy, meal consistency, macros). Calories and weight are off unless they ask for them.

How to talk:
- Reply in 1–2 short sentences, like a text from someone who likes them. React to what they actually said before moving on — be specific, not generic.
- Ask one thing at a time. Weave the next question in naturally; don't announce topics or number them.
- If an answer covers several topics at once, capture all of them and skip ahead. Never re-ask something you already know.
- If they skip or dodge a topic, say that's fine and move on. Don't push.
- If an answer is unclear, ask a gentle follow-up once, then move on.
- Use their name occasionally, not every turn.
- Never judge food, bodies, or weight. Don't bring up calories or weight unless they do.
- You are not a doctor or dietitian. If they mention a medical condition, an eating disorder, or distress, respond with care, don't give medical advice, and gently suggest a professional can help — then continue only if it feels right.
- No emoji, no lists, no markdown.

Output: "reply" is exactly what Yami says next. In "updates", fill only the fields you learned from their latest message (use the given ids for enum fields; budget is digits only, e.g. "60"); set everything else to null. Set "done" to true only once every topic is answered or skipped — and then make "reply" a warm wrap-up (no new question) that says you'll show them a quick recap.`

let client: Anthropic | null = null

export async function onboardTurn(body: OnboardRequest) {
  client ??= new Anthropic()

  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: 'user', content: '(I just opened Yami for the first time.)' }]
  for (const turn of body.turns) {
    messages.push({ role: turn.from === 'yami' ? 'assistant' : 'user', content: turn.text })
  }

  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 2000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    system: `${SYSTEM}\n\nWhat you already know about them (JSON): ${JSON.stringify(body.profile)}`,
    messages,
  })

  if (response.stop_reason === 'refusal') throw new Error('refusal')
  const text = response.content.find((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')?.text
  if (!text) throw new Error('empty response')
  return JSON.parse(text) as { reply: string; done: boolean; updates: Record<string, unknown> }
}
