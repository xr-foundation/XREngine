import { acceptInviteMethods, acceptInvitePath } from '@xrengine/common/src/schemas/user/accept-invite.schema'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { AcceptInviteService } from './accept-invite.class'
import acceptInviteDocs from './accept-invite.docs'
import hooks from './accept-invite.hooks'

/**
 * A function which returns url to the client
 *
 * @param req
 * @param res response to the client
 * @param next
 * @returns redirect url to the client
 */
async function redirect(ctx, next) {
  try {
    const data = ctx.body
    if (data.error) {
      ctx.redirect(`${config.client.url}/?error=${data.error as string}`)
    } else {
      let link = `${config.client.url}/auth/magiclink?type=login&token=${data.token as string}`
      if (data.locationName) {
        let path = `/location/${data.locationName}`
        if (data.inviteCode) {
          path += path.indexOf('?') > -1 ? `&inviteCode=${data.inviteCode}` : `?inviteCode=${data.inviteCode}`
        }
        if (data.spawnPoint) {
          path += path.indexOf('?') > -1 ? `&spawnPoint=${data.spawnPoint}` : `?spawnPoint=${data.spawnPoint}`
        }
        if (data.spectate) {
          path += path.indexOf('?') > -1 ? `&spectate=${data.spectate}` : `?spectate=${data.spectate}`
        }
        if (data.instanceId) {
          path += `&instanceId=${data.instanceId}`
        }
        link += `&path=${path}`
      }
      ctx.redirect(link)
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [acceptInvitePath]: AcceptInviteService
  }
}

export default (app: Application): void => {
  app.use(acceptInvitePath, new AcceptInviteService(app), {
    // A list of all methods this service exposes externally
    methods: acceptInviteMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: acceptInviteDocs,
    koa: { after: [redirect] }
  })

  const service = app.service(acceptInvitePath)
  service.hooks(hooks)
}
