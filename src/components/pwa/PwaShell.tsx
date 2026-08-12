import { OfflineBanner } from './OfflineBanner'
import { PwaInstallBanner } from './PwaInstallBanner'
import { UpdateBanner } from './UpdateBanner'

export function PwaShell() {
  return (
    <>
      <UpdateBanner />
      <OfflineBanner />
      <PwaInstallBanner />
    </>
  )
}
