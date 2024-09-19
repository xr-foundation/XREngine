import { NotAuthenticated } from '@feathersjs/errors'
import { Paginated, ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'
import crypto from 'crypto'

import { serverSettingPath, ServerSettingType } from '@xrengine/common/src/schemas/setting/server-setting.schema'
import { githubRepoAccessRefreshPath } from '@xrengine/common/src/schemas/user/github-repo-access-refresh.schema'
import { identityProviderPath, IdentityProviderType } from '@xrengine/common/src/schemas/user/identity-provider.schema'
import { userPath } from '@xrengine/common/src/schemas/user/user.schema'

import { Application } from '../../../declarations'

export interface GithubRepoAccessWebhookParams extends KnexAdapterParams {}

/**
 * A class for Github Repo Access Webhook service
 */
export class GithubRepoAccessWebhookService implements ServiceInterface<string, GithubRepoAccessWebhookParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(data, params) {
    const SIG_HEADER_NAME = 'x-hub-signature-256'
    const SIG_HASH_ALGORITHM = 'sha256'
    try {
      const secret = ((await this.app.service(serverSettingPath).find()) as Paginated<ServerSettingType>).data[0]
        .githubWebhookSecret
      const sig = Buffer.from(params.headers[SIG_HEADER_NAME] || '', 'utf8')
      const hmac = crypto.createHmac(SIG_HASH_ALGORITHM, secret)
      const digest = Buffer.from(SIG_HASH_ALGORITHM + '=' + hmac.update(JSON.stringify(data)).digest('hex'), 'utf8')
      if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
        throw new NotAuthenticated('Invalid secret')
      }
      const { blocked_user, member, membership } = data
      const ghUser = member
        ? member.login
        : membership
        ? membership.user.login
        : blocked_user
        ? blocked_user.login
        : null
      if (!ghUser) return ''

      const githubIdentityProvider = (await this.app.service(identityProviderPath).find({
        query: {
          type: 'github',
          accountIdentifier: ghUser,
          $limit: 1
        }
      })) as Paginated<IdentityProviderType>

      if (githubIdentityProvider.data.length === 0) return ''
      const user = await this.app.service(userPath).get(githubIdentityProvider.data[0].userId)
      // GitHub's API doesn't always reflect changes to user repo permissions right when a webhook is sent.
      // 10 seconds should be more than enough time for the changes to propagate.
      setTimeout(() => {
        this.app.service(githubRepoAccessRefreshPath).find({ user })
      }, 10000)
      return ''
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}
