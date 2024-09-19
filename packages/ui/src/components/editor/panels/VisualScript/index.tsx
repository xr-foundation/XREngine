
import { TabData } from 'rc-dock'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { PanelDragContainer, PanelTitle } from '../../layout/Panel'
import VisualScriptPanel from './container'

export const VisualScriptPanelTitle = () => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer>
        <PanelTitle>
          <span>{'VisualScript'}</span>
        </PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export default VisualScriptPanelTitle

export const VisualScriptPanelTab: TabData = {
  id: 'visualScriptPanel',
  closable: true,
  title: <VisualScriptPanelTitle />,
  content: <VisualScriptPanel />
}
