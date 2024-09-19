import { DataConsumer } from 'mediasoup/node/lib/DataConsumer'

import { defineState, PeerID } from '@xrengine/hyperflux'
import { DataChannelType } from '@xrengine/network'

export const MediasoupInternalWebRTCDataChannelState = defineState({
  name: 'xrengine.instanceserver.mediasoup.MediasoupInternalWebRTCDataChannelState',

  initial: {} as Record<
    PeerID,
    {
      incomingDataConsumers: Record<DataChannelType, DataConsumer>
      outgoingDataConsumers: Record<DataChannelType, DataConsumer>
    }
  >
})
