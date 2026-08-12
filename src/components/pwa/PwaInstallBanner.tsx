import { usePwaInstall } from '../../hooks/use-pwa'

export function PwaInstallBanner() {
  const { showInstallBanner, promptInstall, dismissInstallBanner } = usePwaInstall()

  if (!showInstallBanner) return null

  return (
    <div className="pwa-install-banner" role="region" aria-label="Install CalendarHero">
      <div className="pwa-install-card">
        <div className="pwa-install-copy">
          <p className="pwa-install-title">Install CalendarHero</p>
          <p className="pwa-install-subtitle">
            Add to your home screen or desktop for quick access and offline use.
          </p>
        </div>
        <div className="pwa-install-actions">
          <button type="button" className="btn-primary" onClick={() => void promptInstall()}>
            Install
          </button>
          <button type="button" className="btn-secondary" onClick={dismissInstallBanner}>
            Not now
          </button>
        </div>
        <button
          type="button"
          className="pwa-install-close"
          onClick={dismissInstallBanner}
          aria-label="Dismiss install prompt"
        >
          ×
        </button>
      </div>
    </div>
  )
}
