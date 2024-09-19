
import { TabData } from 'rc-dock'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Tooltip from '../../../../primitives/tailwind/Tooltip'
import { PanelDragContainer, PanelTitle } from '../../layout/Panel'
import PropertiesPanelContainer from './container'

export const PropertiesPanelTitle = () => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer>
        <PanelTitle>
          <Tooltip content={t('editor:properties.info')}>{t('editor:properties.title')}</Tooltip>
        </PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export const PropertiesPanelTab: TabData = {
  id: 'propertiesPanel',
  closable: true,
  cached: true,
  title: <PropertiesPanelTitle />,
  content: <PropertiesPanelContainer />
}

export default PropertiesPanelTitle
