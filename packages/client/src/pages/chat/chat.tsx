import { t } from 'i18next'
import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import '../../engine'

import Debug from '@xrengine/client-core/src/components/Debug'
import { ChatPage } from '@xrengine/ui/src/pages/Chat/chat'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'

export default function Chat() {
  return (
    <>
      <Suspense
        fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingLocation')} />}
      >
        <Routes>
          <Route path="*" element={<ChatPage />} />
        </Routes>
      </Suspense>
      <Debug />
    </>
  )
}
