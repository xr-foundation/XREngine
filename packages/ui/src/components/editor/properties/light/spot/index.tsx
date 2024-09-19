import { SpotLightComponent } from '@xrengine/spatial/src/renderer/components/lights/SpotLightComponent'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { LuCircleDot } from 'react-icons/lu'
import { MathUtils as _Math } from 'three'

import { useComponent } from '@xrengine/ecs'
import { EditorComponentType, commitProperty, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import ColorInput from '../../../../../primitives/tailwind/Color'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'
import NodeEditor from '../../nodeEditor'

/**
 * SpotLightNodeEditor component class used to provide editor view for property customization.
 */
export const SpotLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const lightComponent = useComponent(props.entity, SpotLightComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.spotLight.name')}
      description={t('editor:properties.spotLight.description')}
      icon={<SpotLightNodeEditor.iconComponent />}
    >
      <InputGroup name="Color" label={t('editor:properties.spotLight.lbl-color')}>
        <ColorInput
          value={lightComponent.color.value}
          onChange={updateProperty(SpotLightComponent, 'color')}
          onRelease={commitProperty(SpotLightComponent, 'color')}
        />
      </InputGroup>
      <InputGroup name="Intensity" label={t('editor:properties.spotLight.lbl-intensity')}>
        <NumericInput
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={lightComponent.intensity.value}
          onChange={updateProperty(SpotLightComponent, 'intensity')}
          onRelease={commitProperty(SpotLightComponent, 'intensity')}
        />
      </InputGroup>
      <InputGroup name="Penumbra" label={t('editor:properties.spotLight.lbl-penumbra')}>
        <NumericInput
          min={0}
          max={1}
          smallStep={0.01}
          mediumStep={0.1}
          value={lightComponent.penumbra.value}
          onChange={updateProperty(SpotLightComponent, 'penumbra')}
          onRelease={commitProperty(SpotLightComponent, 'penumbra')}
        />
      </InputGroup>
      <InputGroup name="Angle" label={t('editor:properties.spotLight.lbl-angle')}>
        <NumericInput
          min={0}
          max={90}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={_Math.radToDeg(lightComponent.angle.value)}
          onChange={(value) => updateProperty(SpotLightComponent, 'angle')(_Math.degToRad(value))}
          onRelease={(value) => commitProperty(SpotLightComponent, 'angle')(_Math.degToRad(value))}
          unit="°"
        />
      </InputGroup>
      <InputGroup name="Range" label={t('editor:properties.spotLight.lbl-range')}>
        <NumericInput
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={lightComponent.range.value}
          onChange={updateProperty(SpotLightComponent, 'range')}
          onRelease={commitProperty(SpotLightComponent, 'range')}
          unit="m"
        />
      </InputGroup>
      <InputGroup name="Decay" label={t('editor:properties.spotLight.lbl-decay')}>
        <NumericInput
          min={0}
          max={10}
          smallStep={0.1}
          mediumStep={1}
          value={lightComponent.decay.value}
          onChange={updateProperty(SpotLightComponent, 'decay')}
          onRelease={commitProperty(SpotLightComponent, 'decay')}
        />
      </InputGroup>
      {/* <LightShadowProperties entity={props.entity} component={SpotLightComponent} /> */}
    </NodeEditor>
  )
}

SpotLightNodeEditor.iconComponent = LuCircleDot

export default SpotLightNodeEditor
