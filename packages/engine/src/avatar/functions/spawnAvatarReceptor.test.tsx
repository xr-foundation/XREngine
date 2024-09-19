import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'
import { Quaternion, Vector3 } from 'three'

import { Entity, EntityUUID, SystemDefinitions, UUIDComponent } from '@xrengine/ecs'
import { getComponent, hasComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Engine, createEngine, destroyEngine } from '@xrengine/ecs/src/Engine'
import { ReactorReconciler, UserID, applyIncomingActions, dispatchAction } from '@xrengine/hyperflux'
import { Network, NetworkPeerFunctions, NetworkState, NetworkWorldUserStateSystem } from '@xrengine/network'
import { createMockNetwork } from '@xrengine/network/tests/createMockNetwork'
import { initializeSpatialEngine, initializeSpatialViewer } from '@xrengine/spatial/src/initializeEngine'
import { Physics } from '@xrengine/spatial/src/physics/classes/Physics'
import {
  RigidBodyComponent,
  RigidBodyKinematicTagComponent
} from '@xrengine/spatial/src/physics/components/RigidBodyComponent'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { SceneComponent } from '@xrengine/spatial/src/renderer/components/SceneComponents'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'
import { spawnAvatarReceptor } from './spawnAvatarReceptor'

describe('spawnAvatarReceptor', () => {
  let sceneEntity: Entity
  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
    initializeSpatialViewer()
    Engine.instance.store.defaultDispatchDelay = () => 0
    await Physics.load()
    Engine.instance.store.userID = 'user' as UserID
    sceneEntity = loadEmptyScene()

    setComponent(sceneEntity, SceneComponent)
    const physicsWorld = Physics.createWorld(getComponent(sceneEntity, UUIDComponent))
    physicsWorld.timestep = 1 / 60

    createMockNetwork()
  })

  afterEach(() => {
    return destroyEngine()
  })

  const NetworkWorldUserStateSystemReactor = SystemDefinitions.get(NetworkWorldUserStateSystem)!.reactor!
  const tag = <NetworkWorldUserStateSystemReactor />

  it('check the create avatar function', async () => {
    const network = NetworkState.worldNetwork as Network
    NetworkPeerFunctions.createPeer(network, Engine.instance.store.peerID, 0, Engine.instance.userID, 0)

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    // mock entity to apply incoming unreliable updates to
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

    ReactorReconciler.flushSync(() => applyIncomingActions())
    ReactorReconciler.flushSync(() => spawnAvatarReceptor(Engine.instance.userID as string as EntityUUID))

    const entity = AvatarComponent.getUserAvatarEntity(Engine.instance.userID)

    assert(hasComponent(entity, TransformComponent))
    assert(hasComponent(entity, AvatarComponent))
    assert(hasComponent(entity, AvatarAnimationComponent))
    assert(hasComponent(entity, AvatarControllerComponent))
    assert(hasComponent(entity, RigidBodyComponent))
    assert(hasComponent(entity, RigidBodyKinematicTagComponent))

    unmount()
  })
})
