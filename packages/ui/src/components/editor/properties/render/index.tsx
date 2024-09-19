import { EntityUUID, UUIDComponent, useQuery } from '@xrengine/ecs'
import { ComponentType, getComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import { GLTFNodeState, GLTFSnapshotAction } from '@xrengine/engine/src/gltf/GLTFDocumentState'
import { GLTFSnapshotState } from '@xrengine/engine/src/gltf/GLTFState'
import { RenderSettingsComponent } from '@xrengine/engine/src/scene/components/RenderSettingsComponent'
import { SourceComponent } from '@xrengine/engine/src/scene/components/SourceComponent'
import { State, dispatchAction } from '@xrengine/hyperflux'
import { DirectionalLightComponent } from '@xrengine/spatial'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SiRender } from 'react-icons/si'
import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  CineonToneMapping,
  LinearToneMapping,
  NoToneMapping,
  PCFShadowMap,
  PCFSoftShadowMap,
  ReinhardToneMapping,
  VSMShadowMap
} from 'three'
import Slider from '../../../../primitives/tailwind/Slider'
import BooleanInput from '../../input/Boolean'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'
import PropertyGroup from '../group'

const ToneMappingOptions = [
  {
    label: 'No Tone Mapping',
    value: NoToneMapping
  },
  {
    label: 'Linear Tone Mapping',
    value: LinearToneMapping
  },
  {
    label: 'Reinhard Tone Mapping',
    value: ReinhardToneMapping
  },
  {
    label: 'Cineon Tone Mapping',
    value: CineonToneMapping
  },
  {
    label: 'ACES Filmic Tone Mapping',
    value: ACESFilmicToneMapping
  }
]

/**
 * ShadowTypeOptions array containing shadow type options.
 *
 * @type {Array}
 */
const ShadowTypeOptions = [
  {
    label: 'No Shadow Map',
    value: -1
  },
  {
    label: 'Basic Shadow Map',
    value: BasicShadowMap
  },
  {
    label: 'PCF Shadow Map',
    value: PCFShadowMap
  },
  {
    label: 'PCF Soft Shadow Map',
    value: PCFSoftShadowMap
  },
  {
    label: 'VSM Shadow Map',
    value: VSMShadowMap
  }
]

export const RenderSettingsEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const { entity } = props
  const rendererSettingsState = useComponent(entity, RenderSettingsComponent)

  const directionalLightOptions = [
    {
      label: 'None',
      value: '' as EntityUUID
    }
  ].concat(
    useQuery([DirectionalLightComponent, SourceComponent]).map((entity) => {
      return {
        label: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent)
      }
    })
  )

  useEffect(() => {
    if (!UUIDComponent.getEntityByUUID(rendererSettingsState.primaryLight.value)) {
      const source = getComponent(entity, SourceComponent)
      const node = GLTFNodeState.getMutableNode(entity)
      const renderSettingsExt = node.extensions[RenderSettingsComponent.jsonID] as State<
        ComponentType<typeof RenderSettingsComponent>
      >
      if (!renderSettingsExt.primaryLight.value) return
      renderSettingsExt.merge({
        csm: false,
        primaryLight: '' as EntityUUID
      })
      const snapshot = GLTFSnapshotState.cloneCurrentSnapshot(source)
      dispatchAction(GLTFSnapshotAction.createSnapshot(snapshot))
    }
  }, [rendererSettingsState.primaryLight])

  return (
    <PropertyGroup
      name={t('editor:properties.renderSettings.name')}
      description={t('editor:properties.renderSettings.description')}
      icon={<RenderSettingsEditor.iconComponent />}
    >
      <InputGroup
        name="Primary Light"
        label={t('editor:properties.renderSettings.lbl-primaryLight')}
        info={t('editor:properties.renderSettings.info-primaryLight')}
      >
        <SelectInput
          options={directionalLightOptions}
          value={rendererSettingsState.primaryLight.value}
          onChange={commitProperty(RenderSettingsComponent, 'primaryLight')}
        />
      </InputGroup>
      <InputGroup
        name="Use Cascading Shadow Maps"
        label={t('editor:properties.renderSettings.lbl-csm')}
        info={t('editor:properties.renderSettings.info-csm')}
      >
        <BooleanInput
          value={rendererSettingsState.csm.value}
          onChange={commitProperty(RenderSettingsComponent, 'csm')}
        />
      </InputGroup>
      {rendererSettingsState.csm.value === true ? (
        <InputGroup
          name="Cascades"
          label={t('editor:properties.renderSettings.lbl-csm-cascades')}
          info={t('editor:properties.renderSettings.info-csm-cascades')}
          className="w-auto"
        >
          <Slider
            min={1}
            max={5}
            step={1}
            value={rendererSettingsState.cascades.value}
            onChange={updateProperty(RenderSettingsComponent, 'cascades')}
            onRelease={commitProperty(RenderSettingsComponent, 'cascades')}
          />
        </InputGroup>
      ) : (
        <></>
      )}
      <InputGroup
        name="Tone Mapping"
        label={t('editor:properties.renderSettings.lbl-toneMapping')}
        info={t('editor:properties.renderSettings.info-toneMapping')}
      >
        <SelectInput
          options={ToneMappingOptions}
          value={rendererSettingsState.toneMapping.value}
          onChange={commitProperty(RenderSettingsComponent, 'toneMapping')}
        />
      </InputGroup>
      <InputGroup
        name="Tone Mapping Exposure"
        label={t('editor:properties.renderSettings.lbl-toneMappingExposure')}
        info={t('editor:properties.renderSettings.info-toneMappingExposure')}
        className="w-auto"
      >
        <Slider
          min={0}
          max={10}
          step={0.1}
          value={rendererSettingsState.toneMappingExposure.value}
          onChange={updateProperty(RenderSettingsComponent, 'toneMappingExposure')}
          onRelease={commitProperty(RenderSettingsComponent, 'toneMappingExposure')}
        />
      </InputGroup>
      <InputGroup
        name="Shadow Map Type"
        label={t('editor:properties.renderSettings.lbl-shadowMapType')}
        info={t('editor:properties.renderSettings.info-shadowMapType')}
      >
        <SelectInput
          options={ShadowTypeOptions}
          value={rendererSettingsState.shadowMapType.value ?? -1}
          onChange={commitProperty(RenderSettingsComponent, 'shadowMapType')}
        />
      </InputGroup>
    </PropertyGroup>
  )
}

RenderSettingsEditor.iconComponent = SiRender

export default RenderSettingsEditor
