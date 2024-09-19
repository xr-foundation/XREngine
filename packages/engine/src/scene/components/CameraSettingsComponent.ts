
import { useEffect } from 'react'

import { defineComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { getMutableState, getState } from '@xrengine/hyperflux'
import { CameraSettingsState } from '@xrengine/spatial/src/camera/CameraSceneMetadata'
import { FollowCameraMode } from '@xrengine/spatial/src/camera/types/FollowCameraMode'
import { ProjectionType } from '@xrengine/spatial/src/camera/types/ProjectionType'

export const CameraSettingsComponent = defineComponent({
  name: 'CameraSettingsComponent',
  jsonID: 'XRENGINE_camera_settings',

  schema: S.Object({
    fov: S.Number(60),
    cameraNearClip: S.Number(0.1),
    cameraFarClip: S.Number(1000),
    projectionType: S.Enum(ProjectionType, ProjectionType.Perspective),
    minCameraDistance: S.Number(1.5),
    maxCameraDistance: S.Number(50),
    startCameraDistance: S.Number(3),
    cameraMode: S.Enum(FollowCameraMode, FollowCameraMode.Dynamic),
    cameraModeDefault: S.Enum(FollowCameraMode, FollowCameraMode.ThirdPerson),
    minPhi: S.Number(-70),
    maxPhi: S.Number(85)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, CameraSettingsComponent)

    for (const prop of Object.keys(getState(CameraSettingsState))) {
      useEffect(() => {
        if (component[prop].value !== getState(CameraSettingsState)[prop])
          getMutableState(CameraSettingsState)[prop].set(component[prop].value)
      }, [component[prop]])
    }

    return null
  }
})
