import { useState } from 'react'
import { Header } from './components/Header'
import { CalendarGrid } from './components/CalendarGrid'
import { HeroAssistant, HeroAssistantToggle } from './components/HeroAssistant'
import { CalendarsProvider } from './hooks/useCalendars'
import './styles/global.css'

function AppShell() {
  const [heroOpen, setHeroOpen] = useState(true)

  return (
    <div className="app">
      <Header />
      <main className={`main${heroOpen ? '' : ' main-hero-closed'}`}>
        <CalendarGrid />
        {heroOpen ? (
          <HeroAssistant onClose={() => setHeroOpen(false)} />
        ) : (
          <HeroAssistantToggle onOpen={() => setHeroOpen(true)} />
        )}
      </main>
    </div>
  )
}

export function App() {
  return (
    <CalendarsProvider>
      <AppShell />
    </CalendarsProvider>
  )
}
