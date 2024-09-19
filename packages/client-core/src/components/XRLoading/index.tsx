import React from 'react'
import { useTranslation } from 'react-i18next'

import { useMutableState } from '@xrengine/hyperflux'
import { XRState } from '@xrengine/spatial/src/xr/XRState'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'

export const XRLoading = () => {
  const { t } = useTranslation()
  const xrState = useMutableState(XRState)
  return xrState.requestingSession.value ? (
    <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingXRSystems')} />
  ) : (
    <></>
  )
}
