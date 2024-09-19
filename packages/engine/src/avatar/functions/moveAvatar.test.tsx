
import { act, render } from '@testing-library/react'
import { strictEqual } from 'assert'
import React from 'react'
import { Quaternion, Vector3 } from 'three'

import { Entity, EntityUUID, SystemDefinitions, UUIDComponent } from '@xrengine/ecs'
import { getComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { Engine, createEngine, destroyEngine } from '@xrengine/ecs/src/Engine'
import { UserID, applyIncomingActions, dispatchAction, getMutableState } from '@xrengine/hyperflux'
import { Network, NetworkPeerFunctions, NetworkState, NetworkWorldUserStateSystem } from '@xrengine/network'
import { createMockNetwork } from '@xrengine/network/tests/createMockNetwork'
import { initializeSpatialEngine, initializeSpatialViewer } from '@xrengine/spatial/src/initializeEngine'
import { Physics, PhysicsWorld } from '@xrengine/spatial/src/physics/classes/Physics'
import { RigidBodyComponent } from '@xrengine/spatial/src/physics/components/RigidBodyComponent'

import { SceneComponent } from '@xrengine/spatial/src/renderer/components/SceneComponents'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'
import { applyGamepadInput } from './moveAvatar'
import { spawnAvatarReceptor } from './spawnAvatarReceptor'

describe('moveAvatar function tests', () => {
  let sceneEntity: Entity
  let physicsWorld: PhysicsWorld
  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
    initializeSpatialViewer()
    await Physics.load()
    Engine.instance.store.userID = 'userId' as UserID
    sceneEntity = loadEmptyScene()
    setComponent(sceneEntity, SceneComponent)
    physicsWorld = Physics.createWorld(getComponent(sceneEntity, UUIDComponent))
    physicsWorld.timestep = 1 / 60

    createMockNetwork()
  })

  afterEach(() => {
    return destroyEngine()
  })

  const NetworkWorldUserStateSystemReactor = SystemDefinitions.get(NetworkWorldUserStateSystem)!.reactor!
  const tag = <NetworkWorldUserStateSystemReactor />

  it('should apply world.fixedDelta @ 60 tick to avatar movement, consistent with physics simulation', async () => {
    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    const network = NetworkState.worldNetwork as Network
    NetworkPeerFunctions.createPeer(network, Engine.instance.store.peerID, 0, Engine.instance.userID, 0)

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userID as string as EntityUUID,
        avatarURL: '',
        name: ''
      })
    )

    applyIncomingActions()

    spawnAvatarReceptor(Engine.instance.userID as string as EntityUUID)
    const entity = AvatarComponent.getUserAvatarEntity(Engine.instance.userID)

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity
    const avatar = getComponent(entity, AvatarControllerComponent)

    avatar.gamepadWorldMovement.setZ(-1)

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)

    unmount()
  })

  it('should apply world.fixedDelta @ 120 tick to avatar movement, consistent with physics simulation', async () => {
    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    const network = NetworkState.worldNetwork as Network
    NetworkPeerFunctions.createPeer(network, Engine.instance.store.peerID, 0, Engine.instance.userID, 0)

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userID as string as EntityUUID,
        avatarURL: '',
        name: ''
      })
    )

    applyIncomingActions()

    spawnAvatarReceptor(Engine.instance.userID as string as EntityUUID)
    const entity = AvatarComponent.getUserAvatarEntity(Engine.instance.userID)

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)

    unmount()
  })

  it('should take world.physics.timeScale into account when moving avatars, consistent with physics simulation', async () => {
    Engine.instance.store.userID = 'user' as UserID

    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    const network = NetworkState.worldNetwork as Network
    NetworkPeerFunctions.createPeer(network, Engine.instance.store.peerID, 0, Engine.instance.userID, 0)

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    /* mock */
    physicsWorld.timestep = 1 / 2

    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userID as string as EntityUUID,
        avatarURL: '',
        name: ''
      })
    )

    applyIncomingActions()

    spawnAvatarReceptor(Engine.instance.userID as string as EntityUUID)
    const entity = AvatarComponent.getUserAvatarEntity(Engine.instance.userID)

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)

    unmount()
  })

  it('should not allow velocity to breach a full unit through multiple frames', async () => {
    Engine.instance.store.userID = 'user' as UserID

    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    const network = NetworkState.worldNetwork as Network
    NetworkPeerFunctions.createPeer(network, Engine.instance.store.peerID, 0, Engine.instance.userID, 0)

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userID as string as EntityUUID,
        avatarURL: '',
        name: ''
      })
    )

    applyIncomingActions()

    spawnAvatarReceptor(Engine.instance.userID as string as EntityUUID)
    const entity = AvatarComponent.getUserAvatarEntity(Engine.instance.userID)

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)

    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)

    unmount()
  })
})
