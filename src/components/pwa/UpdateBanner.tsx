import { useEffect, useState } from 'react'

export function UpdateBanner() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    function watchRegistration(registration: ServiceWorkerRegistration) {
      if (registration.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(registration.waiting)
        setNeedRefresh(true)
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing
        if (!installing) return

        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(registration.waiting ?? installing)
            setNeedRefresh(true)
          }
        })
      })
    }

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) watchRegistration(registration)
    })

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }, [])

  function handleReload() {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' })
    setNeedRefresh(false)
  }

  if (!needRefresh || dismissed) return null

  return (
    <div className="pwa-update-banner" role="region" aria-label="App update available">
      <span>A new version of CalendarHero is available.</span>
      <div className="pwa-update-actions">
        <button type="button" className="btn-primary" onClick={handleReload}>
          Reload
        </button>
        <button
          type="button"
          className="pwa-install-close"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss update notice"
        >
          ×
        </button>
      </div>
    </div>
  )
}
