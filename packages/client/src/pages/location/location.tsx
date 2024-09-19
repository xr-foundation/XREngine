
import { t } from 'i18next'
import React, { Suspense, useEffect, useRef } from 'react'
import { Route, Routes } from 'react-router-dom'

import '../../engine'

import Debug from '@xrengine/client-core/src/components/Debug'
import { useEngineInjection } from '@xrengine/client-core/src/components/World/EngineHooks'
import { useEngineCanvas } from '@xrengine/client-core/src/hooks/useEngineCanvas'
import LocationPage from '@xrengine/client-core/src/world/Location'
import { destroySpatialEngine, initializeSpatialEngine } from '@xrengine/spatial/src/initializeEngine'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'

import '../mui.styles.scss' /** @todo Remove when MUI is removed */
import '../styles.scss'

const LocationRoutes = () => {
  const ref = useRef<HTMLElement>(document.body)

  useEffect(() => {
    initializeSpatialEngine()
    return () => {
      destroySpatialEngine()
    }
  }, [])

  useEngineCanvas(ref)

  const projectsLoaded = useEngineInjection()

  if (!projectsLoaded)
    return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingProjects')} />

  return (
    <Suspense
      fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingLocation')} />}
    >
      <Routes>
        <Route path=":locationName" element={<LocationPage online />} />
      </Routes>
      <Debug />
    </Suspense>
  )
}

export default LocationRoutes
