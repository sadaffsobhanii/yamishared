import { useEffect, useState, type ReactNode } from 'react'
import { Yami } from '../components/Yami'
import { PrimaryButton, Screen } from '../components/ui'
import type {
  CookFeel,
  DietChoice,
  LoveId,
  MealSources,
  PastChoice,
  PrepHabit,
  Profile,
  ShopFrequency,
  StoreChoice,
  SupportId,
  WidgetId,
} from '../types'
import { emptyProfile } from '../types'

const STEPS = ['name', 'loves', 'support', 'diet', 'past', 'hello', 'sources', 'cook', 'prep', 'shop', 'stores', 'budget', 'thanks'] as const
type StepId = (typeof STEPS)[number]

const LOVES: { id: LoveId; label: string }[] = [
  { id: 'energy', label: 'More energy' },
  { id: 'protein', label: 'More protein' },
  { id: 'lighter', label: 'Feeling lighter' },
  { id: 'strength', label: 'Building strength' },
  { id: 'blood-sugar', label: 'Steadier blood sugar' },
  { id: 'peace', label: 'Feeling at peace with food' },
  { id: 'eating-well', label: 'Simply eating well' },
]

const SUPPORT: { id: SupportId; label: string }[] = [
  { id: 'what-to-eat', label: 'Knowing what to eat' },
  { id: 'ordering', label: 'Ordering healthier' },
  { id: 'simple-meals', label: 'Cooking simple meals' },
  { id: 'planning', label: 'Planning my meals' },
  { id: 'consistent', label: 'Staying consistent' },
  { id: 'budget', label: 'Eating well on a budget' },
  { id: 'understanding', label: 'Understanding nutrition' },
]

const DIETS: { id: DietChoice; label: string }[] = [
  { id: 'none', label: 'No preference' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'keto', label: 'Keto' },
  { id: 'halal', label: 'Halal' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'dairy-free', label: 'Dairy-free' },
  { id: 'allergies', label: 'I have allergies' },
]

const PAST: { id: PastChoice; label: string }[] = [
  { id: 'first-time', label: 'This is my first time' },
  { id: 'too-long', label: 'Logging took too long' },
  { id: 'numbers-stress', label: 'The numbers felt stressful' },
  { id: 'lost-motivation', label: 'I lost motivation along the way' },
]

const COOK: { id: CookFeel; label: string }[] = [
  { id: 'rather-not', label: "I'd rather not cook" },
  { id: 'simple', label: 'Simple meals are my thing' },
  { id: 'few-times', label: 'I cook a few times a week' },
  { id: 'love-kitchen', label: 'I love being in the kitchen' },
]

const PREP: { id: PrepHabit; label: string }[] = [
  { id: 'not-really', label: 'Not really' },
  { id: 'like-to-start', label: "I'd like to start" },
  { id: 'sometimes', label: 'Sometimes' },
  { id: 'every-week', label: 'Every week' },
]

const SHOP: { id: ShopFrequency; label: string }[] = [
  { id: 'rarely', label: 'Rarely' },
  { id: 'couple-weeks', label: 'Every couple of weeks' },
  { id: 'weekly', label: 'Once a week' },
  { id: 'few-times', label: 'A few times a week' },
]

const STORES: { id: StoreChoice; label: string }[] = [
  { id: 'trader-joes', label: "Trader Joe's" },
  { id: 'ralphs', label: 'Ralphs' },
  { id: 'target', label: 'Target' },
  { id: 'whole-foods', label: 'Whole Foods' },
  { id: 'costco', label: 'Costco' },
  { id: 'sprouts', label: 'Sprouts' },
  { id: 'local', label: 'A local market' },
  { id: 'instacart', label: 'Online, like Instacart' },
]

const SOURCE_LABEL = ['Rarely', 'Sometimes', 'Often', 'Most days'] as const

const STORE_LABEL: Record<Exclude<StoreChoice, 'instacart'>, string> = {
  'trader-joes': "Trader Joe's",
  ralphs: 'Ralphs',
  target: 'Target',
  'whole-foods': 'Whole Foods',
  costco: 'Costco',
  sprouts: 'Sprouts',
  local: 'My local grocery store',
}

