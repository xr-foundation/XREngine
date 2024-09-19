import { AuthenticationRequest, AuthenticationResult } from '@feathersjs/authentication'
import { Paginated, Params } from '@feathersjs/feathers'
import { random } from 'lodash'

import { avatarPath, AvatarType } from '@xrengine/common/src/schemas/user/avatar.schema'
import { identityProviderPath } from '@xrengine/common/src/schemas/user/identity-provider.schema'
import { userApiKeyPath, UserApiKeyType } from '@xrengine/common/src/schemas/user/user-api-key.schema'
import { InviteCode, UserName, userPath } from '@xrengine/common/src/schemas/user/user.schema'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { RedirectConfig } from '../../types/OauthStrategies'
import getFreeInviteCode from '../../util/get-free-invite-code'
import makeInitialAdmin from '../../util/make-initial-admin'
import CustomOAuthStrategy, { CustomOAuthParams } from './custom-oauth'

export class FacebookStrategy extends CustomOAuthStrategy {
  constructor(app: Application) {
    super()
    this.app = app
  }

  async getEntityData(profile: any, entity: any, params: Params): Promise<any> {
    const baseData = await super.getEntityData(profile, null, {})
    const authResult = entity
      ? entity
      : await (this.app.service('authentication') as any).strategies.jwt.authenticate(
          { accessToken: params?.authentication?.accessToken },
          {}
        )
    const identityProvider = authResult[identityProviderPath] ? authResult[identityProviderPath] : authResult
    const userId = identityProvider ? identityProvider.userId : params?.query ? params.query.userId : undefined

    return {
      ...baseData,
      accountIdentifier: profile.name,
      type: 'facebook',
      userId
    }
  }

  async updateEntity(entity: any, profile: any, params: Params): Promise<any> {
    const authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
      { accessToken: params?.authentication?.accessToken },
      {}
    )
    if (!entity.userId) {
      const avatars = (await this.app
        .service(avatarPath)
        .find({ isInternal: true, query: { isPublic: true, $limit: 1000 } })) as Paginated<AvatarType>
      const code = (await getFreeInviteCode(this.app)) as InviteCode
      const newUser = await this.app.service(userPath).create({
        name: '' as UserName,
        isGuest: false,
        inviteCode: code,
        avatarId: avatars.data[random(avatars.data.length - 1)].id,
        scopes: []
      })
      entity.userId = newUser.id
      await this.app.service(identityProviderPath).patch(entity.id, {
        userId: newUser.id
      })
    }
    const identityProvider = authResult[identityProviderPath]
    const user = await this.app.service(userPath).get(entity.userId)
    await makeInitialAdmin(this.app, user.id)
    if (user.isGuest)
      await this.app.service(userPath).patch(entity.userId, {
        isGuest: false
      })
    const apiKey = (await this.app.service(userApiKeyPath).find({
      query: {
        userId: entity.userId
      }
    })) as Paginated<UserApiKeyType>
    if (apiKey.total === 0)
      await this.app.service(userApiKeyPath).create({
        userId: entity.userId
      })
    if (entity.type !== 'guest' && identityProvider.type === 'guest') {
      await this.app.service(identityProviderPath).remove(identityProvider.id)
      await this.app.service(userPath).remove(identityProvider.userId)
      await this.userLoginEntry(entity, params)
      return super.updateEntity(entity, profile, params)
    }
    const existingEntity = await super.findEntity(profile, params)
    if (!existingEntity) {
      profile.userId = user.id
      const newIP = await super.createEntity(profile, params)
      if (entity.type === 'guest') await this.app.service(identityProviderPath).remove(entity.id)
      await this.userLoginEntry(newIP, params)
      return newIP
    } else if (existingEntity.userId === identityProvider.userId) {
      await this.userLoginEntry(existingEntity, params)
      return existingEntity
    } else {
      throw new Error('Another user is linked to this account')
    }
  }

  async getRedirect(data: AuthenticationResult | Error, params: CustomOAuthParams): Promise<string> {
    let redirectConfig: RedirectConfig
    try {
      redirectConfig = JSON.parse(params.redirect!)
    } catch {
      redirectConfig = {}
    }
    let { domain: redirectDomain, path: redirectPath, instanceId: redirectInstanceId } = redirectConfig
    redirectDomain = redirectDomain ? `${redirectDomain}/auth/oauth/facebook` : config.authentication.callback.facebook

    if (data instanceof Error || Object.getPrototypeOf(data) === Error.prototype) {
      const err = data.message as string
      return redirectDomain + `?error=${err}`
    }

    const loginType = params.query?.userId ? 'connection' : 'login'
    let redirectUrl = `${redirectDomain}?token=${data.accessToken}&type=${loginType}`
    if (redirectPath) {
      redirectUrl = redirectUrl.concat(`&path=${redirectPath}`)
    }
    if (redirectInstanceId) {
      redirectUrl = redirectUrl.concat(`&instanceId=${redirectInstanceId}`)
    }

    return redirectUrl
  }

  async authenticate(authentication: AuthenticationRequest, originalParams: Params) {
    if (authentication.error) {
      if (authentication.error?.error?.type === 'OAuthException')
        throw new Error('You canceled the GitHub OAuth login flow')
      else
        throw new Error(
          'There was a problem with the Facebook OAuth login flow: ' + authentication.error?.error?.message
        )
    }
    return super.authenticate(authentication, originalParams)
  }
}
export default FacebookStrategy
