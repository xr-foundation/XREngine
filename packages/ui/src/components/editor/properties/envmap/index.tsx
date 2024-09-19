
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { UUIDComponent } from '@xrengine/ecs'
import { getComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { EnvMapBakeComponent } from '@xrengine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvmapComponent } from '@xrengine/engine/src/scene/components/EnvmapComponent'
import { getEntityErrors } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { EnvMapSourceType, EnvMapTextureType } from '@xrengine/engine/src/scene/constants/EnvMapEnum'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'

import { useQuery } from '@xrengine/ecs/src/QueryFunctions'
import {
  EditorComponentType,
  commitProperty,
  updateProperties,
  updateProperty
} from '@xrengine/editor/src/components/properties/Util'
import { IoMapOutline } from 'react-icons/io5'
import Button from '../../../../primitives/tailwind/Button'
import ColorInput from '../../../../primitives/tailwind/Color'
import Slider from '../../../../primitives/tailwind/Slider'
import FolderInput from '../../input/Folder'
import InputGroup from '../../input/Group'
import ImagePreviewInput from '../../input/Image/Preview'
import SelectInput from '../../input/Select'
import NodeEditor from '../nodeEditor'

/**
 * EnvMapSourceOptions array containing SourceOptions for Envmap
 */
const EnvMapSourceOptions = Object.values(EnvMapSourceType).map((value) => ({ label: value, value }))

/**
 * EnvMapSourceOptions array containing SourceOptions for Envmap
 */
const EnvMapTextureOptions = Object.values(EnvMapTextureType).map((value) => ({ label: value, value }))

/**
 * EnvMapEditor provides the editor view for environment map property customization.
 */
export const EnvMapEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity

  const bakeEntities = useQuery([EnvMapBakeComponent]).map((entity) => {
    return {
      label: getComponent(entity, NameComponent),
      value: getComponent(entity, UUIDComponent)
    }
  })

  const onChangeCubemapURLSource = useCallback((value) => {
    const directory = value[value.length - 1] === '/' ? value.substring(0, value.length - 1) : value
    if (directory !== directory /*envmapComponent.envMapSourceURL*/) {
      updateProperties(EnvmapComponent, { envMapSourceURL: directory })
    }
  }, [])

  const envmapComponent = useComponent(entity, EnvmapComponent)

  const errors = getEntityErrors(props.entity, EnvmapComponent)

  return (
    <NodeEditor
      {...props}
      component={EnvmapComponent}
      name={t('editor:properties.envmap.name')}
      description={t('editor:properties.envmap.description')}
      icon={<EnvMapEditor.iconComponent />}
    >
      <InputGroup name="Envmap Source" label={t('editor:properties.envmap.lbl-source')} className="w-auto">
        <SelectInput
          key={props.entity}
          options={EnvMapSourceOptions}
          value={envmapComponent.type.value}
          onChange={commitProperty(EnvmapComponent, 'type')}
        />
      </InputGroup>
      {envmapComponent.type.value === EnvMapSourceType.Color && (
        <InputGroup name="EnvMapColor" label={t('editor:properties.envmap.lbl-color')}>
          <ColorInput
            value={envmapComponent.envMapSourceColor.value}
            onChange={commitProperty(EnvmapComponent, 'envMapSourceColor')}
            onRelease={commitProperty(EnvmapComponent, 'envMapSourceColor')}
          />
        </InputGroup>
      )}
      {envmapComponent.type.value === EnvMapSourceType.Bake && (
        <InputGroup name="EnvMapBake" label={t('editor:properties.envmap.lbl-bake')}>
          <SelectInput
            options={bakeEntities}
            value={envmapComponent.envMapSourceEntityUUID.value}
            onChange={commitProperty(EnvmapComponent, 'envMapSourceEntityUUID')}
          />
        </InputGroup>
      )}
      {envmapComponent.type.value === EnvMapSourceType.Texture && (
        <div>
          <InputGroup name="Texture Type" label={t('editor:properties.envmap.lbl-textureType')}>
            <SelectInput
              key={props.entity}
              options={EnvMapTextureOptions}
              value={envmapComponent.envMapTextureType.value}
              onChange={commitProperty(EnvmapComponent, 'envMapTextureType')}
            />
          </InputGroup>
          <InputGroup name="Texture URL" label={t('editor:properties.envmap.lbl-textureUrl')}>
            {envmapComponent.envMapTextureType.value === EnvMapTextureType.Cubemap && (
              <FolderInput value={envmapComponent.envMapSourceURL.value} onRelease={onChangeCubemapURLSource} />
            )}
            {envmapComponent.envMapTextureType.value === EnvMapTextureType.Equirectangular && (
              <ImagePreviewInput
                value={envmapComponent.envMapSourceURL.value}
                onRelease={commitProperty(EnvmapComponent, 'envMapSourceURL')}
              />
            )}
            {errors?.MISSING_FILE && (
              <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.scene.error-url')}</div>
            )}
          </InputGroup>
        </div>
      )}
      {envmapComponent.type.value === EnvMapSourceType.Probes && (
        <Button
          onClick={() => {
            commitProperty(EnvmapComponent, 'type')(EnvMapSourceType.None)
            setTimeout(() => {
              commitProperty(EnvmapComponent, 'type')(EnvMapSourceType.Probes)
            }, 1000)
          }}
        >
          {t('editor:properties.envmap.bake-reflection-probes')}
        </Button>
      )}
      {envmapComponent.type.value !== EnvMapSourceType.None && (
        <InputGroup name="EnvMap Intensity" label={t('editor:properties.envmap.lbl-intensity')} className="w-auto">
          <Slider
            min={0}
            max={20}
            value={envmapComponent.envMapIntensity.value}
            onChange={updateProperty(EnvmapComponent, 'envMapIntensity')}
            onRelease={commitProperty(EnvmapComponent, 'envMapIntensity')}
          />
        </InputGroup>
      )}
    </NodeEditor>
  )
}
EnvMapEditor.iconComponent = IoMapOutline
export default EnvMapEditor
