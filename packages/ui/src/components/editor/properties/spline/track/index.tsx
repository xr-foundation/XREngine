
import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { SplineTrackComponent } from '@xrengine/engine/src/scene/components/SplineTrackComponent'
import { MdCameraswitch } from 'react-icons/md'

import { UUIDComponent } from '@xrengine/ecs'
import { useQuery } from '@xrengine/ecs/src/QueryFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import { SplineComponent } from '@xrengine/engine/src/scene/components/SplineComponent'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { BooleanInput } from '@xrengine/ui/src/components/editor/input/Boolean'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'
import SelectInput from '../../../input/Select'
import { Vector3Scrubber } from '../../../input/Vector3'
import NodeEditor from '../../nodeEditor'

/**
 * SplineTrackNodeEditor adds rotation editing to splines.
 *
 * @param       {Object} props
 * @constructor
 */

export const SplineTrackNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const component = useComponent(props.entity, SplineTrackComponent)
  const velocity = component.velocity
  const alpha = component.velocity

  const availableSplines = useQuery([SplineComponent]).map((entity) => {
    const name = getComponent(entity, NameComponent)
    const uuid = getComponent(entity, UUIDComponent)
    return {
      label: name,
      value: uuid
    }
  })

  // @todo allow these to be passed in or remove this capability

  const setAlpha = (value) => {
    component.alpha.set(value)
  }

  return (
    <NodeEditor
      description={t('editor:properties.splinetrack.description')}
      icon={<SplineTrackNodeEditor.iconComponent />}
      {...props}
    >
      <InputGroup name="Spline" label={t('editor:properties.splinetrack.lbl-spline')}>
        <SelectInput
          key={props.entity}
          options={availableSplines}
          value={component.splineEntityUUID.value!}
          onChange={commitProperty(SplineTrackComponent, 'splineEntityUUID') as any}
        />
      </InputGroup>
      <InputGroup name="Velocity" label={t('editor:properties.splinetrack.lbl-velocity')}>
        <NumericInput
          value={velocity.value}
          onChange={updateProperty(SplineTrackComponent, 'velocity')}
          onRelease={commitProperty(SplineTrackComponent, 'velocity')}
          prefix={
            <Vector3Scrubber
              value={velocity.value}
              onChange={updateProperty(SplineTrackComponent, 'velocity')}
              onPointerUp={commitProperty(SplineTrackComponent, 'velocity')}
            />
          }
        />
      </InputGroup>
      <InputGroup name="Enable Rotation" label={t('editor:properties.splinetrack.lbl-enableRotation')}>
        <BooleanInput
          value={component.enableRotation.value}
          onChange={commitProperty(SplineTrackComponent, 'enableRotation')}
        />
      </InputGroup>
      <InputGroup name="Lock XZ" label={t('editor:properties.splinetrack.lbl-lockXZ')}>
        <BooleanInput
          value={component.lockToXZPlane.value}
          onChange={commitProperty(SplineTrackComponent, 'lockToXZPlane')}
        />
      </InputGroup>
      <InputGroup name="Loop" label={t('editor:properties.splinetrack.lbl-loop')}>
        <BooleanInput value={component.loop.value} onChange={commitProperty(SplineTrackComponent, 'loop')} />
      </InputGroup>
    </NodeEditor>
  )
}

SplineTrackNodeEditor.iconComponent = MdCameraswitch

export default SplineTrackNodeEditor
