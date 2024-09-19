import { t } from 'i18next'
import React from 'react'

import { getOptionalComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { CameraSettingsComponent } from '@xrengine/engine/src/scene/components/CameraSettingsComponent'

import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import {
  EditorComponentType,
  commitProperties,
  commitProperty,
  updateProperty
} from '@xrengine/editor/src/components/properties/Util'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { MeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { iterateEntityNode } from '@xrengine/spatial/src/transform/components/EntityTree'
import { HiOutlineCamera } from 'react-icons/hi'
import { Box3, Vector3 } from 'three'
import Button from '../../../../primitives/tailwind/Button'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import PropertyGroup from '../group'

/** Types copied from Camera Modes of engine. */
const projectionTypeSelect = [
  {
    label: 'Orthographic',
    value: 0
  },
  {
    label: 'Perspective',
    value: 1
  }
]

const modelQuery = defineQuery([ModelComponent])
const _box3 = new Box3()

export const CameraPropertiesNodeEditor: EditorComponentType = (props) => {
  const cameraSettings = useComponent(props.entity, CameraSettingsComponent)

  const calculateClippingPlanes = () => {
    const box = new Box3()
    const modelEntities = modelQuery()
    for (const entity of modelEntities) {
      console.log(entity)
      iterateEntityNode(entity, (entity) => {
        const mesh = getOptionalComponent(entity, MeshComponent)
        if (mesh?.geometry?.boundingBox) {
          console.log(mesh)
          _box3.copy(mesh.geometry.boundingBox)
          _box3.applyMatrix4(mesh.matrixWorld)
          box.union(_box3)
        }
      })
    }
    const boxSize = box.getSize(new Vector3()).length()
    commitProperties(
      CameraSettingsComponent,
      {
        cameraNearClip: 0.1,
        cameraFarClip: Math.max(boxSize, 100)
      },
      [props.entity]
    )
  }

  return (
    <PropertyGroup
      name={t('editor:properties.cameraSettings.name')}
      description={t('editor:properties.cameraSettings.description')}
      icon={<CameraPropertiesNodeEditor.iconComponent />}
    >
      <InputGroup name="Projection type" label={'Projection type'}>
        <SelectInput
          // placeholder={projectionTypeSelect[0].label}
          value={cameraSettings.projectionType.value}
          onChange={commitProperty(CameraSettingsComponent, 'projectionType')}
          options={projectionTypeSelect}
        />
      </InputGroup>
      <InputGroup name="Field of view" label={'FOV'}>
        <NumericInput
          onChange={updateProperty(CameraSettingsComponent, 'fov')}
          onRelease={commitProperty(CameraSettingsComponent, 'fov')}
          min={1}
          max={180}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={cameraSettings.fov.value}
        />
      </InputGroup>
      <div className="my-1 flex flex-wrap items-center justify-end">
        <Button className="flex flex-wrap items-center justify-end" onClick={calculateClippingPlanes}>
          Calculate Clipping Planes
        </Button>
      </div>

      <InputGroup name="cameraNearClip" label={'Projection distance'} containerClassName="gap-2">
        <div className="flex gap-2">
          <NumericInput
            onChange={updateProperty(CameraSettingsComponent, 'cameraNearClip')}
            onRelease={commitProperty(CameraSettingsComponent, 'cameraNearClip')}
            min={0.001}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={cameraSettings.cameraNearClip.value}
            className="w-1/2"
          />
          <NumericInput
            onChange={updateProperty(CameraSettingsComponent, 'cameraFarClip')}
            onRelease={commitProperty(CameraSettingsComponent, 'cameraFarClip')}
            min={0.001}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={cameraSettings.cameraFarClip.value}
            className="w-1/2"
          />
        </div>
      </InputGroup>
      <InputGroup name="minCameraDistance" label={'Camera distance'} containerClassName="gap-2">
        <div className="flex gap-2">
          <NumericInput
            onChange={updateProperty(CameraSettingsComponent, 'minCameraDistance')}
            onRelease={commitProperty(CameraSettingsComponent, 'minCameraDistance')}
            min={0.001}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={cameraSettings.minCameraDistance.value}
            className="w-1/2"
          />
          <NumericInput
            onChange={updateProperty(CameraSettingsComponent, 'maxCameraDistance')}
            onRelease={commitProperty(CameraSettingsComponent, 'maxCameraDistance')}
            min={0.001}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={cameraSettings.maxCameraDistance.value}
            className="w-1/2"
          />
        </div>
      </InputGroup>
      <InputGroup name="startCameraDistance" label={'Start camera distance'}>
        <NumericInput
          onChange={updateProperty(CameraSettingsComponent, 'startCameraDistance')}
          onRelease={commitProperty(CameraSettingsComponent, 'startCameraDistance')}
          min={0.001}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={cameraSettings.startCameraDistance.value}
        />
      </InputGroup>
      <InputGroup name="minPhi" label={'Phi'} containerClassName="gap-2">
        <div className="flex gap-2">
          <NumericInput
            onChange={updateProperty(CameraSettingsComponent, 'minPhi')}
            onRelease={commitProperty(CameraSettingsComponent, 'minPhi')}
            min={0.001}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={cameraSettings.minPhi.value}
            className="w-1/2"
          />
          <NumericInput
            onChange={updateProperty(CameraSettingsComponent, 'maxPhi')}
            onRelease={commitProperty(CameraSettingsComponent, 'maxPhi')}
            min={0.001}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={cameraSettings.maxPhi.value}
            className="w-1/2"
          />
        </div>
      </InputGroup>
    </PropertyGroup>
  )
}

CameraPropertiesNodeEditor.iconComponent = HiOutlineCamera

export default CameraPropertiesNodeEditor
