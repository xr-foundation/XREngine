import { useFind } from '@xrengine/common'
import { clientSettingPath } from '@xrengine/common/src/schema.type.module'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const Custom503 = (): any => {
  console.log('503')
  const { t } = useTranslation()
  const clientSettingQuery = useFind(clientSettingPath)
  const clientSetting = clientSettingQuery.data[0]
  return (
    <>
      <h1 style={{ color: 'black' }}>{t('503.msg')}</h1>
      <img
        style={{
          height: 'auto',
          maxWidth: '100%'
        }}
        src={clientSetting?.appTitle}
      />
    </>
  )
}

export default Custom503
