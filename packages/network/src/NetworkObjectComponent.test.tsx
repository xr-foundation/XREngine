import { createEntity, destroyEngine, getComponent, setComponent } from '@xrengine/ecs'
import { createEngine } from '@xrengine/ecs/src/Engine'
import { PeerID, UserID } from '@xrengine/hyperflux'
import assert from 'assert'
import { NetworkId } from './NetworkId'
import { NetworkObjectComponent } from './NetworkObjectComponent'

describe('NetworkObjectComponent', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Creates a NetworkObjectComponent', () => {
    const entity = createEntity()

    setComponent(entity, NetworkObjectComponent)
    const networkObjectComponent = getComponent(entity, NetworkObjectComponent)
    networkObjectComponent.networkId = 12 as NetworkId
    assert(NetworkObjectComponent.networkId[entity] === 12)
  })

  it('Sets a NetworkObjectComponent', () => {
    const entity = createEntity()

    setComponent(entity, NetworkObjectComponent, {
      ownerId: 'ownerID' as UserID,
      ownerPeer: 'ownerPeer' as PeerID,
      authorityPeerID: 'authPeerID' as PeerID,
      networkId: 32 as NetworkId
    })
    const networkObjectComponent = getComponent(entity, NetworkObjectComponent)
    assert(networkObjectComponent.ownerId === 'ownerID')
    assert(networkObjectComponent.ownerPeer === 'ownerPeer')
    assert(networkObjectComponent.authorityPeerID === 'authPeerID')
    assert(networkObjectComponent.networkId === 32)
    assert(NetworkObjectComponent.networkId[entity] === 32)

    const json = NetworkObjectComponent.toJSON(networkObjectComponent)

    assert(json.ownerId === 'ownerID')
    assert(json.ownerPeer === 'ownerPeer')
    assert(json.authorityPeerID === 'authPeerID')
    assert(json.networkId === 32)
  })
})
