import { OAuthStrategy } from '@feathersjs/authentication-oauth'
import { Params } from '@feathersjs/feathers'

import multiLogger from '@xrengine/common/src/logger'
import { userLoginPath } from '@xrengine/common/src/schemas/user/user-login.schema'
import { UserID } from '@xrengine/common/src/schemas/user/user.schema'
import { Application } from '../../../declarations'

// import { OAuthProfile } from '@feathersjs/authentication-oauth/src/strategy'
const logger = multiLogger.child({ component: 'engine:ecs:CustomOAuthParams' })

export interface CustomOAuthParams extends Params {
  redirect?: string
  access_token?: string
  refresh_token?: string
}

export class CustomOAuthStrategy extends OAuthStrategy {
  // @ts-ignore
  app: Application

  async getEntityQuery(profile: any, _params: Params): Promise<any> {
    return {
      token: profile.sub ? `${this.name}:::${profile.sub as string}` : `${this.name}:::${profile.id as string}`
    }
  }

  async getEntityData(profile: any, _existingEntity: any, _params: Params): Promise<any> {
    return {
      token: profile.sub ? `${this.name}:::${profile.sub as string}` : `${this.name}:::${profile.id as string}`
    }
  }

  // Method to create a user login entry for SSO providers
  async userLoginEntry(entity: any, params: Params): Promise<any> {
    // Create a user-login entry
    try {
      await this.app.service(userLoginPath).create({
        userId: entity.userId as UserID,
        userAgent: params.headers!['user-agent'],
        identityProviderId: entity.id,
        ipAddress: params.forwarded?.ip || ''
      })
      logger.info('User login entry created successfully.')
    } catch (error) {
      logger.error('Error creating user login entry:', error)
    }
  }
}

export default CustomOAuthStrategy
