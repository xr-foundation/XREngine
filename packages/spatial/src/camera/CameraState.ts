import matches from 'ts-matches'

import { defineAction, defineState } from '@xrengine/hyperflux'

import { SpawnObjectActions } from '../transform/SpawnObjectActions'

export const CameraSettings = defineState({
  name: 'xre.engine.CameraSettings',
  initial: () => ({
    cameraRotationSpeed: 200
  })
})

export class CameraActions {
  static spawnCamera = defineAction(
    SpawnObjectActions.spawnObject.extend({
      type: 'xrengine.engine.world.SPAWN_CAMERA'
    })
  )

  static fadeToBlack = defineAction({
    type: 'xre.engine.CameraActions.FadeToBlack' as const,
    in: matches.boolean
  })
}
