
import { InstanceType } from '@xrengine/common/src/schema.type.module'
import { defineState } from '@xrengine/hyperflux'

type AgonesGameServer = {
  status: {
    address: string // IP
  }
  objectMeta: {
    name: string
  }
}

export const InstanceServerState = defineState({
  name: 'InstanceServerState',
  initial: {
    ready: false,
    instance: null! as InstanceType,
    isMediaInstance: false,
    instanceServer: null! as AgonesGameServer,
    port: 3031
  }
})
