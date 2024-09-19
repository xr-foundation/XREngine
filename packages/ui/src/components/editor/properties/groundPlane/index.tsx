
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaSquareFull } from 'react-icons/fa6'

import { useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import { GroundPlaneComponent } from '@xrengine/engine/src/scene/components/GroundPlaneComponent'
import { BooleanInput } from '@xrengine/ui/src/components/editor/input/Boolean'
import ColorInput from '../../../../primitives/tailwind/Color'
import InputGroup from '../../input/Group'
import NodeEditor from '../nodeEditor'

export const GroundPlaneNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const groundPlaneComponent = useComponent(props.entity, GroundPlaneComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.groundPlane.name')}
      description={t('editor:properties.groundPlane.description')}
      icon={<GroundPlaneNodeEditor.iconComponent />}
    >
      <InputGroup name="Color" label={t('editor:properties.groundPlane.lbl-color')}>
        <ColorInput
          sketchPickerClassName="mt-2"
          value={groundPlaneComponent.color.value}
          onChange={updateProperty(GroundPlaneComponent, 'color')}
          onRelease={commitProperty(GroundPlaneComponent, 'color')}
        />
      </InputGroup>
      <InputGroup
        name="Visible"
        label={t('editor:properties.groundPlane.lbl-visible')}
        info={t('editor:properties.groundPlane.info-visible')}
      >
        <BooleanInput
          value={groundPlaneComponent.visible.value}
          onChange={commitProperty(GroundPlaneComponent, 'visible')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

GroundPlaneNodeEditor.iconComponent = FaSquareFull

export default GroundPlaneNodeEditor
