import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Quaternion, Vector3 } from 'three'

import { getComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import {
  PortalComponent,
  PortalEffects,
  PortalPreviewTypes
} from '@xrengine/engine/src/scene/components/PortalComponent'

import { UUIDComponent } from '@xrengine/ecs'
import {
  EditorComponentType,
  commitProperties,
  commitProperty,
  updateProperty
} from '@xrengine/editor/src/components/properties/Util'
import { bakeEnvmapTexture, uploadCubemapBakeToServer } from '@xrengine/editor/src/functions/uploadEnvMapBake'
import { imageDataToBlob } from '@xrengine/engine/src/scene/classes/ImageUtils'
import { NO_PROXY, useHookstate } from '@xrengine/hyperflux'
import { TransformComponent } from '@xrengine/spatial'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { BooleanInput } from '@xrengine/ui/src/components/editor/input/Boolean'
import { GiPortal } from 'react-icons/gi'
import Button from '../../../../primitives/tailwind/Button'
import EulerInput from '../../input/Euler'
import InputGroup from '../../input/Group'
import ImagePreviewInput from '../../input/Image/Preview'
import SelectInput from '../../input/Select'
import StringInput, { ControlledStringInput } from '../../input/String'
import Vector3Input from '../../input/Vector3'
import NodeEditor from '../nodeEditor'

type PortalOptions = {
  label: string
  value: string
}

/**
 * PortalNodeEditor provides the editor for properties of PortalNode.
 */
export const PortalNodeEditor: EditorComponentType = (props) => {
  const state = useHookstate({
    portals: [] as PortalOptions[],
    previewImageData: null as ImageData | null,
    previewImageURL: ''
  })

  const { t } = useTranslation()
  const transformComponent = useComponent(props.entity, TransformComponent)
  const portalComponent = useComponent(props.entity, PortalComponent)

  useEffect(() => {
    //loadPortals()
  }, [])

  const updateCubeMapBake = async () => {
    const imageData = await bakeEnvmapTexture(
      transformComponent.value.position.clone().add(new Vector3(0, 2, 0).multiply(transformComponent.scale.value))
    )
    const blob = await imageDataToBlob(imageData)
    state.previewImageData.set(imageData)
    state.previewImageURL.set(URL.createObjectURL(blob!))
  }

  const loadPortals = async () => {
    const portalsDetail: any[] = []
    try {
      portalsDetail
        .push
        //...((await API.instance.client.service(portalPath).find({ query: { paginate: false } })) as PortalType[])
        ()
      console.log('portalsDetail', portalsDetail, getComponent(props.entity, UUIDComponent))
    } catch (error) {
      throw new Error(error)
    }
    state.portals.set(
      portalsDetail
        .filter((portal) => portal.portalEntityId !== getComponent(props.entity, UUIDComponent))
        .map(({ portalEntityId, portalEntityName, sceneName }) => {
          return { value: portalEntityId, label: sceneName + ': ' + portalEntityName }
        })
    )
  }

  const uploadEnvmap = async () => {
    if (!state.previewImageData.value) return
    const url = await uploadCubemapBakeToServer(getComponent(props.entity, NameComponent), state.previewImageData.value)
    commitProperties(PortalComponent, { previewImageURL: url }, [props.entity])
  }

  const changeSpawnRotation = (value: Quaternion) => {
    commitProperties(PortalComponent, { spawnRotation: value })
  }

  const changePreviewType = (val) => {
    commitProperties(PortalComponent, { previewType: val })
    loadPortals()
  }

  return (
    <NodeEditor
      name={t('editor:properties.portal.name')}
      description={t('editor:properties.portal.description')}
      icon={<PortalNodeEditor.iconComponent />}
      {...props}
    >
      <InputGroup name="Location" label={t('editor:properties.portal.lbl-locationName')}>
        <StringInput
          value={portalComponent.location.value}
          onChange={updateProperty(PortalComponent, 'location')}
          onRelease={commitProperty(PortalComponent, 'location')}
        />
      </InputGroup>
      <InputGroup name="Portal" label={t('editor:properties.portal.lbl-portal')}>
        <SelectInput
          key={props.entity}
          options={state.portals.get(NO_PROXY) as PortalOptions[]}
          value={portalComponent.linkedPortalId.value}
          onChange={commitProperty(PortalComponent, 'linkedPortalId')}
        />
      </InputGroup>
      <InputGroup name="Portal" label={t('editor:properties.portal.lbl-redirect')}>
        <BooleanInput onChange={commitProperty(PortalComponent, 'redirect')} value={portalComponent.redirect.value} />
      </InputGroup>
      <InputGroup name="Effect Type" label={t('editor:properties.portal.lbl-effectType')}>
        <SelectInput
          key={props.entity}
          options={Array.from(PortalEffects.keys()).map((val) => {
            return { value: val, label: val }
          })}
          value={portalComponent.effectType.value}
          onChange={commitProperty(PortalComponent, 'effectType')}
        />
      </InputGroup>
      <InputGroup name="Preview Type" label={t('editor:properties.portal.lbl-previewType')}>
        <SelectInput
          key={props.entity}
          options={Array.from(PortalPreviewTypes.values()).map((val) => {
            return { value: val, label: val }
          })}
          value={portalComponent.previewType.value}
          onChange={changePreviewType}
        />
      </InputGroup>
      <InputGroup name="Saved Image URL" label={t('editor:properties.portal.lbl-savedImageURL')}>
        <ControlledStringInput
          value={portalComponent.previewImageURL.value}
          onChange={updateProperty(PortalComponent, 'previewImageURL')}
          onRelease={commitProperty(PortalComponent, 'previewImageURL')}
        />
      </InputGroup>
      <InputGroup name="Preview Image Bake" label="Preview Image Bake">
        <div className="flex flex-col">
          <div className="flex w-auto flex-row gap-1">
            <Button
              className="h-10 bg-neutral-700 text-xs"
              onClick={() => {
                updateCubeMapBake()
              }}
            >
              {t('editor:properties.portal.lbl-generateImage')}
            </Button>
            <Button
              onClick={() => {
                uploadEnvmap()
              }}
              className="h-10 text-xs"
            >
              {t('editor:properties.portal.lbl-saveImage')}
            </Button>
          </div>
        </div>
      </InputGroup>
      <ImagePreviewInput
        previewOnly={true}
        value={state.previewImageURL.value ?? portalComponent.previewImageURL.value}
      />
      <InputGroup name="Spawn Position" label={t('editor:properties.portal.lbl-spawnPosition')} className="w-auto">
        <Vector3Input
          value={portalComponent.spawnPosition.value}
          onChange={updateProperty(PortalComponent, 'spawnPosition')}
          onRelease={commitProperty(PortalComponent, 'spawnPosition')}
        />
      </InputGroup>
      <InputGroup name="Spawn Rotation" label={t('editor:properties.portal.lbl-spawnRotation')} className="w-auto">
        <EulerInput
          quaternion={portalComponent.spawnRotation.value}
          onChange={changeSpawnRotation}
          onRelease={() =>
            commitProperty(PortalComponent, 'spawnRotation')(getComponent(props.entity, PortalComponent).spawnRotation)
          }
        />
      </InputGroup>
    </NodeEditor>
  )
}

PortalNodeEditor.iconComponent = GiPortal

export default PortalNodeEditor
