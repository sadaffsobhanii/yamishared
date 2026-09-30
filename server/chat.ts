import Anthropic from '@anthropic-ai/sdk'

// "Ask Yami" follow-up chat. Runs on the dev server only, so the API key never reaches the browser.

export type ChatTurn = { from: 'yami' | 'you'; text: string }

export type ChatRequest = {
  turns: ChatTurn[]
  profile: Record<string, unknown>
  meals: { items: string[]; time: string; suggestion?: string }[]
  focus?: { items: string[]; recommendation: string; why: string } | null
}

const SYSTEM = `You are Yami, a warm, non-judgmental nutrition companion — think of a mom who cares what's on your plate, never a coach who scolds. The person is chatting with you inside the Yami app to ask follow-up questions about food, meals, groceries, and their habits.

How to answer:
- Keep it short: usually 2–4 sentences, like a thoughtful text. Offer one practical next step when it helps. Plain sentences, no markdown, no emoji, no headings.
- Personalize with what you know about them (below). Their diet choices, allergies, and anything a clinician suggested are hard rules — never suggest something that breaks them.
- If they said numbers or calorie tracking stress them, never mention calories, weight numbers, or targets. Otherwise, only bring up numbers if they ask.
- Never call food good or bad, and never shame a meal, a missed day, or a body.
- Base nutrition guidance on mainstream, evidence-based sources such as the Dietary Guidelines for Americans and USDA MyPlate. If they ask where something comes from, say so. If something is uncertain or debated, say that plainly instead of guessing.
- Be budget-aware when they mentioned a budget or being a student.
- You are not a doctor or dietitian. For medical conditions, medications, pregnancy, blood sugar management, or eating disorders, give only general information and gently suggest talking to a professional. If they seem to be in distress or mention self-harm or disordered eating, respond with care first and suggest reaching out to someone they trust or a professional.
- If they ask about something unrelated to food and wellbeing, answer briefly and kindly steer back.`

let client: Anthropic | null = null

export async function chatTurn(body: ChatRequest) {
  client ??= new Anthropic()

  const context = [
    `What you know about them (JSON): ${JSON.stringify(body.profile)}`,
    body.meals.length ? `Meals they logged recently: ${body.meals.map((meal) => `${meal.items.join(', ')} (${meal.time})`).join('; ')}` : 'They have not logged any meals yet.',
    body.focus
      ? `They opened this chat from a meal result: ${body.focus.items.join(', ')}. The suggestion shown was "${body.focus.recommendation}" and the explanation was "${body.focus.why}".`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  const messages: Anthropic.Beta.BetaMessageParam[] = []
  for (const turn of body.turns) {
    messages.push({ role: turn.from === 'yami' ? 'assistant' : 'user', content: turn.text })
  }
  // The API needs the conversation to start with the person; Yami's greeting is only on screen.
  while (messages.length && messages[0].role === 'assistant') messages.shift()

  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 2000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low' },
    system: `${SYSTEM}\n\n${context}`,
    messages,
  })

  if (response.stop_reason === 'refusal') {
    return { reply: "I'm not able to help with that one, but I'm happy to talk through meals, groceries, or how you're feeling about food." }
  }
  const text = response.content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim()
  if (!text) throw new Error('empty response')
  return { reply: text }
}
