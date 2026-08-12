import { useOnlineStatus } from '../../hooks/use-pwa'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="pwa-offline-banner" role="status" aria-live="polite">
      You&apos;re offline — your saved calendars are still available. Chat needs a connection.
    </div>
  )
}
