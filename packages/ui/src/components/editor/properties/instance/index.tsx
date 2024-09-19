import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdScatterPlot } from 'react-icons/md'

import { useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { EditorComponentType } from '@xrengine/editor/src/components/properties/Util'
import { InstancingComponent } from '@xrengine/engine/src/scene/components/InstancingComponent'
import NodeEditor from '../nodeEditor'

export const InstancingNodeEditor: EditorComponentType = (props: { entity: Entity }) => {
  const { t } = useTranslation()
  const entity = props.entity

  const instancingComponent = useComponent(entity, InstancingComponent)

  return (
    <NodeEditor
      name={t('editor:properties.instancing.name')}
      description={t('editor:properties.instancing.description')}
      icon={<InstancingNodeEditor.iconComponent />}
      {...props}
    ></NodeEditor>
  )
}

InstancingNodeEditor.iconComponent = MdScatterPlot

export default InstancingNodeEditor
