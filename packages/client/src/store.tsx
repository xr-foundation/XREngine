import React, { Suspense, useEffect } from 'react'
import ReactGA from 'react-ga4'
import { useTranslation } from 'react-i18next'

import { API as ClientAPI } from '@xrengine/client-core/src/API'
import { BrowserRouter, history } from '@xrengine/client-core/src/common/services/RouterService'
import waitForClientAuthenticated from '@xrengine/client-core/src/util/wait-for-client-authenticated'
import { API } from '@xrengine/common'
import { pipeLogs } from '@xrengine/common/src/logger'
import { createHyperStore, getMutableState } from '@xrengine/hyperflux'

import MetaTags from '@xrengine/client-core/src/common/components/MetaTags'
import config from '@xrengine/common/src/config'
import { clientSettingPath } from '@xrengine/common/src/schema.type.module'
import { DomainConfigState } from '@xrengine/engine/src/assets/state/DomainConfigState'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'
import TagManager from '@sooro-io/react-gtm-module'
import { initializei18n } from './util'

const initializeLogs = async () => {
  await waitForClientAuthenticated()
  pipeLogs(API.instance)
}

const initializeGoogleServices = async () => {
  await waitForClientAuthenticated()

  //@ts-ignore
  const clientSettings = await API.instance.service(clientSettingPath).find({})
  const [settings] = clientSettings.data

  // Initialize Google Analytics
  if (settings?.gaMeasurementId) {
    ReactGA.initialize(settings.gaMeasurementId)
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname })
  }

  if (settings?.gtmContainerId) {
    TagManager.initialize({
      gtmId: settings.gtmContainerId,
      auth: settings?.gtmAuth,
      preview: settings?.gtmPreview
    })
  }
}

//@ts-ignore
const publicDomain = import.meta.env.BASE_URL === '/client/' ? location.origin : import.meta.env.BASE_URL!.slice(0, -1) // remove trailing '/'
createHyperStore()
initializei18n()
ClientAPI.createAPI()
initializeLogs()

getMutableState(DomainConfigState).merge({
  publicDomain,
  cloudDomain: config.client.fileServer,
  proxyDomain: config.client.cors.proxyUrl
})

export default function ({ children }): JSX.Element {
  const { t } = useTranslation()

  useEffect(() => {
    initializeGoogleServices()

    const urlSearchParams = new URLSearchParams(window.location.search)
    const redirectUrl = urlSearchParams.get('redirectUrl')
    if (redirectUrl) {
      history.push(redirectUrl)
    }
  }, [])

  return (
    <>
      <MetaTags>
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;600;800&display=swap"
          rel="stylesheet"
        />
      </MetaTags>
      <BrowserRouter history={history}>
        <Suspense
          fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingClient')} />}
        >
          {children}
        </Suspense>
      </BrowserRouter>
    </>
  )
}
