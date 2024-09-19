
import { matchesEntityUUID } from '@xrengine/ecs'
import { defineAction, HyperFlux, matchesPeerID, matchesWithDefault } from '@xrengine/hyperflux'

import { NetworkTopics } from '../Network'
import { matchesNetworkId, NetworkObjectComponent } from '../NetworkObjectComponent'
import { matchesUserID } from './matchesUserID'

export class WorldNetworkAction {
  static spawnEntity = defineAction({
    type: 'xrengine.network.SPAWN_ENTITY',
    entityUUID: matchesEntityUUID,
    parentUUID: matchesEntityUUID,
    networkId: matchesWithDefault(matchesNetworkId, () => NetworkObjectComponent.createNetworkId()),
    ownerID: matchesWithDefault(matchesUserID, () => HyperFlux.store.userID),
    authorityPeerId: matchesPeerID.optional(),
    $cache: true,
    $topic: NetworkTopics.world
  })

  static destroyEntity = defineAction({
    type: 'xrengine.network.DESTROY_ENTITY',
    entityUUID: matchesEntityUUID,
    $cache: true,
    $topic: NetworkTopics.world
  })

  static requestAuthorityOverObject = defineAction({
    /** @todo embed $to restriction */
    type: 'xrengine.engine.world.REQUEST_AUTHORITY_OVER_ENTITY',
    entityUUID: matchesEntityUUID,
    newAuthority: matchesPeerID,
    $topic: NetworkTopics.world
  })

  static transferAuthorityOfObject = defineAction({
    type: 'xrengine.engine.world.TRANSFER_AUTHORITY_OF_ENTITY',
    ownerID: matchesUserID,
    entityUUID: matchesEntityUUID,
    newAuthority: matchesPeerID,
    $topic: NetworkTopics.world,
    $cache: true
  })
}
