import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@xrengine/ecs/src/ComponentFunctions'

import { MdIntegrationInstructions } from 'react-icons/md'

import { EditorComponentType, commitProperty } from '@xrengine/editor/src/components/properties/Util'
import { VisualScriptComponent } from '@xrengine/engine'
import { BooleanInput } from '@xrengine/ui/src/components/editor/input/Boolean'
import InputGroup from '../../input/Group'
import { NodeEditor } from '../nodeEditor'

export const VisualScriptNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const visualScriptComponent = useComponent(props.entity, VisualScriptComponent)

  return (
    <NodeEditor
      {...props}
      name={'Visual Script Component'}
      description={' Adds a visual script to the entity'}
      icon={<VisualScriptNodeEditor.iconComponent />}
    >
      <InputGroup name="Disable Visual Script" label="Disable Visual Script">
        <BooleanInput
          value={visualScriptComponent.disabled.value}
          onChange={commitProperty(VisualScriptComponent, 'disabled')}
        />
      </InputGroup>
      <InputGroup name="Play Visual Script" label="Play Visual Script">
        <BooleanInput value={visualScriptComponent.run.value} onChange={commitProperty(VisualScriptComponent, 'run')} />
      </InputGroup>
    </NodeEditor>
  )
}

VisualScriptNodeEditor.iconComponent = MdIntegrationInstructions

export default VisualScriptNodeEditor
