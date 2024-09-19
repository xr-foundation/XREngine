import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaClone } from 'react-icons/fa6'

import { useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { ShadowComponent } from '@xrengine/engine/src/scene/components/ShadowComponent'

import { EditorComponentType, commitProperty } from '@xrengine/editor/src/components/properties/Util'
import { BooleanInput } from '@xrengine/ui/src/components/editor/input/Boolean'
import InputGroup from '../../input/Group'
import NodeEditor from '../nodeEditor'

/**
 * ShadowProperties used to create editor view for the properties of ModelNode.
 */
export const ShadowNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const shadowComponent = useComponent(props.entity, ShadowComponent)
  return (
    <NodeEditor
      name={t('editor:properties.shadow.name')}
      component={ShadowComponent}
      description={t('editor:properties.shadow.description')}
      icon={<ShadowNodeEditor.iconComponent />}
      {...props}
    >
      <InputGroup name="Cast Shadow" label={t('editor:properties.shadow.lbl-castShadow')}>
        <BooleanInput value={shadowComponent.cast.value} onChange={commitProperty(ShadowComponent, 'cast')} />
      </InputGroup>
      <InputGroup name="Receive Shadow" label={t('editor:properties.shadow.lbl-receiveShadow')}>
        <BooleanInput value={shadowComponent.receive.value} onChange={commitProperty(ShadowComponent, 'receive')} />
      </InputGroup>
    </NodeEditor>
  )
}

ShadowNodeEditor.iconComponent = FaClone
export default ShadowNodeEditor
