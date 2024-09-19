import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@xrengine/ecs/src/ComponentFunctions'

import { FaRegFaceFlushed } from 'react-icons/fa6'

import { EntityUUID } from '@xrengine/ecs'
import { EditorComponentType, commitProperty } from '@xrengine/editor/src/components/properties/Util'
import { LookAtComponent } from '@xrengine/spatial/src/transform/components/LookAtComponent'
import BooleanInput from '../../input/Boolean'
import InputGroup from '../../input/Group'
import NodeInput from '../../input/Node'
import NodeEditor from '../nodeEditor'

/**
 * FacerNodeEditor component used to customize the facer element on the scene
 */
export const LookAtNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const lookAtComponent = useComponent(props.entity, LookAtComponent)

  return (
    <NodeEditor
      entity={props.entity}
      component={LookAtComponent}
      name={t('editor:properties.lookAt.name')}
      description={t('editor:properties.lookAt.description')}
      icon={<LookAtNodeEditor.iconComponent />}
    >
      <InputGroup name="Target" label={t('editor:properties.lookAt.target')}>
        <NodeInput
          value={lookAtComponent.target.value ?? ('' as EntityUUID)}
          onRelease={commitProperty(LookAtComponent, 'target')}
          onChange={commitProperty(LookAtComponent, 'target')}
        />
      </InputGroup>
      <InputGroup name="X Axis" label={t('editor:properties.lookAt.xAxis')}>
        <BooleanInput value={lookAtComponent.xAxis.value} onChange={commitProperty(LookAtComponent, 'xAxis')} />
      </InputGroup>
      <InputGroup name="Y Axis" label={t('editor:properties.lookAt.yAxis')}>
        <BooleanInput value={lookAtComponent.yAxis.value} onChange={commitProperty(LookAtComponent, 'yAxis')} />
      </InputGroup>
    </NodeEditor>
  )
}

LookAtNodeEditor.iconComponent = FaRegFaceFlushed

export default LookAtNodeEditor
