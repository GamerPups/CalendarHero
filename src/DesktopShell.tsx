import { useState } from 'react'
import { Header } from './components/Header'
import { CalendarGrid } from './components/CalendarGrid'
import { HeroAssistant, HeroAssistantToggle } from './components/HeroAssistant'
import { OnboardingTutorial } from './components/OnboardingTutorial'
import { PwaShell } from './components/pwa/PwaShell'

export function DesktopShell() {
  const [heroOpen, setHeroOpen] = useState(true)

  return (
    <div className="app">
      <PwaShell />
      <OnboardingTutorial />
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
