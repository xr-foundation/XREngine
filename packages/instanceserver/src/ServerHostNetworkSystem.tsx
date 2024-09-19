
import { useEffect } from 'react'

import { API } from '@xrengine/common'
import { RecordingAPIState } from '@xrengine/common/src/recording/ECSRecordingSystem'
import { RecordingID, recordingResourceUploadPath } from '@xrengine/common/src/schema.type.module'
import { Engine } from '@xrengine/ecs/src/Engine'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { PeerID, getMutableState, none } from '@xrengine/hyperflux'
import { NetworkPeerFunctions, NetworkState, updatePeers } from '@xrengine/network'

import { SocketWebRTCServerNetwork } from './SocketWebRTCServerFunctions'

export async function checkPeerHeartbeat(network: SocketWebRTCServerNetwork): Promise<void> {
  for (const [peerID, client] of Object.entries(network.peers)) {
    if (client.userId === Engine.instance.userID) continue
    if (Date.now() - client.lastSeenTs > 10000) {
      if (client.transport) client.transport!.end!()
      NetworkPeerFunctions.destroyPeer(network, peerID as PeerID)
      updatePeers(network)
    }
  }
}

const execute = () => {
  const worldNetwork = NetworkState.worldNetwork as SocketWebRTCServerNetwork
  if (worldNetwork) {
    if (worldNetwork.isHosting) checkPeerHeartbeat(worldNetwork)
  }
}

export const uploadRecordingStaticResource = async (props: {
  recordingID: RecordingID
  key: string
  body: Buffer
  mimeType: string
}) => {
  const api = API.instance

  await api.service(recordingResourceUploadPath).create({
    recordingID: props.recordingID,
    key: props.key,
    body: props.body,
    mimeType: props.mimeType
  })
}

const reactor = () => {
  useEffect(() => {
    getMutableState(RecordingAPIState).merge({ uploadRecordingChunk: uploadRecordingStaticResource })
    return () => {
      getMutableState(RecordingAPIState).merge({ uploadRecordingChunk: none })
    }
  }, [])

  return null
}

export const ServerHostNetworkSystem = defineSystem({
  uuid: 'xrengine.instanceserver.ServerHostNetworkSystem',
  insert: { with: SimulationSystemGroup },
  execute,
  reactor
})
