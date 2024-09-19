
import type { AuthenticationClient } from '@feathersjs/authentication-client'
import authentication from '@feathersjs/authentication-client'
import feathers from '@feathersjs/client'
import type { FeathersApplication } from '@feathersjs/feathers'
import Primus from 'primus-client'

import { API as CommonAPI } from '@xrengine/common'

import type { ServiceTypes } from '@xrengine/common/declarations'
import config from '@xrengine/common/src/config'

import primusClient from './util/primus-client'

declare module '@feathersjs/client' {
  interface FeathersApplication extends AuthenticationClient {
    authentication: AuthenticationClient
  }
}

/**@deprecated - use '@xrengine.common API.instance' instead */
export class API {
  /**@deprecated - use '@xrengine.common API.instance' instead */
  static instance: API
  client: FeathersApplication<ServiceTypes>

  static createAPI = () => {
    const feathersClient = feathers()

    const primus = new Primus(`${config.client.serverUrl}?pathName=${window.location.pathname}`, {
      withCredentials: true
    })
    feathersClient.configure(primusClient(primus, { timeout: 10000 }))

    feathersClient.configure(
      authentication({
        storageKey: config.client.featherStoreKey
      })
    )

    primus.on('reconnected', () => API.instance.client.reAuthenticate(true))

    API.instance = new API()
    API.instance.client = feathersClient as any

    CommonAPI.instance = feathersClient
  }
}

globalThis.API = API
