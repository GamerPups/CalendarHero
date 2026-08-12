import { Header } from './components/Header'
import { CalendarGrid } from './components/CalendarGrid'
import { HeroAssistant } from './components/HeroAssistant'
import './styles/global.css'

export function App() {
  return (
    <div className="app">
      <Header />
      <main className="main">
        <CalendarGrid />
        <HeroAssistant />
      </main>
    </div>
  )
}
