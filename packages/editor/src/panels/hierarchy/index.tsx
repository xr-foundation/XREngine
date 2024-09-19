import { useOptionalComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { EditorState } from '@xrengine/editor/src/services/EditorServices'
import { GLTFSnapshotState } from '@xrengine/engine/src/gltf/GLTFState'
import { SourceComponent } from '@xrengine/engine/src/scene/components/SourceComponent'
import { useMutableState } from '@xrengine/hyperflux'
import { PanelDragContainer, PanelTitle } from '@xrengine/ui/src/components/editor/layout/Panel'
import { TabData } from 'rc-dock'
import React from 'react'
import { useTranslation } from 'react-i18next'
import HierarchyTreeContextMenu from './contextmenu'
import { Contents, Topbar } from './hierarchytree'
import { HierarchyPanelProvider } from './hooks'

const HierarchyPanelTitle = () => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer>
        <PanelTitle>{t('editor:hierarchy.lbl')}</PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export const HierarchyPanelTab: TabData = {
  id: 'hierarchyPanel',
  closable: true,
  title: <HierarchyPanelTitle />,
  content: <HierarchyPanelWrapper />
}

function HierarchyPanelWrapper() {
  const { scenePath, rootEntity } = useMutableState(EditorState).value
  const sourceId = useOptionalComponent(rootEntity, SourceComponent)?.value

  if (!scenePath || !rootEntity || !sourceId) return null

  return <HierarchyPanel sourceId={sourceId} />
}

function HierarchyPanel({ sourceId }: { sourceId: string }) {
  const index = GLTFSnapshotState.useSnapshotIndex(sourceId)
  if (index === undefined) return null

  return (
    <HierarchyPanelProvider>
      <Topbar />
      <Contents />
      <HierarchyTreeContextMenu />
    </HierarchyPanelProvider>
  )
}
