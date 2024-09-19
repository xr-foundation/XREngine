
import { useTranslation } from 'react-i18next'

import { Component, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { EditorComponentType, commitProperty, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import React from 'react'
import BooleanInput from '../../../input/Boolean'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'

/**creating properties for LightShadowProperties component */
type LightShadowPropertiesProps = {
  entity: Entity
  component: Component<any, any>
}

/**
 * OnChangeShadowMapResolution used to customize properties of LightShadowProperties
 * Used with LightNodeEditors.
 */
export const LightShadowProperties: EditorComponentType = (props: LightShadowPropertiesProps) => {
  const { t } = useTranslation()

  const lightComponent = useComponent(props.entity, props.component) as any

  return (
    <>
      <InputGroup name="Cast Shadows" label={t('editor:properties.directionalLight.lbl-castShadows')}>
        <BooleanInput
          value={lightComponent.castShadow.value}
          onChange={commitProperty(props.component, 'castShadow')}
        />
      </InputGroup>
      <InputGroup name="Shadow Bias" label={t('editor:properties.directionalLight.lbl-shadowBias')}>
        <NumericInput
          max={0.001}
          min={-0.001}
          mediumStep={0.0000001}
          smallStep={0.000001}
          largeStep={0.0001}
          displayPrecision={0.000001}
          value={lightComponent.shadowBias.value}
          onChange={updateProperty(props.component, 'shadowBias')}
          onRelease={commitProperty(props.component, 'shadowBias')}
        />
      </InputGroup>
      <InputGroup name="Shadow Radius" label={t('editor:properties.directionalLight.lbl-shadowRadius')}>
        <NumericInput
          mediumStep={0.01}
          smallStep={0.1}
          largeStep={1}
          displayPrecision={0.0001}
          value={lightComponent.shadowRadius.value}
          onChange={updateProperty(props.component, 'shadowRadius')}
          onRelease={commitProperty(props.component, 'shadowRadius')}
        />
      </InputGroup>
    </>
  )
}

export default LightShadowProperties
