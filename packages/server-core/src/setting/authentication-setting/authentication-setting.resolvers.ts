// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  AuthAppCredentialsType,
  AuthBearerTokenType,
  AuthCallbackType,
  AuthDefaultsType,
  AuthenticationSettingDatabaseType,
  AuthenticationSettingPatch,
  AuthenticationSettingQuery,
  AuthenticationSettingType,
  AuthJwtOptionsType,
  AuthOauthType,
  AuthStrategiesType
} from '@xrengine/common/src/schemas/setting/authentication-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

export const authenticationSettingSchemaToDb = (patch: AuthenticationSettingPatch) => {
  return {
    ...patch,
    authStrategies:
      patch.authStrategies && typeof patch.authStrategies !== 'string'
        ? JSON.stringify(patch.authStrategies)
        : patch.authStrategies,
    jwtOptions:
      patch.jwtOptions && typeof patch.jwtOptions !== 'string' ? JSON.stringify(patch.jwtOptions) : patch.jwtOptions,
    bearerToken:
      patch.bearerToken && typeof patch.bearerToken !== 'string'
        ? JSON.stringify(patch.bearerToken)
        : patch.bearerToken,
    callback: patch.callback && typeof patch.callback !== 'string' ? JSON.stringify(patch.callback) : patch.callback,
    oauth: patch.oauth && typeof patch.oauth !== 'string' ? JSON.stringify(patch.oauth) : patch.oauth
  }
}

export const authenticationDbToSchema = (rawData: AuthenticationSettingDatabaseType): AuthenticationSettingType => {
  if (rawData.oauth && typeof rawData.oauth !== 'string') {
    // Did following because oauth string was incorrect
    rawData.oauth = Object.values(rawData.oauth).join('')
  }

  let authStrategies = JSON.parse(rawData.authStrategies) as AuthStrategiesType[]

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof authStrategies === 'string') {
    authStrategies = JSON.parse(authStrategies)
  }

  let jwtOptions: AuthJwtOptionsType | undefined = undefined
  if (rawData.jwtOptions) {
    jwtOptions = JSON.parse(rawData.jwtOptions) as AuthJwtOptionsType

    // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
    // was serialized multiple times, therefore we need to parse it twice.
    if (typeof jwtOptions === 'string') {
      jwtOptions = JSON.parse(jwtOptions)
    }
  }

  let bearerToken: AuthBearerTokenType | undefined = undefined
  if (rawData.bearerToken) {
    bearerToken = JSON.parse(rawData.bearerToken) as AuthBearerTokenType

    // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
    // was serialized multiple times, therefore we need to parse it twice.
    if (typeof bearerToken === 'string') {
      bearerToken = JSON.parse(bearerToken)
    }
  }

  let callback: AuthCallbackType | undefined = undefined
  if (rawData.callback) {
    callback = JSON.parse(rawData.callback) as AuthCallbackType

    // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
    // was serialized multiple times, therefore we need to parse it twice.
    if (typeof callback === 'string') {
      callback = JSON.parse(callback)
    }
  }

  let oauth: AuthOauthType | undefined = undefined
  if (rawData.oauth) {
    oauth = JSON.parse(rawData.oauth) as AuthOauthType

    // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
    // was serialized multiple times, therefore we need to parse it twice.
    if (typeof oauth === 'string') {
      oauth = JSON.parse(oauth)

      // We need to deserialized nested objects of pre-feathers 5 data.
      if (typeof oauth!.defaults === 'string') {
        oauth!.defaults = JSON.parse(oauth!.defaults) as AuthDefaultsType
      }

      if (typeof oauth!.apple === 'string') {
        oauth!.apple = JSON.parse(oauth!.apple) as AuthAppCredentialsType
      }

      if (typeof oauth!.facebook === 'string') {
        oauth!.facebook = JSON.parse(oauth!.facebook) as AuthAppCredentialsType
      }

      if (typeof oauth!.github === 'string') {
        oauth!.github = JSON.parse(oauth!.github) as AuthAppCredentialsType
      }

      if (typeof oauth!.google === 'string') {
        oauth!.google = JSON.parse(oauth!.google) as AuthAppCredentialsType
      }

      if (typeof oauth!.linkedin === 'string') {
        oauth!.linkedin = JSON.parse(oauth!.linkedin) as AuthAppCredentialsType
      }

      if (typeof oauth!.twitter === 'string') {
        oauth!.twitter = JSON.parse(oauth!.twitter) as AuthAppCredentialsType
      }

      if (typeof oauth!.discord === 'string') {
        oauth!.discord = JSON.parse(oauth!.discord) as AuthAppCredentialsType
      }
    }
  }

  return {
    ...rawData,
    authStrategies,
    jwtOptions,
    bearerToken,
    callback,
    oauth
  }
}

export const authenticationSettingResolver = resolve<AuthenticationSettingType, HookContext>(
  {
    createdAt: virtual(async (authenticationSetting) => fromDateTimeSql(authenticationSetting.createdAt)),
    updatedAt: virtual(async (authenticationSetting) => fromDateTimeSql(authenticationSetting.updatedAt))
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return authenticationDbToSchema(rawData)
    }
  }
)

export const authenticationSettingExternalResolver = resolve<AuthenticationSettingType, HookContext>({})

export const authenticationSettingDataResolver = resolve<AuthenticationSettingDatabaseType, HookContext>(
  {
    id: async () => {
      return uuidv4()
    },
    createdAt: getDateTimeSql,
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        authStrategies: JSON.stringify(rawData.authStrategies),
        jwtOptions: JSON.stringify(rawData.jwtOptions),
        bearerToken: JSON.stringify(rawData.bearerToken),
        callback: JSON.stringify(rawData.callback),
        oauth: JSON.stringify(rawData.oauth)
      }
    }
  }
)

export const authenticationSettingPatchResolver = resolve<AuthenticationSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const authenticationSettingQueryResolver = resolve<AuthenticationSettingQuery, HookContext>({})
