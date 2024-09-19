import React from 'react'

import { useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty } from '@xrengine/editor/src/components/properties/Util'
import { SDFComponent, SDFMode } from '@xrengine/engine/src/scene/components/SDFComponent'
import { GiExplosionRays } from 'react-icons/gi'
import ColorInput from '../../../../primitives/tailwind/Color'
import BooleanInput from '../../input/Boolean'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'
import Vector3Input from '../../input/Vector3'
import NodeEditor from '../nodeEditor'

export const SDFEditor: EditorComponentType = (props) => {
  const sdfComponent = useComponent(props.entity, SDFComponent)

  return (
    <NodeEditor {...props} name={'SDF'} description={'Raymarching--torus and fog'} icon={<SDFEditor.iconComponent />}>
      <InputGroup name="Add Pass" label={'add pass to postprocess'}>
        <BooleanInput value={sdfComponent.enable.value} onChange={commitProperty(SDFComponent, 'enable')} />
      </InputGroup>
      <InputGroup name="Mode" label="Mode">
        <SelectInput
          value={sdfComponent.mode.value}
          options={[
            { label: 'torus', value: SDFMode.TORUS },
            { label: 'fog', value: SDFMode.FOG }
          ]}
          onChange={commitProperty(SDFComponent, 'mode')}
        />
      </InputGroup>
      <InputGroup name="Color" label="Color">
        <ColorInput
          value={sdfComponent.color.value}
          onChange={commitProperty(SDFComponent, 'color')}
          onRelease={commitProperty(SDFComponent, 'color')}
        />
      </InputGroup>
      <InputGroup name="Scale" label="Scale">
        <Vector3Input value={sdfComponent.scale.value} onChange={commitProperty(SDFComponent, 'scale')} />
      </InputGroup>
    </NodeEditor>
  )
}
SDFEditor.iconComponent = GiExplosionRays
export default SDFEditor
