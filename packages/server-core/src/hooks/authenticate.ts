
import * as authentication from '@feathersjs/authentication'
import { NotAuthenticated } from '@feathersjs/errors'
import { HookContext, NextFunction, Paginated } from '@feathersjs/feathers'
import { Octokit } from '@octokit/rest'
import { AsyncLocalStorage } from 'async_hooks'
import { isProvider } from 'feathers-hooks-common'

import { userApiKeyPath, UserApiKeyType } from '@xrengine/common/src/schemas/user/user-api-key.schema'
import { userPath, UserType } from '@xrengine/common/src/schemas/user/user.schema'

import { JwtPayload, verify } from 'jsonwebtoken'
import { Application } from '../../declarations'
import config from '../appconfig'

const { authenticate } = authentication.hooks

export const asyncLocalStorage = new AsyncLocalStorage<{ user: UserType }>()

/**
 * https://github.com/feathersjs-ecosystem/dataloader/blob/main/docs/guide.md
 */
export default async (context: HookContext<Application>, next: NextFunction): Promise<HookContext> => {
  const store = asyncLocalStorage.getStore()

  // If user param is already stored then we don't need to
  // authenticate. This is typically an internal service call.
  if (!config.testEnabled && store && store.user) {
    if (!context.params.user) {
      context.params.user = store.user
    }

    return next()
  }

  // No need to authenticate if it's an internal call.
  const isInternal = isProvider('server')(context)
  if (isInternal) {
    if (context.params.user) {
      asyncLocalStorage.enterWith({ user: context.params.user })
    }

    return next()
  }

  if (context.arguments[1]?.token && context.path === 'project' && context.method === 'update') {
    const appId = config.authentication.oauth.github.appId ? parseInt(config.authentication.oauth.github.appId) : null
    const token = context.arguments[1].token
    if (!config.authentication.oauth.github.privateKey) throw new NotAuthenticated('No GitHub private key configured')
    const jwtDecoded = verify(token, config.authentication.oauth.github.privateKey, {
      algorithms: ['RS256']
    })! as JwtPayload
    if (jwtDecoded.iss == null || parseInt(jwtDecoded.iss) !== appId)
      throw new NotAuthenticated('Invalid app credentials')
    const octoKit = new Octokit({ auth: token })
    let appResponse
    try {
      appResponse = await octoKit.rest.apps.getAuthenticated()
    } catch (err) {
      throw new NotAuthenticated('Invalid app credentials')
    }
    if (appResponse.data.id !== appId) throw new NotAuthenticated('App ID of JWT does not match installed App ID')
    context.params.appJWT = token
    context.params.signedByAppJWT = true
    delete context.arguments[1].token
    return next()
  }

  // Ignore whitelisted services & methods
  const isWhitelisted = checkWhitelist(context)
  if (isWhitelisted) {
    return next()
  }

  // Check authorization token in headers
  const authHeader = context.params.headers?.authorization

  let authSplit
  if (authHeader) {
    authSplit = authHeader.split(' ')
  }

  if (authSplit && authSplit.length > 1 && authSplit[1]) {
    const key = (await context.app.service(userApiKeyPath).find({
      query: {
        token: authSplit[1]
      }
    })) as Paginated<UserApiKeyType>

    if (key.data.length > 0) {
      const user = await context.app.service(userPath).get(key.data[0].userId)
      context.params.user = user
      asyncLocalStorage.enterWith({ user })
      return next()
    }
  }

  // Check JWT token using feathers authentication.
  // It will throw if authentication information is not set for external requests.
  // https://feathersjs.com/api/authentication/hook.html#authenticate-hook
  context = await authenticate('jwt')(context)

  // if (!context.params[config.authentication.entity]?.userId) throw new BadRequest('Must authenticate with valid JWT or login token')
  if (context.params[config.authentication.entity]?.userId) {
    const user = await context.app.service(userPath).get(context.params[config.authentication.entity].userId)
    context.params.user = user
    asyncLocalStorage.enterWith({ user })
  }

  return next()
}

/**
 * A method to check if the service requesting is whitelisted.
 * In that scenario we don't need to perform authentication check.
 */
const checkWhitelist = (context: HookContext<Application>): boolean => {
  for (const item of config.authentication.whiteList) {
    if (typeof item === 'string' && context.path === item) {
      return true
    } else if (typeof item === 'object' && context.path === item.path && item.methods.includes(context.method)) {
      return true
    }
  }

  return false
}
