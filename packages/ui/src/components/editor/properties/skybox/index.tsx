
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiCloud } from 'react-icons/fi'

import { useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { getEntityErrors } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { SkyboxComponent } from '@xrengine/engine/src/scene/components/SkyboxComponent'
import { SkyTypeEnum } from '@xrengine/engine/src/scene/constants/SkyTypeEnum'

import {
  EditorComponentType,
  commitProperties,
  commitProperty,
  updateProperty
} from '@xrengine/editor/src/components/properties/Util'
import ColorInput from '../../../../primitives/tailwind/Color'
import Slider from '../../../../primitives/tailwind/Slider'
import FolderInput from '../../input/Folder'
import InputGroup from '../../input/Group'
import ImageInput from '../../input/Image'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import NodeEditor from '../nodeEditor'

const hoursToRadians = (hours: number) => hours / 24
const radiansToHours = (rads: number) => rads * 24

const SkyOptions = [
  {
    label: 'Color',
    value: SkyTypeEnum.color.toString()
  },
  {
    label: 'Skybox',
    value: SkyTypeEnum.skybox.toString()
  },
  {
    label: 'Cubemap',
    value: SkyTypeEnum.cubemap.toString()
  },
  {
    label: 'Equirectangular',
    value: SkyTypeEnum.equirectangular.toString()
  }
]

/**
 * SkyboxNodeEditor component class used to render editor view to customize component property.
 */
export const SkyboxNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
  const hasError = getEntityErrors(entity, SkyboxComponent)
  const skyboxComponent = useComponent(entity, SkyboxComponent)

  const onChangeEquirectangularPathOption = (equirectangularPath) => {
    if (equirectangularPath !== skyboxComponent.equirectangularPath.value) {
      commitProperties(SkyboxComponent, { equirectangularPath })
    }
  }

  const onChangeCubemapPathOption = (path: string) => {
    const directory = path[path.length - 1] === '/' ? path.substring(0, path.length - 1) : path
    if (directory !== skyboxComponent.cubemapPath.value) {
      commitProperties(SkyboxComponent, { cubemapPath: directory })
    }
  }

  const renderSkyboxSettings = () => (
    <>
      <InputGroup name="Time of Day" label={t('editor:properties.skybox.lbl-timeOfDay')}>
        <NumericInput
          smallStep={0.1}
          mediumStep={0.5}
          largeStep={1}
          min={0}
          max={24}
          value={radiansToHours(skyboxComponent.skyboxProps.azimuth.value)}
          onChange={(value) => updateProperty(SkyboxComponent, 'skyboxProps.azimuth' as any)(hoursToRadians(value))}
          onRelease={(value) => commitProperty(SkyboxComponent, 'skyboxProps.azimuth' as any)(hoursToRadians(value))}
          unit="h"
        />
      </InputGroup>
      <InputGroup name="Latitude" label={t('editor:properties.skybox.lbl-latitude')}>
        <NumericInput
          min={-90}
          max={90}
          smallStep={0.1}
          mediumStep={0.5}
          largeStep={1}
          value={skyboxComponent.skyboxProps.inclination.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.inclination' as any)}
          onRelease={commitProperty(SkyboxComponent, 'skyboxProps.inclination' as any)}
        />
      </InputGroup>
      <InputGroup name="Luminance" label={t('editor:properties.skybox.lbl-luminance')} className="w-auto">
        <Slider
          min={0.001}
          max={1}
          step={0.001}
          value={skyboxComponent.skyboxProps.luminance.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.luminance' as any)}
          onRelease={commitProperty(SkyboxComponent, 'skyboxProps.luminance' as any)}
        />
      </InputGroup>
      <InputGroup name="Scattering Amount" label={t('editor:properties.skybox.lbl-scattering')} className="w-auto">
        <Slider
          min={0}
          max={0.1}
          step={0.001}
          value={skyboxComponent.skyboxProps.mieCoefficient.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.mieCoefficient' as any)}
          onRelease={commitProperty(SkyboxComponent, 'skyboxProps.mieCoefficient' as any)}
        />
      </InputGroup>
      <InputGroup
        name="Scattering Distance"
        label={t('editor:properties.skybox.lbl-scatteringDistance')}
        className="w-auto"
      >
        <Slider
          min={0}
          max={1}
          step={0.001}
          value={skyboxComponent.skyboxProps.mieDirectionalG.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.mieDirectionalG' as any)}
          onRelease={commitProperty(SkyboxComponent, 'skyboxProps.mieDirectionalG' as any)}
        />
      </InputGroup>
      <InputGroup name="Horizon Start" label={t('editor:properties.skybox.lbl-horizonStart')} className="w-auto">
        <Slider
          min={1}
          max={20}
          value={skyboxComponent.skyboxProps.turbidity.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.turbidity' as any)}
          onRelease={commitProperty(SkyboxComponent, 'skyboxProps.turbidity' as any)}
        />
      </InputGroup>
      <InputGroup name="Horizon End" label={t('editor:properties.skybox.lbl-horizonEnd')} className="w-auto">
        <Slider
          min={0}
          max={4}
          value={skyboxComponent.skyboxProps.rayleigh.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.rayleigh' as any)}
          onRelease={commitProperty(SkyboxComponent, 'skyboxProps.rayleigh' as any)}
        />
      </InputGroup>
    </>
  )

  // creating editor view for equirectangular Settings
  const renderEquirectangularSettings = () => (
    <InputGroup name="Texture" label={t('editor:properties.skybox.lbl-texture')}>
      <ImageInput value={skyboxComponent.equirectangularPath.value} onRelease={onChangeEquirectangularPathOption} />
      {hasError && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.skybox.error-url')}</div>}
    </InputGroup>
  )

  // creating editor view for cubemap Settings
  const renderCubemapSettings = () => (
    <InputGroup name="Texture" label={t('editor:properties.skybox.lbl-texture')}>
      <FolderInput value={skyboxComponent.cubemapPath.value} onRelease={onChangeCubemapPathOption} />
      {hasError && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.skybox.error-url')}</div>}
    </InputGroup>
  )

  // creating editor view for color Settings
  const renderColorSettings = () => (
    <InputGroup name="Color" label={t('editor:properties.skybox.lbl-color')}>
      <ColorInput
        value={skyboxComponent.backgroundColor.value}
        onChange={updateProperty(SkyboxComponent, 'backgroundColor')}
        onRelease={commitProperty(SkyboxComponent, 'backgroundColor')}
      />
    </InputGroup>
  )

  // creating editor view for skybox Properties
  const renderSkyBoxProps = () => {
    switch (skyboxComponent.backgroundType.value) {
      case SkyTypeEnum.equirectangular:
        return renderEquirectangularSettings()
      case SkyTypeEnum.cubemap:
        return renderCubemapSettings()
      case SkyTypeEnum.color:
        return renderColorSettings()
      default:
        return renderSkyboxSettings()
    }
  }

  return (
    <NodeEditor
      name={t('editor:properties.skybox.name')}
      description={t('editor:properties.skybox.description')}
      icon={<SkyboxNodeEditor.iconComponent />}
      {...props}
    >
      <InputGroup name="Sky Type" label={t('editor:properties.skybox.lbl-skyType')}>
        <SelectInput
          key={props.entity}
          options={SkyOptions}
          value={skyboxComponent.backgroundType.value.toString()}
          onChange={(value) => commitProperty(SkyboxComponent, 'backgroundType')(parseInt(value as string, 10))}
        />
      </InputGroup>
      {renderSkyBoxProps()}
    </NodeEditor>
  )
}

SkyboxNodeEditor.iconComponent = FiCloud

export default SkyboxNodeEditor
