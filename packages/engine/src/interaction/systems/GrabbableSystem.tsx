import React, { useEffect } from 'react'

import {
  defineQuery,
  defineSystem,
  Engine,
  entityExists,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  SimulationSystemGroup,
  UUIDComponent
} from '@xrengine/ecs'
import {
  defineActionQueue,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  none,
  useHookstate,
  useMutableState
} from '@xrengine/hyperflux'
import { NetworkObjectAuthorityTag, NetworkState, WorldNetworkAction } from '@xrengine/network'
import { ClientInputSystem } from '@xrengine/spatial'
import { Vector3_Zero } from '@xrengine/spatial/src/common/constants/MathConstants'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import { InputComponent } from '@xrengine/spatial/src/input/components/InputComponent'
import { InputSourceComponent } from '@xrengine/spatial/src/input/components/InputSourceComponent'
import { Physics } from '@xrengine/spatial/src/physics/classes/Physics'
import { RigidBodyComponent } from '@xrengine/spatial/src/physics/components/RigidBodyComponent'
import { BodyTypes } from '@xrengine/spatial/src/physics/types/PhysicsTypes'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { getHandTarget } from '../../avatar/components/AvatarIKComponents'
import { GrabbableComponent, GrabbedComponent, GrabberComponent, onDrop } from '../components/GrabbableComponent'
import { GrabbableNetworkAction } from '../functions/grabbableFunctions'

export const GrabbableState = defineState({
  name: 'xrengine.engine.grabbables.GrabbableState',

  initial: {} as Record<
    EntityUUID,
    {
      attachmentPoint: 'left' | 'right'
      grabberUserId: EntityUUID
    }
  >,

  receptors: {
    onSetGrabbedObject: GrabbableNetworkAction.setGrabbedObject.receive((action) => {
      const state = getMutableState(GrabbableState)
      if (action.grabbed)
        state[action.entityUUID].set({
          attachmentPoint: action.attachmentPoint ?? 'right',
          grabberUserId: action.grabberUserId
        })
      else state[action.entityUUID].set(none)
    }),
    onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
      const state = getMutableState(GrabbableState)
      state[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const grabbableState = useMutableState(GrabbableState)
    return (
      <>
        {grabbableState.keys.map((entityUUID: EntityUUID) => (
          <GrabbableReactor key={entityUUID} entityUUID={entityUUID} />
        ))}
      </>
    )
  }
})

const GrabbableReactor = ({ entityUUID }: { entityUUID: EntityUUID }) => {
  const state = useHookstate(getMutableState(GrabbableState)[entityUUID])
  const entity = UUIDComponent.useEntityByUUID(entityUUID)
  const grabberEntity = UUIDComponent.useEntityByUUID(state.grabberUserId.value as EntityUUID)
  const attachmentPoint = state.attachmentPoint.value

  useEffect(() => {
    if (!entity || !grabberEntity) return

    setComponent(grabberEntity, GrabberComponent, { [attachmentPoint]: entity })
    setComponent(entity, GrabbedComponent, {
      grabberEntity,
      attachmentPoint
    })

    if (hasComponent(entity, RigidBodyComponent)) {
      setComponent(entity, RigidBodyComponent, { type: BodyTypes.Kinematic })
      // for (let i = 0; i < body.numColliders(); i++) {
      //   const collider = body.collider(i)
      //   let oldCollisionGroups = collider.collisionGroups()
      //   oldCollisionGroups ^= CollisionGroups.Default << 16
      //   collider.setCollisionGroups(oldCollisionGroups)
      // }
    }

    return () => {
      if (hasComponent(grabberEntity, GrabbedComponent))
        setComponent(grabberEntity, GrabberComponent, { [attachmentPoint]: null })
      if (!entityExists(entity)) return
      removeComponent(entity, GrabbedComponent)
      if (hasComponent(entity, RigidBodyComponent)) {
        setComponent(entity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        // for (let i = 0; i < body.numColliders(); i++) {
        //   const collider = body.collider(i)
        //   let oldCollisionGroups = collider.collisionGroups()
        //   oldCollisionGroups ^= CollisionGroups.Default << 16
        //   collider.setCollisionGroups(oldCollisionGroups)
        // }
      }
    }
  }, [entity, grabberEntity])

  return null
}

/** @deprecated @todo - replace with reactor */
export function transferAuthorityOfObjectReceptor(
  action: ReturnType<typeof WorldNetworkAction.transferAuthorityOfObject>
) {
  if (action.newAuthority !== Engine.instance.store.peerID) return
  const grabbableEntity = UUIDComponent.getEntityByUUID(action.entityUUID)
  if (hasComponent(grabbableEntity, GrabbableComponent)) {
    const grabberUserId = NetworkState.worldNetwork.peers[action.newAuthority]?.userId
    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: getComponent(grabbableEntity, UUIDComponent),
        grabberUserId: grabberUserId as any as EntityUUID,
        grabbed: !hasComponent(grabbableEntity, GrabbedComponent),
        // todo, pass attachment point through actions somehow
        attachmentPoint: 'right'
      })
    )
  }
}

/**
 * @todo refactor this into i18n and configurable
 */

/** @todo replace this with event sourcing */
const transferAuthorityOfObjectQueue = defineActionQueue(WorldNetworkAction.transferAuthorityOfObject.matches)
const ownedGrabbableQuery = defineQuery([GrabbableComponent, NetworkObjectAuthorityTag])

const execute = () => {
  if (getState(EngineState).isEditing) return

  for (const action of transferAuthorityOfObjectQueue()) transferAuthorityOfObjectReceptor(action)

  for (const entity of ownedGrabbableQuery()) {
    const grabbedComponent = getOptionalComponent(entity, GrabbedComponent)
    if (!grabbedComponent) return
    const attachmentPoint = grabbedComponent.attachmentPoint

    const target = getHandTarget(grabbedComponent.grabberEntity, attachmentPoint ?? 'right')!

    const rigidbodyComponent = getOptionalComponent(entity, RigidBodyComponent)
    const world = Physics.getWorld(entity)!

    if (rigidbodyComponent) {
      rigidbodyComponent.targetKinematicPosition.copy(target.position)
      rigidbodyComponent.targetKinematicRotation.copy(target.rotation)
      Physics.setRigidbodyPose(world, entity, target.position, target.rotation, Vector3_Zero, Vector3_Zero)
    }

    const grabbableTransform = getComponent(entity, TransformComponent)
    grabbableTransform.position.copy(target.position)
    grabbableTransform.rotation.copy(target.rotation)
  }
}

const executeInput = () => {
  const inputSources = InputSourceComponent.nonCapturedInputSources()
  const buttons = InputComponent.getMergedButtonsForInputSources(inputSources)
  if (buttons.KeyU?.down) onDrop()
}

export const GrabbableSystem = defineSystem({
  uuid: 'xrengine.engine.GrabbableSystem',
  insert: { with: SimulationSystemGroup },
  execute
})

export const GrabbableInputSystem = defineSystem({
  uuid: 'xrengine.engine.GrabbableInputSystem',
  insert: { after: ClientInputSystem },
  execute: executeInput
})
