
import { defineState } from '@xrengine/hyperflux'

import { FollowCameraMode } from './types/FollowCameraMode'
import { ProjectionType } from './types/ProjectionType'

// TODO: don't mix camera settings and follow camera settings
export const CameraSettingsState = defineState({
  name: 'CameraSettingsState',
  initial: {
    fov: 60,
    cameraNearClip: 0.1,
    cameraFarClip: 1000,
    projectionType: ProjectionType.Perspective,
    minCameraDistance: 1.5,
    maxCameraDistance: 50,
    startCameraDistance: 3,
    cameraMode: FollowCameraMode.Dynamic,
    cameraModeDefault: FollowCameraMode.ThirdPerson,
    minPhi: -70,
    maxPhi: 85
  }
})
