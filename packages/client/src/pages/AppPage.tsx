
// import * as chapiWalletPolyfill from 'credential-handler-polyfill'

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { initGA, logPageView } from '@xrengine/client-core/src/common/analytics'
import { NotificationSnackbar } from '@xrengine/client-core/src/common/services/NotificationService'
import { useSearchParamState } from '@xrengine/client-core/src/common/services/RouterService'
import { useThemeProvider } from '@xrengine/client-core/src/common/services/ThemeService'
import InviteToast from '@xrengine/client-core/src/components/InviteToast'
import { LoadWebappInjection } from '@xrengine/client-core/src/components/LoadWebappInjection'
import { useAuthenticated } from '@xrengine/client-core/src/user/services/AuthService'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'

import './mui.styles.scss' /** @todo Remove when MUI is removed */
import './styles.scss'

const AppPage = (props: { children: React.ReactNode }) => {
  const { t } = useTranslation()
  const isLoggedIn = useAuthenticated()

  useEffect(() => {
    initGA()
    logPageView()
  }, [])

  useThemeProvider()

  useSearchParamState()

  if (!isLoggedIn) {
    return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingApp')} />
  }

  return (
    <>
      <NotificationSnackbar />
      <LoadWebappInjection>{props.children}</LoadWebappInjection>
      <InviteToast />
    </>
  )
}

export default AppPage
