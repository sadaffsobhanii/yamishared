import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT,
  freshDeck,
  type DeckCard,
  type ListItem,
  type ChatMessage,
  type LogDraft,
  type LoggedMeal,
  type OrderDraft,
  type Profile,
  type Rec,
  type SleepLog,
} from './model'

export type Tab = 'home' | 'boards' | 'log' | 'order' | 'progress' | 'you'
export type DayMode = 'exam' | 'late' | 'burnout' | 'casual'

type Saved = { P?: Partial<Profile>; list?: ListItem[] }

function load(): { P: Profile; list: ListItem[] } {
  const params = new URLSearchParams(window.location.search)
  if (params.has('start')) {
    params.delete('start')
    const query = params.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
    try {
      localStorage.removeItem('yami-proto')
      localStorage.removeItem('yami-fuel')
    } catch {
      /* private mode */
    }
    return { P: structuredClone(DEFAULT), list: [] }
  }
  try {
    const saved = JSON.parse(localStorage.getItem('yami-proto') || 'null') as Saved | null
    if (saved?.P) {
      return {
        P: {
          ...structuredClone(DEFAULT),
          ...saved.P,
          sources: { ...DEFAULT.sources, ...saved.P.sources },
          show: { ...DEFAULT.show, ...saved.P.show },
        },
        list: saved.list || [],
      }
    }
  } catch {
    /* fresh start */
  }
  return { P: structuredClone(DEFAULT), list: [] }
}

