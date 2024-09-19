
import React from 'react'
import { useTranslation } from 'react-i18next'

import { DirectionalLightComponent } from '@xrengine/spatial/src/renderer/components/lights/DirectionalLightComponent'

import { BsLightning } from 'react-icons/bs'

import { useComponent } from '@xrengine/ecs'
import { EditorComponentType, commitProperty, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import ColorInput from '../../../../../primitives/tailwind/Color'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'
import NodeEditor from '../../nodeEditor'
import LightShadowProperties from '../shadowProperties'

/**
 * DirectionalLightNodeEditor is used provides  properties to customize DirectionaLight element.
 */
export const DirectionalLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const lightComponent = useComponent(props.entity, DirectionalLightComponent).value

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.directionalLight.name')}
      description={t('editor:properties.directionalLight.description')}
      icon={<DirectionalLightNodeEditor.iconComponent />}
    >
      <InputGroup name="Color" label={t('editor:properties.directionalLight.lbl-color')}>
        <ColorInput
          className="bg-[#1A1A1A]"
          value={lightComponent.color}
          onChange={updateProperty(DirectionalLightComponent, 'color')}
          onRelease={commitProperty(DirectionalLightComponent, 'color')}
        />
      </InputGroup>
      <InputGroup name="Intensity" label={t('editor:properties.directionalLight.lbl-intensity')}>
        <NumericInput
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={lightComponent.intensity}
          onChange={updateProperty(DirectionalLightComponent, 'intensity')}
          onRelease={commitProperty(DirectionalLightComponent, 'intensity')}
          unit="cd"
        />
      </InputGroup>
      <LightShadowProperties entity={props.entity} component={DirectionalLightComponent} />
      <InputGroup name="Camera Near" label={t('editor:properties.directionalLight.lbl-cameraNear')}>
        <NumericInput
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={lightComponent.cameraFar}
          onChange={updateProperty(DirectionalLightComponent, 'cameraFar')}
          onRelease={commitProperty(DirectionalLightComponent, 'cameraFar')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

DirectionalLightNodeEditor.iconComponent = BsLightning

export default DirectionalLightNodeEditor
