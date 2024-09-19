
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent, getMutableComponent, hasComponent, useComponent, UUIDComponent } from '@xrengine/ecs'
import { commitProperty, EditorComponentType, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@xrengine/editor/src/functions/EditorControlFunctions'
import { InteractableComponent } from '@xrengine/engine/src/interaction/components/InteractableComponent'
import { MountPoint, MountPointComponent } from '@xrengine/engine/src/scene/components/MountPointComponent'
import { NO_PROXY } from '@xrengine/hyperflux'
import { LuUsers2 } from 'react-icons/lu'
import { Vector3 } from 'three'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'
import Vector3Input from '../../input/Vector3'
import NodeEditor from '../nodeEditor'

/**
 * MountPointNodeEditor component used to provide the editor view to customize Mount Point properties.
 *
 * @type {Class component}
 */
export const MountPointNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const mountComponent = useComponent(props.entity, MountPointComponent)
  const onChangeOffset = (value: Vector3) => {
    getMutableComponent(props.entity, MountPointComponent).dismountOffset.set(value)
  }
  useEffect(() => {
    if (!hasComponent(props.entity, InteractableComponent)) {
      const mountPoint = getComponent(props.entity, MountPointComponent)
      EditorControlFunctions.addOrRemoveComponent([props.entity], InteractableComponent, true, {
        label: MountPointComponent.mountPointInteractMessages[mountPoint.type],
        callbacks: [
          {
            callbackID: MountPointComponent.mountCallbackName,
            target: getComponent(props.entity, UUIDComponent)
          }
        ]
      })
    }
  }, [])
  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.mountPoint.name')}
      description={t('editor:properties.mountPoint.description')}
      icon={<MountPointNodeEditor.iconComponent />}
    >
      <InputGroup name="Mount Type" label={t('editor:properties.mountPoint.lbl-type')}>
        <SelectInput // we dont know the options and the component for this
          key={props.entity}
          value={mountComponent.type.value}
          options={Object.entries(MountPoint).map(([key, value]) => ({ label: key, value }))}
          onChange={commitProperty(MountPointComponent, 'type')}
        />
      </InputGroup>
      <InputGroup name="Dismount Offset" label={t('editor:properties.mountPoint.lbl-dismount')}>
        <Vector3Input
          value={mountComponent.dismountOffset.get(NO_PROXY)}
          onChange={updateProperty(MountPointComponent, 'dismountOffset')}
          onRelease={commitProperty(MountPointComponent, 'dismountOffset')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

MountPointNodeEditor.iconComponent = LuUsers2

export default MountPointNodeEditor