export function OnboardingScreen({ onEnter }: { onEnter: (profile: Profile) => void }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [loves, setLoves] = useState<LoveId[]>([])
  const [support, setSupport] = useState<SupportId[]>([])
  const [supportNote, setSupportNote] = useState('')
  const [diets, setDiets] = useState<DietChoice[]>([])
  const [past, setPast] = useState<PastChoice | ''>('')
  const [sources, setSources] = useState<MealSources>({ home: 1, delivery: 1, out: 1, prep: 1 })
  const [cook, setCook] = useState<CookFeel | ''>('')
  const [prep, setPrep] = useState<PrepHabit | ''>('')
  const [shopFreq, setShopFreq] = useState<ShopFrequency | ''>('')
  const [stores, setStores] = useState<StoreChoice[]>([])
  const [storeNote, setStoreNote] = useState('')
  const [groceryBudget, setGroceryBudget] = useState(50)
  const [eatingOutBudget, setEatingOutBudget] = useState(40)

  const id = STEPS[step]
  const ready = canContinue(id, { name, loves, support, diets, past, cook, prep, shopFreq, stores, storeNote })

  useEffect(() => {
    document.querySelector('.survey .screen-body')?.scrollTo({ top: 0 })
  }, [step])

  function next() {
    if (!ready) return
    if (id === 'thanks') {
      onEnter(buildProfile({ name, loves, support, supportNote, diets, past, sources, cook, prep, shopFreq, stores, storeNote, groceryBudget, eatingOutBudget }))
      return
    }
    setStep((current) => current + 1)
  }

  return (
    <Screen
      className="survey"
      progress={step / (STEPS.length - 1)}
      onBack={step > 0 ? () => setStep((current) => current - 1) : undefined}
      footer={
        <PrimaryButton onClick={next} disabled={!ready}>
          {id === 'thanks' ? "Let's begin" : 'Continue'}
        </PrimaryButton>
      }
    >
      {id === 'name' && (
        <Question title="What's your name?">
          <input
            className="zoe-field"
            value={name}
            placeholder="Your name"
            maxLength={40}
            autoComplete="given-name"
            onChange={(event) => setName(event.target.value)}
          />
        </Question>
      )}

      {id === 'loves' && (
        <Question title="What would you love more of right now?" hint="Pick up to two">
          <Choices
            options={LOVES}
            selected={loves}
            onToggle={(choice) => setLoves((current) => toggleLimited(current, choice, 2))}
          />
        </Question>
      )}

      {id === 'support' && (
        <Question title="Where do you need the most support right now?" hint="Pick up to two">
          <Choices
            options={SUPPORT}
            selected={support}
            onToggle={(choice) => setSupport((current) => toggleLimited(current, choice, 2))}
          />
          <label className="zoe-note">
            Anything else you'd like us to know?
            <textarea
              className="zoe-field"
              rows={3}
              maxLength={200}
              placeholder="Optional"
              value={supportNote}
              onChange={(event) => setSupportNote(event.target.value)}
            />
          </label>
        </Question>
      )}

      {id === 'diet' && (
        <Question title="How do you like to eat?" hint="Pick any">
          <Choices options={DIETS} selected={diets} onToggle={(choice) => setDiets((current) => toggleDiet(current, choice))} />
        </Question>
      )}

      {id === 'past' && (
        <Question title="Have you tried a food app before?">
          <Choices options={PAST} selected={past ? [past] : []} onToggle={setPast} />
        </Question>
      )}

      {id === 'hello' && (
        <div className="zoe-meet">
          <p className="zoe-bubble">It's nice to meet you, {name.trim()}!</p>
          <Yami mood="awake" className="yami-lg" />
        </div>
      )}

      {id === 'sources' && (
        <Question title="Where do most of your meals come from?">
          <Scale label="Cooking at home" value={sources.home} onChange={(value) => setSources({ ...sources, home: value })} />
          <Scale label="Ordering delivery" value={sources.delivery} onChange={(value) => setSources({ ...sources, delivery: value })} />
          <Scale label="Dining hall or eating out" value={sources.out} onChange={(value) => setSources({ ...sources, out: value })} />
          <Scale label="Meal prep" value={sources.prep} onChange={(value) => setSources({ ...sources, prep: value })} />
        </Question>
      )}

      {id === 'cook' && (
        <Question title="How do you feel about cooking?">
          <Choices options={COOK} selected={cook ? [cook] : []} onToggle={setCook} />
        </Question>
      )}

      {id === 'prep' && (
        <Question title="Do you meal prep?">
          <Choices options={PREP} selected={prep ? [prep] : []} onToggle={setPrep} />
        </Question>
      )}

      {id === 'shop' && (
        <Question title="How often do you shop for groceries?">
          <Choices options={SHOP} selected={shopFreq ? [shopFreq] : []} onToggle={setShopFreq} />
        </Question>
      )}

      {id === 'stores' && (
        <Question title="Where do you like to shop?" hint="Pick any">
          <Choices
            options={STORES}
            selected={stores}
            onToggle={(choice) => setStores((current) => (current.includes(choice) ? current.filter((item) => item !== choice) : [...current, choice]))}
          />
          <label className="zoe-note">
            Another store we should know about?
            <input
              className="zoe-field"
              value={storeNote}
              maxLength={60}
              placeholder="Optional"
              onChange={(event) => setStoreNote(event.target.value)}
            />
          </label>
        </Question>
      )}

      {id === 'budget' && (
        <Question title="What feels comfortable to spend on food each week?">
          <MoneyScale label="Groceries" value={groceryBudget} onChange={setGroceryBudget} />
          <MoneyScale label="Eating out and delivery" value={eatingOutBudget} onChange={setEatingOutBudget} />
        </Question>
      )}

      {id === 'thanks' && (
        <div className="zoe-meet">
          <p className="zoe-bubble">Thank you, {name.trim()}. We've got you from here.</p>
          <Yami mood="awake" className="yami-lg" />
        </div>
      )}
    </Screen>
  )
}

