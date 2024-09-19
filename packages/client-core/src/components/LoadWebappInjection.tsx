import { useHookstate } from '@hookstate/core'
import { useFind } from '@xrengine/common'
import config from '@xrengine/common/src/config'
import { clientSettingPath } from '@xrengine/common/src/schema.type.module'
import { NO_PROXY } from '@xrengine/hyperflux'
import { loadWebappInjection } from '@xrengine/projects/loadWebappInjection'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const LoadWebappInjection = (props: { children: React.ReactNode }) => {
  const { t } = useTranslation()

  const clientSettingQuery = useFind(clientSettingPath)
  const clientSettings = clientSettingQuery.data[0] ?? null
  useEffect(() => {
    config.client.key8thWall = clientSettings?.key8thWall
    config.client.mediaSettings = clientSettings?.mediaSettings
  }, [clientSettings])

  const projectComponents = useHookstate(null as null | any[])

  useEffect(() => {
    loadWebappInjection().then((result) => {
      projectComponents.set(result)
    })
  }, [])

  if (!projectComponents.value)
    return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.authenticating')} />

  return (
    <>
      {projectComponents.get(NO_PROXY)!.map((Component, i) => (
        <Component key={i} />
      ))}
      {props.children}
    </>
  )
}
