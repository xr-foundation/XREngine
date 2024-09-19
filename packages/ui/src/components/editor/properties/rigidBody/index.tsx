import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdPanTool } from 'react-icons/md'

import { camelCaseToSpacedString } from '@xrengine/common/src/utils/camelCaseToSpacedString'
import { useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty } from '@xrengine/editor/src/components/properties/Util'
import { RigidBodyComponent } from '@xrengine/spatial/src/physics/components/RigidBodyComponent'
import { BodyTypes } from '@xrengine/spatial/src/physics/types/PhysicsTypes'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'
import NodeEditor from '../nodeEditor'

const bodyTypeOptions = Object.entries(BodyTypes).map(([label, value]) => {
  return { label: camelCaseToSpacedString(label as string), value }
})

export const RigidBodyComponentEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const rigidbodyComponent = useComponent(props.entity, RigidBodyComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.rigidbody.name')}
      description={t('editor:properties.rigidbody.description')}
      icon={<RigidBodyComponentEditor.iconComponent />}
    >
      <InputGroup name="Type" label={t('editor:properties.rigidbody.lbl-type')}>
        <SelectInput
          options={bodyTypeOptions}
          value={rigidbodyComponent.type.value}
          onChange={commitProperty(RigidBodyComponent, 'type')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

RigidBodyComponentEditor.iconComponent = MdPanTool

export default RigidBodyComponentEditor
