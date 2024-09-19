import { TabData } from 'rc-dock'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { PanelDragContainer, PanelTitle } from '../../layout/Panel'
import AssetsPanel from './container'

export const AssetsPanelTitle = () => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer>
        <PanelTitle>
          <span>{'Assets'}</span>
        </PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export default AssetsPanelTitle

export const AssetsPanelTab: TabData = {
  id: 'assetsPanel',
  closable: true,
  title: <AssetsPanelTitle />,
  content: <AssetsPanel />
}
