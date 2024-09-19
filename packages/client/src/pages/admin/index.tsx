import { t } from 'i18next'
import React, { Suspense } from 'react'

import '../../engine'

import AdminRoutes from '@xrengine/client-core/src/admin/adminRoutes'
import Debug from '@xrengine/client-core/src/components/Debug'
import { useEngineInjection } from '@xrengine/client-core/src/components/World/EngineHooks'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'

const LocationRoutes = () => {
  const projectsLoaded = useEngineInjection()

  if (!projectsLoaded)
    return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingProjects')} />

  return (
    <>
      <Suspense
        fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingLocation')} />}
      >
        <AdminRoutes />
      </Suspense>
      <Debug />
    </>
  )
}

export default LocationRoutes
