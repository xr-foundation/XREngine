import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { computeTransformMatrix } from '@xrengine/spatial/src/transform/systems/TransformSystem'
import { XRCameraUpdateSystem } from '@xrengine/spatial/src/xr/XRCameraSystem'

import { AvatarComponent } from '../components/AvatarComponent'
import { moveAvatar, updateLocalAvatarRotation } from '../functions/moveAvatar'

const execute = () => {
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  if (!selfAvatarEntity) return

  /**
   * 1 - Update local client movement
   */
  moveAvatar(selfAvatarEntity)
  updateLocalAvatarRotation(selfAvatarEntity)
  computeTransformMatrix(selfAvatarEntity)
}

/**
 * This system is responsible for updating the local client avatar position and rotation, and updating the XR camera position.
 */
export const ReferenceSpaceTransformSystem = defineSystem({
  uuid: 'xrengine.engine.ReferenceSpaceTransformSystem',
  insert: { before: XRCameraUpdateSystem },
  execute
})
