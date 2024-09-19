import { t } from 'i18next'
import React, { Suspense, useEffect } from 'react'

import '../../engine'

import { RouterState } from '@xrengine/client-core/src/common/services/RouterService'
import Debug from '@xrengine/client-core/src/components/Debug'
import { PopupMenuInline } from '@xrengine/client-core/src/user/components/UserMenu/PopupMenuInline'
import { AuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { userHasAccess } from '@xrengine/client-core/src/user/userHasAccess'
import { EditorPage, useStudioEditor } from '@xrengine/editor/src/pages/EditorPage'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'
import { Route, Routes, useLocation } from 'react-router-dom'

export const EditorRouter = () => {
  const ready = useStudioEditor()

  if (!ready) return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingStudio')} />

  return (
    <Suspense
      fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingStudio')} />}
    >
      <PopupMenuInline />
      <Routes>
        <Route path="*" element={<EditorPage />} />
      </Routes>
    </Suspense>
  )
}

const EditorProtectedRoutes = () => {
  const location = useLocation()
  const authState = useHookstate(getMutableState(AuthState))
  const user = authState.user
  const isAuthorized = useHookstate<boolean | null>(null)

  useEffect(() => {
    if (user.scopes.value) {
      const hasAccess = userHasAccess('editor:write')
      if (!hasAccess) {
        RouterState.navigate('/', { redirectUrl: location.pathname })
        isAuthorized.set(false)
      } else isAuthorized.set(true)
    }
  }, [user.scopes])

  if (!isAuthorized.value) return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.auth')} />

  return (
    <>
      <EditorRouter />
      <Debug />
    </>
  )
}

export default EditorProtectedRoutes
