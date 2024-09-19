
import { useComponent } from '@xrengine/ecs'
import { EditorComponentType } from '@xrengine/editor/src/components/properties/Util'
import { SpawnPointComponent } from '@xrengine/engine/src/scene/components/SpawnPointComponent'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { RiCameraLensFill } from 'react-icons/ri'
import NodeEditor from '../nodeEditor'

/**
 * SpawnPointNodeEditor component used to provide the editor view to customize Spawn Point properties.
 */
export const SpawnPointNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const spawnComponent = useComponent(props.entity, SpawnPointComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.spawnPoint.name')}
      description={t('editor:properties.spawnPoint.description')}
      icon={<SpawnPointNodeEditor.iconComponent />}
    ></NodeEditor>
  )
}

SpawnPointNodeEditor.iconComponent = RiCameraLensFill

export default SpawnPointNodeEditor