type Store = {
  P: Profile
  setP: (next: Profile | ((prev: Profile) => Profile)) => void
  tab: Tab
  go: (tab: Tab) => void
  meals: LoggedMeal[]
  setMeals: (next: LoggedMeal[] | ((prev: LoggedMeal[]) => LoggedMeal[])) => void
  list: ListItem[]
  setList: (next: ListItem[] | ((prev: ListItem[]) => ListItem[])) => void
  water: number
  setWater: (n: number) => void
  energy: number
  setEnergy: (n: number) => void
  board: DeckCard[]
  setBoard: (next: DeckCard[] | ((prev: DeckCard[]) => DeckCard[])) => void
  favs: string[]
  setFavs: (next: string[] | ((prev: string[]) => string[])) => void
  deck: DeckCard[] | null
  setDeck: (next: DeckCard[] | null | ((prev: DeckCard[] | null) => DeckCard[] | null)) => void
  ob: number
  setOb: (n: number) => void
  weekly: number | null
  setWeekly: (n: number | null) => void
  bview: 'swipe' | 'board'
  setBview: (v: 'swipe' | 'board') => void
  rest: string
  setRest: (r: string) => void
  log: LogDraft | null
  setLog: (next: LogDraft | null | ((prev: LogDraft | null) => LogDraft | null)) => void
  ord: OrderDraft
  setOrd: (next: OrderDraft | ((prev: OrderDraft) => OrderDraft)) => void
  ordMode: string | null
  setOrdMode: (mode: string | null) => void
  lnDone: Record<string, boolean>
  markNextMeal: () => void
  toggleLn: (key: string) => void
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  cartMode: 'store' | 'online'
  setCartMode: (mode: 'store' | 'online') => void
  chefOpen: boolean
  setChefOpen: (open: boolean) => void
  chat: ChatMessage[]
  setChat: (next: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void
  sleep: SleepLog
  setSleep: (next: SleepLog | ((prev: SleepLog) => SleepLog)) => void
  tags: string[]
  setTags: (next: string[] | ((prev: string[]) => string[])) => void
  recovery: boolean
  setRecovery: (on: boolean) => void
  vacation: string | null
  setVacation: (when: string | null) => void
  sampleWeek: boolean
  setSampleWeek: (on: boolean) => void
  pview: 'today' | 'week'
  setPview: (view: 'today' | 'week') => void
  recs: Rec[]
  setRecs: (next: Rec[] | ((prev: Rec[]) => Rec[])) => void
  gate: 'allergy' | 'health' | null
  setGate: (next: 'allergy' | 'health' | null) => void
  dayMode: DayMode
  setDayMode: (mode: DayMode) => void
  fuelReady: boolean
  revealFuel: () => void
  toast: (msg: string) => void
  toastMsg: string
  reset: () => void
}

const Ctx = createContext<Store | null>(null)

export function YamiProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(load, [])
  const [P, setP] = useState<Profile>(initial.P)
  const [tab, setTab] = useState<Tab>('home')
  const [meals, setMeals] = useState<LoggedMeal[]>([])
  const [list, setList] = useState<ListItem[]>(initial.list)
  const [water, setWater] = useState(3)
  const [energy, setEnergy] = useState(2)
  const [board, setBoard] = useState<DeckCard[]>([])
  const [favs, setFavs] = useState<string[]>([])
  const [deck, setDeck] = useState<DeckCard[] | null>(null)
  const [ob, setOb] = useState(P.onboarded ? 0 : -2)
  const [weekly, setWeekly] = useState<number | null>(null)
  const [bview, setBview] = useState<'swipe' | 'board'>('swipe')
  const [rest, setRest] = useState('Chipotle')
  const [log, setLog] = useState<LogDraft | null>(null)
  const [ord, setOrd] = useState<OrderDraft>({ rest: '', meal: '' })
  const [ordMode, setOrdMode] = useState<string | null>(null)
  const [lnDone, setLnDone] = useState<Record<string, boolean>>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [cartMode, setCartMode] = useState<'store' | 'online'>(P.stores.some(x => x.startsWith('Online')) ? 'online' : 'store')
  const [chefOpen, setChefOpen] = useState(false)
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [sleep, setSleep] = useState<SleepLog>({ h: 7, feel: '', logged: false })
  const [tags, setTags] = useState<string[]>([])
  const [recovery, setRecovery] = useState(false)
  const [vacation, setVacation] = useState<string | null>(null)
  const [sampleWeek, setSampleWeek] = useState(true)
  const [pview, setPview] = useState<'today' | 'week'>('today')
  const [recs, setRecs] = useState<Rec[]>([])
  const [gate, setGate] = useState<'allergy' | 'health' | null>(null)
  const [dayMode, setDayMode] = useState<DayMode>('casual')
  const [fuelDay, setFuelDay] = useState<string | null>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('yami-fuel') || 'null') as { day?: string } | null
      return saved?.day === new Date().toDateString() ? saved.day : null
    } catch {
      return null
    }
  })
  const [toastMsg, setToastMsg] = useState('')
  const fuelReady = fuelDay === new Date().toDateString()

  function revealFuel() {
    const day = new Date().toDateString()
    setFuelDay(day)
    try {
      localStorage.setItem('yami-fuel', JSON.stringify({ day }))
    } catch {
      /* private mode */
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem('yami-proto', JSON.stringify({ P, list }))
    } catch {
      /* private mode */
    }
  }, [P, list])

  function toast(msg: string) {
    setToastMsg(msg)
    window.setTimeout(() => setToastMsg(current => (current === msg ? '' : current)), 1600)
  }

  const mealSteps = ['breakfast', 'lunch', 'snack', 'dinner']

  function markNextMeal() {
    setLnDone(current => {
      const next = mealSteps.find(key => !current[key])
      if (!next) return current
      return { ...current, [next]: true }
    })
  }

  function toggleLn(key: string) {
    setLnDone(current => ({ ...current, [key]: !current[key] }))
  }

  function go(next: Tab) {
    if (next === 'order' && tab !== 'order') {
      setOrd({ rest: '', meal: '' })
      setOrdMode(null)
    }
    setTab(next)
    setWeekly(null)
    setCartOpen(false)
    setChefOpen(false)
    if (next === 'log') {
      setLog({ step: 'start', img: null, k: null, bg: '#F7E6E3', items: [], name: '' })
      setChat([])
    }
    requestAnimationFrame(() => {
      document.querySelector('.screen')?.scrollTo(0, 0)
    })
  }

  function reset() {
    try {
      localStorage.removeItem('yami-proto')
    } catch {
      /* ignore */
    }
    setP(structuredClone(DEFAULT))
    setTab('home')
    setMeals([])
    setList([])
    setWater(3)
    setEnergy(2)
    setBoard([])
    setFavs([])
    setDeck(null)
    setOb(-2)
    setWeekly(null)
    setBview('swipe')
    setRest('Chipotle')
    setLog(null)
    setOrd({ rest: '', meal: '' })
    setOrdMode(null)
    setLnDone({})
    setCartOpen(false)
    setCartMode('store')
    setChefOpen(false)
    setChat([])
    setSleep({ h: 7, feel: '', logged: false })
    setTags([])
    setRecovery(false)
    setVacation(null)
    setSampleWeek(true)
    setPview('today')
    setRecs([])
    setGate(null)
    setDayMode('casual')
    setFuelDay(null)
    try {
      localStorage.removeItem('yami-fuel')
    } catch {
      /* ignore */
    }
  }

  const value: Store = {
    P, setP, tab, go, meals, setMeals, list, setList, water, setWater, energy, setEnergy,
    board, setBoard, favs, setFavs, deck, setDeck, ob, setOb, weekly, setWeekly,
    bview, setBview, rest, setRest, log, setLog, ord, setOrd, cartOpen, setCartOpen,
    cartMode, setCartMode, chefOpen, setChefOpen, chat, setChat, sleep, setSleep,
    ordMode, setOrdMode, lnDone, markNextMeal, toggleLn,
    tags, setTags, recovery, setRecovery, vacation, setVacation, sampleWeek, setSampleWeek,
    pview, setPview, recs, setRecs, gate, setGate, dayMode, setDayMode, fuelReady, revealFuel, toast, toastMsg, reset,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useYami() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useYami needs YamiProvider')
  return ctx
}

export function ensureDeck(P: Profile, deck: DeckCard[] | null, setDeck: Store['setDeck']) {
  if (deck) return deck
  const next = freshDeck(P)
  setDeck(next)
  return next
}
