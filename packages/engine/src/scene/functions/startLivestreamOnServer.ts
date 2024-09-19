// import Twitch from 'twitch-m3u8'

import { Entity } from '@xrengine/ecs/src/Entity'

// import { getComponent } from '@xrengine/ecs/srcComponentFunctions'
// import LivestreamProxyComponent from '../../scene/components/LivestreamProxyComponent'

export const startLivestreamOnServer = async (entity: Entity): Promise<void> => {
  // const livestreamProxyComponent = getComponent(entity, LivestreamProxyComponent)
  try {
    // const dataStream = await Twitch.getStream('lalalune', true)
    // console.log('startLivestreamOnServer dataStream', dataStream)
  } catch (e) {
    // console.error('Failed to get livestream!', e, livestreamProxyComponent.src)
  }
}
