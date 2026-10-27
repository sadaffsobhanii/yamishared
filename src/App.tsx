import { Cart } from './proto/Cart'
import { Chef } from './proto/Chef'
import { Home } from './proto/Home'
import { Insights } from './proto/Insights'
import { Log } from './proto/Log'
import { Onboarding } from './proto/Onboarding'
import { Order } from './proto/Order'
import { YamiProvider, useYami, type Tab } from './proto/store'
import { Weekly } from './proto/Weekly'
import { You } from './proto/You'

const TABS: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'order', label: 'Order Smart' },
  { id: 'log', label: '' },
  { id: 'progress', label: 'Insights' },
  { id: 'you', label: 'You' },
]

function ChefHat() {
  return (
    <svg width="34" height="30" viewBox="0 0 34 30" aria-hidden="true">
      <path d="M8 20c-5-1-7-8-2-11 1-5 7-7 10-3 3-4 9-3 10 2 5 0 7 7 2 10z" fill="#fff" />
      <rect x="8" y="20" width="18" height="7" rx="2" fill="#fff" />
      <path d="M13 15v4M17 13v6M21 15v4" stroke="#990000" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function App() {
  return (
    <YamiProvider>
      <Shell />
    </YamiProvider>
  )
}

function Shell() {
  const { P, tab, go, toastMsg, weekly, cartOpen, chefOpen, dayMode } = useYami()
  const onboard = !P.onboarded
  return (
    <div className="stage">
      <div className={`app${dayMode === 'casual' ? '' : ` mode-${dayMode}`}`}>
        <main className={`screen${onboard ? ' noTab ob' : ''}`}>
          {onboard && <Onboarding />}
          {!onboard && tab === 'home' && <Home />}
          {!onboard && tab === 'log' && <Log />}
          {!onboard && tab === 'order' && <Order />}
          {!onboard && tab === 'progress' && <Insights />}
          {!onboard && tab === 'you' && <You />}
        </main>
        {!onboard && (
          <nav className="tabbar">
            {TABS.map(item => (
              <button
                key={item.id}
                className={item.id === 'log' ? 'plus' : undefined}
                aria-label={item.id === 'log' ? 'Chef Yami' : item.label}
                aria-current={tab === item.id ? 'page' : undefined}
                onClick={() => go(item.id)}
              >
                {item.id === 'log' ? <ChefHat /> : item.label}
              </button>
            ))}
          </nav>
        )}
        {toastMsg && <div className="toast">{toastMsg}</div>}
        {weekly != null && <Weekly />}
        {cartOpen && <Cart />}
        {chefOpen && <Chef />}
      </div>
      <aside className="side">
        <h1>Yami prototype</h1>
        <p>A clickable demo for testing. Try it the way a new user would.</p>
        <ol>
          <li>Answer the onboarding questions</li>
          <li>Tap the chef hat and log a meal</li>
          <li>Order a meal on Order Smart</li>
          <li>Check your Fuel Score on Home and Insights</li>
          <li>Open Yami Weekly from Home</li>
          <li>Change your plan on You</li>
        </ol>
        <p className="note">Restaurant numbers are sample estimates. Photos stay on your device. Yami offers general guidance, not medical advice.</p>
      </aside>
    </div>
  )
}
