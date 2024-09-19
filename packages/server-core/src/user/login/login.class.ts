
import { Id, Paginated, ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'

import { identityProviderPath } from '@xrengine/common/src/schemas/user/identity-provider.schema'
import { loginTokenPath, LoginTokenType } from '@xrengine/common/src/schemas/user/login-token.schema'
import { userApiKeyPath, UserApiKeyType } from '@xrengine/common/src/schemas/user/user-api-key.schema'
import { UserID, userPath } from '@xrengine/common/src/schemas/user/user.schema'

import { userLoginPath } from '@xrengine/common/src/schemas/user/user-login.schema'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import makeInitialAdmin from '../../util/make-initial-admin'

export interface LoginParams extends KnexAdapterParams {}

/**
 * A class for Login service
 */
export class LoginService implements ServiceInterface {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * A function which find specific login details
   *
   * @param id of specific login detail
   * @param params
   * @returns {token}
   */
  async get(id: Id, params?: LoginParams) {
    try {
      if (!id) {
        logger.info('Invalid login token id, cannot be null or undefined')
        return {
          error: 'invalid login token id, cannot be null or undefined'
        }
      }
      const result = (await this.app.service(loginTokenPath).find({
        query: {
          token: id.toString()
        }
      })) as Paginated<LoginTokenType>

      if (result.data.length === 0) {
        logger.info('Invalid login token')
        return {
          error: 'invalid login token'
        }
      }
      if (new Date() > new Date(result.data[0].expiresAt)) {
        logger.info('Login Token has expired')
        return { error: 'Login link has expired' }
      }
      const identityProvider = await this.app.service(identityProviderPath).get(result.data[0].identityProviderId)
      await makeInitialAdmin(this.app, identityProvider.userId)
      const apiKey = (await this.app.service(userApiKeyPath).find({
        query: {
          userId: identityProvider.userId
        }
      })) as Paginated<UserApiKeyType>
      if (apiKey.total === 0)
        await this.app.service(userApiKeyPath).create({
          userId: identityProvider.userId
        })
      const token = await this.app
        .service('authentication')
        .createAccessToken({}, { subject: identityProvider.id.toString() })

      await this.app.service(identityProviderPath).remove(null, {
        query: {
          userId: identityProvider.userId,
          type: 'guest'
        }
      })

      await this.app.service(loginTokenPath).remove(result.data[0].id)
      await this.app.service(userPath).patch(identityProvider.userId, {
        isGuest: false
      })

      // Create a user-login record
      await this.app.service(userLoginPath).create({
        userId: identityProvider.userId as UserID,
        userAgent: params?.headers!['user-agent'],
        identityProviderId: identityProvider.id,
        ipAddress: params?.forwarded?.ip || ''
      })

      return {
        token: token
      }
    } catch (err) {
      logger.error(err, `Error finding login token: ${err}`)
      throw err
    }
  }
}