function Question({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="zoe-question">
      <h1>{title}</h1>
      {hint ? <p className="zoe-hint">{hint}</p> : null}
      {children}
    </div>
  )
}

function Choices<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: { id: T; label: string }[]
  selected: T[]
  onToggle: (id: T) => void
}) {
  return (
    <div className="zoe-options">
      {options.map((option) => {
        const on = selected.includes(option.id)
        return (
          <button key={option.id} type="button" className={on ? 'zoe-option on' : 'zoe-option'} aria-pressed={on} onClick={() => onToggle(option.id)}>
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function Scale({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const pct = value / 3
  return (
    <div className="zoe-scale">
      <p>{label}</p>
      <div className="zoe-rail">
        <span className="zoe-bubble" style={{ left: `calc(${pct} * (100% - 28px) + 14px)` }}>
          {SOURCE_LABEL[value]}
        </span>
        <input
          className="zoe-range"
          style={{ ['--pct' as string]: `${pct * 100}%` }}
          type="range"
          min={0}
          max={3}
          step={1}
          value={value}
          aria-valuetext={SOURCE_LABEL[value]}
          aria-label={label}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
      <div className="zoe-ends">
        <span>Rarely</span>
        <span>Most days</span>
      </div>
    </div>
  )
}

function MoneyScale({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const pct = value / 150
  const bubble = value >= 150 ? '$150+ a week' : `$${value} a week`
  return (
    <div className="zoe-scale">
      <p>{label}</p>
      <div className="zoe-rail">
        <span className={pct < 0.18 ? 'zoe-bubble start' : pct > 0.82 ? 'zoe-bubble end' : 'zoe-bubble'} style={{ left: `calc(${pct} * (100% - 28px) + 14px)` }}>
          {bubble}
        </span>
        <input
          className="zoe-range"
          style={{ ['--pct' as string]: `${pct * 100}%` }}
          type="range"
          min={0}
          max={150}
          step={10}
          value={value}
          aria-valuetext={bubble}
          aria-label={label}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
      <div className="zoe-ends">
        <span>$0</span>
        <span>$150+</span>
      </div>
    </div>
  )
}

function toggleLimited<T>(current: T[], id: T, max: number) {
  if (current.includes(id)) return current.filter((item) => item !== id)
  if (current.length >= max) return current
  return [...current, id]
}

function toggleDiet(current: DietChoice[], id: DietChoice): DietChoice[] {
  if (id === 'none') return current.includes('none') ? [] : ['none']
  const rest = current.filter((item) => item !== 'none')
  return rest.includes(id) ? rest.filter((item) => item !== id) : [...rest, id]
}

function canContinue(
  id: StepId,
  answers: {
    name: string
    loves: LoveId[]
    support: SupportId[]
    diets: DietChoice[]
    past: PastChoice | ''
    cook: CookFeel | ''
    prep: PrepHabit | ''
    shopFreq: ShopFrequency | ''
    stores: StoreChoice[]
    storeNote: string
  },
) {
  if (id === 'name') return answers.name.trim().length > 0
  if (id === 'loves') return answers.loves.length > 0
  if (id === 'support') return answers.support.length > 0
  if (id === 'diet') return answers.diets.length > 0
  if (id === 'past') return answers.past !== ''
  if (id === 'cook') return answers.cook !== ''
  if (id === 'prep') return answers.prep !== ''
  if (id === 'shop') return answers.shopFreq !== ''
  if (id === 'stores') return answers.stores.length > 0 || answers.storeNote.trim().length > 0
  return true
}

function buildProfile(answers: {
  name: string
  loves: LoveId[]
  support: SupportId[]
  supportNote: string
  diets: DietChoice[]
  past: PastChoice | ''
  sources: MealSources
  cook: CookFeel | ''
  prep: PrepHabit | ''
  shopFreq: ShopFrequency | ''
  stores: StoreChoice[]
  storeNote: string
  groceryBudget: number
  eatingOutBudget: number
}): Profile {
  const goals: string[] = []
  const widgets: WidgetId[] = []
  if (answers.loves.includes('energy')) {
    goals.push('energy')
    widgets.push('energy')
  }
  if (answers.loves.includes('protein') || answers.loves.includes('strength')) {
    if (!widgets.includes('protein')) widgets.push('protein')
  }
  if (answers.loves.includes('strength')) goals.push('muscle')
  if (answers.loves.includes('blood-sugar')) goals.push('blood-sugar')
  if (answers.loves.includes('peace')) goals.push('feel-better')
  if (answers.loves.includes('eating-well')) goals.push('aware')
  if (answers.loves.includes('lighter')) goals.push('lighter')
  if (answers.support.includes('consistent') && !widgets.includes('consistency')) widgets.push('consistency')

  const dietIds: string[] = answers.diets.filter((item) => item !== 'none')
  const notes: string[] = []
  if (dietIds.includes('gluten-free')) notes.push('gluten')
  if (dietIds.includes('dairy-free')) notes.push('dairy')
  if ((answers.sources.delivery >= 3 || answers.sources.out >= 3) && !dietIds.includes('eating-out')) dietIds.push('eating-out')

  const physical = answers.stores.filter((item) => item !== 'instacart')
  const online = answers.stores.includes('instacart')
  const note = answers.storeNote.trim()
  const shopMode: Profile['shopMode'] = online && (physical.length > 0 || note) ? 'both' : online ? 'online' : 'in-store'

  return {
    ...emptyProfile,
    name: answers.name.trim(),
    goals,
    goalCustom: answers.supportNote.trim(),
    loves: answers.loves,
    support: answers.support,
    supportNote: answers.supportNote.trim(),
    diets: dietIds,
    allergyNote: notes.join(' '),
    pastApps: answers.past ? [answers.past] : [],
    budget: String(answers.groceryBudget),
    budgetMinded: answers.support.includes('budget'),
    shopMode,
    shopStore: physical[0] ? STORE_LABEL[physical[0]] : '',
    shopStoreCustom: physical.length === 0 ? note : '',
    shopStoreNote: physical.length > 0 ? note : '',
    shopStores: answers.stores,
    shopFrequency: answers.shopFreq,
    cookFeel: answers.cook,
    mealPrep: answers.prep,
    mealSources: answers.sources,
    groceryBudget: answers.groceryBudget,
    eatingOutBudget: answers.eatingOutBudget,
    widgets,
  }
}
