
import { Engine, EntityUUID, UUIDComponent } from '@xrengine/ecs'
import { defineComponent, getComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { UserID } from '@xrengine/hyperflux'
import { NetworkObjectComponent } from '@xrengine/network'

export const AvatarComponent = defineComponent({
  name: 'AvatarComponent',

  schema: S.Object({
    /** The total height of the avatar in a t-pose, must always be non zero and positive for the capsule collider */
    avatarHeight: S.Number(1.8),
    /** The length of the torso in a t-pose, from the hip joint to the head joint */
    torsoLength: S.Number(0),
    /** The length of the upper leg in a t-pose, from the hip joint to the knee joint */
    upperLegLength: S.Number(0),
    /** The length of the lower leg in a t-pose, from the knee joint to the ankle joint */
    lowerLegLength: S.Number(0),
    /** The height of the foot in a t-pose, from the ankle joint to the bottom of the avatar's model */
    footHeight: S.Number(0),
    /** The height of the hips in a t-pose */
    hipsHeight: S.Number(0),
    /** The length of the arm in a t-pose, from the shoulder joint to the elbow joint */
    armLength: S.Number(0),
    /** The distance between the left and right foot in a t-pose */
    footGap: S.Number(0),
    /** The angle of the foot in a t-pose */
    footAngle: S.Number(0),
    /** The height of the eyes in a t-pose */
    eyeHeight: S.Number(0)
  }),

  /**
   * Get the user avatar entity (the network object w/ an Avatar component)
   * @param userId
   * @returns
   */
  getUserAvatarEntity(userId: UserID) {
    return avatarNetworkObjectQuery().find((eid) => getComponent(eid, NetworkObjectComponent).ownerId === userId)!
  },

  getSelfAvatarEntity() {
    return UUIDComponent.getEntityByUUID((Engine.instance.userID + '_avatar') as EntityUUID)
  },

  useSelfAvatarEntity() {
    return UUIDComponent.useEntityByUUID((Engine.instance.userID + '_avatar') as EntityUUID)
  }
})

const avatarNetworkObjectQuery = defineQuery([NetworkObjectComponent, AvatarComponent])
