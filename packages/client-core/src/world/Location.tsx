
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { LocationIcons } from '@xrengine/client-core/src/components/LocationIcons'
import { useLoadLocation, useLoadScene } from '@xrengine/client-core/src/components/World/LoadLocationScene'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { ThemeContextProvider } from '@xrengine/client/src/pages/themeContext'
import { useMutableState } from '@xrengine/hyperflux'

import '@xrengine/client-core/src/util/GlobalStyle.css'

import './LocationModule'

import multiLogger from '@xrengine/common/src/logger'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'
import { StyledEngineProvider } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { NotificationService } from '../common/services/NotificationService'
import { useLoadEngineWithScene, useNetwork } from '../components/World/EngineHooks'
import { LocationService } from '../social/services/LocationService'
import { LoadingUISystemState } from '../systems/LoadingUISystem'
import { clientContextParams } from '../util/ClientContextState'

const logger = multiLogger.child({ component: 'system:location', modifier: clientContextParams })

type Props = {
  online?: boolean
}

const LocationPage = ({ online }: Props) => {
  const { t } = useTranslation()
  const params = useParams()
  const ready = useMutableState(LoadingUISystemState).ready

  useNetwork({ online })

  if (params.locationName) {
    useLoadLocation({ locationName: params.locationName })
  } else {
    useLoadScene({ projectName: params.projectName!, sceneName: params.sceneName! })
  }

  AuthService.useAPIListeners()
  LocationService.useLocationBanListeners()

  useLoadEngineWithScene()

  useEffect(() => {
    if (ready.value) logger.info({ event_name: 'enter_location' })
    return () => logger.info({ event_name: 'exit_location' })
  }, [ready.value])

  // To show invalid token error
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    if (queryParams.has('error')) {
      NotificationService.dispatchNotify(t('common:error.expiredToken'), {
        variant: 'error'
      })
    }
  }, [location.search])

  return (
    <>
      <ThemeContextProvider>
        <StyledEngineProvider injectFirst>
          {!ready.value && (
            <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingEngine')} />
          )}
          <LocationIcons />
        </StyledEngineProvider>
      </ThemeContextProvider>
    </>
  )
}

export default LocationPage
