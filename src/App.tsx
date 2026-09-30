import { useEffect, useState } from 'react'
import { seedGrocery } from './data/grocery'
import { analysisFromItems, hasProtein, pickAnalysis, recommendFor } from './data/meals'
import { AnalyzingScreen } from './screens/AnalyzingScreen'
import { CheckInScreen } from './screens/CheckInScreen'
import { ConfirmScreen } from './screens/ConfirmScreen'
import { GroceryScreen } from './screens/GroceryScreen'
import { HomeScreen } from './screens/HomeScreen'
import { InsightsScreen, seedInsightWidgets } from './screens/InsightsScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { ResultScreen } from './screens/ResultScreen'
import { SnapScreen } from './screens/SnapScreen'
import type { TabId } from './components/ui'
import type { Draft, GroceryItem, LoggedMeal, MealImage, MealResult, Profile } from './types'
import { emptyProfile } from './types'

type Route = 'onboarding' | 'home' | 'snap' | 'analyzing' | 'confirm' | 'result' | 'grocery' | 'insights' | 'checkin' | 'profile'

export default function App() {
  const [route, setRoute] = useState<Route>('onboarding')
  const [profile, setProfile] = useState<Profile>(emptyProfile)
  const [grocery, setGrocery] = useState<GroceryItem[]>([])
  const [meals, setMeals] = useState<LoggedMeal[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [result, setResult] = useState<MealResult | null>(null)
  const [instacartConnected, setInstacartConnected] = useState(false)
  const [listMode, setListMode] = useState<'in-store' | 'online'>('in-store')
  const [water, setWater] = useState(0)
  const [energy, setEnergy] = useState<number | null>(null)
  const [checkInDone, setCheckInDone] = useState(false)

  useEffect(() => {
    if (route !== 'analyzing') return
    const timeout = window.setTimeout(() => setRoute('confirm'), 2000)
    return () => window.clearTimeout(timeout)
  }, [route])

  function patchProfile(patch: Partial<Profile>) {
    setProfile((current) => ({ ...current, ...patch }))
  }

  function goTab(tab: TabId) {
    setRoute(tab)
  }

  function beginAnalysis(image: MealImage, hint: string) {
    const analysis = pickAnalysis(hint)
    setDraft({ image, items: [...analysis.items], analysisId: analysis.id })
    setRoute('analyzing')
  }

  function looksRight() {
    if (!draft || draft.items.length === 0) return
    const analysis = analysisFromItems(draft.items, draft.analysisId)
    const idea = recommendFor(analysis, profile)
    setResult({
      image: draft.image,
      items: [...draft.items],
      analysis,
      summary: idea.summary,
      recommendation: idea.recommendation,
      why: idea.why,
      swapItem: idea.swapItem,
      budgetNote: idea.budgetNote,
      added: false,
    })
    setRoute('result')
  }

  function addSwap() {
    if (!result || result.added) return
    setGrocery((items) => {
      const exists = items.some((item) => item.text.toLowerCase() === result.swapItem.toLowerCase())
      if (exists) return items.map((item) => (item.text.toLowerCase() === result.swapItem.toLowerCase() ? { ...item, fromMeal: true } : item))
      return [...items, { id: crypto.randomUUID(), text: result.swapItem, done: false, fromMeal: true }]
    })
    setResult({ ...result, added: true })
  }

  function logMeal() {
    if (!result) return
    setMeals((current) => [
      {
        id: crypto.randomUUID(),
        image: result.image,
        items: result.items,
        summary: result.summary,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        hadProtein: hasProtein(result.items),
        suggestion: result.recommendation,
      },
      ...current,
    ])
    setRoute('home')
  }

  return (
    <div className="app-root">
      {route === 'onboarding' && (
        <OnboardingScreen
          profile={profile}
          onChange={patchProfile}
          onEnter={() => {
            setProfile((current) => ({ ...current, insightWidgets: seedInsightWidgets(current) }))
            setGrocery(seedGrocery(profile))
            setListMode(profile.shopMode === 'online' ? 'online' : 'in-store')
            setRoute('home')
          }}
        />
      )}
      {route === 'home' && (
        <HomeScreen
          profile={profile}
          meals={meals}
          grocery={grocery}
          water={water}
          checkInDone={checkInDone}
          onSnap={() => setRoute('snap')}
          onWater={() => setWater((count) => count + 1)}
          onCheckIn={() => setRoute('checkin')}
          onTab={goTab}
        />
      )}
      {route === 'insights' && (
        <InsightsScreen
          profile={profile}
          meals={meals}
          grocery={grocery}
          water={water}
          energy={energy}
          onChange={patchProfile}
          onWater={() => setWater((count) => Math.min(count + 1, 8))}
          onEnergy={setEnergy}
          onTab={goTab}
        />
      )}
      {route === 'profile' && <ProfileScreen profile={profile} onChange={patchProfile} onTab={goTab} />}
      {route === 'checkin' && (
        <CheckInScreen done={checkInDone} onDone={() => setCheckInDone(true)} onBack={() => setRoute('home')} />
      )}
      {route === 'snap' && <SnapScreen onBack={() => setRoute('home')} onCapture={beginAnalysis} />}
      {route === 'analyzing' && <AnalyzingScreen profile={profile} />}
      {route === 'confirm' && draft && (
        <ConfirmScreen
          items={draft.items}
          onChange={(items) => setDraft({ ...draft, items })}
          onBack={() => setRoute('snap')}
          onLooksRight={looksRight}
        />
      )}
      {route === 'result' && result && (
        <ResultScreen profile={profile} result={result} onBack={() => setRoute('confirm')} onAdd={addSwap} onLog={logMeal} />
      )}
      {route === 'grocery' && (
        <GroceryScreen
          profile={profile}
          items={grocery}
          instacartConnected={instacartConnected}
          listMode={listMode}
          onListMode={setListMode}
          onChange={setGrocery}
          onToggleInstacart={() => setInstacartConnected((connected) => !connected)}
          onBack={() => setRoute('home')}
          onTab={goTab}
        />
      )}
    </div>
  )
}
