
import '@feathersjs/transport-commons'

import { identityProviderPath } from '@xrengine/common/src/schemas/user/identity-provider.schema'
import { Application } from '@xrengine/server-core/declarations'

export default (app: Application): void => {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return
  }

  app.on('login', (authResult: any, { connection }: any) => {
    const identityProvider = authResult[identityProviderPath] || connection[identityProviderPath]
    if (identityProvider) app.channel(`userIds/${identityProvider.userId as string}`).join(connection)
  })

  app.on('logout', (authResult: any, { connection }: any) => {
    const identityProvider = authResult[identityProviderPath] || connection[identityProviderPath]
    if (identityProvider) app.channel(`userIds/${identityProvider.userId as string}`).leave(connection)
  })
}
