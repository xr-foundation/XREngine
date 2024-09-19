import { PanelDragContainer, PanelTitle } from '@xrengine/ui/src/components/editor/layout/Panel'
import { TabData } from 'rc-dock'
import React from 'react'
import { useTranslation } from 'react-i18next'
import FileBrowser from './filebrowser'

const FilesPanelTitle = () => {
  const { t } = useTranslation()
  return (
    <PanelDragContainer>
      <PanelTitle>{t('editor:layout.filebrowser.tab-name')}</PanelTitle>
    </PanelDragContainer>
  )
}

export const FilesPanelTab: TabData = {
  id: 'filesPanel',
  closable: true,
  title: <FilesPanelTitle />,
  content: <FileBrowser />
}
