import { CalendarsProvider } from './hooks/useCalendars'
import { useIsMobileLayout } from './hooks/use-media-query'
import { DesktopShell } from './DesktopShell'
import { MobileShell } from './components/mobile/MobileShell'
import './styles/global.css'

function AppRouter() {
  const isMobile = useIsMobileLayout()
  return isMobile ? <MobileShell /> : <DesktopShell />
}

export function App() {
  return (
    <CalendarsProvider>
      <AppRouter />
    </CalendarsProvider>
  )
}
