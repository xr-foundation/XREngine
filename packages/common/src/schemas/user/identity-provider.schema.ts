// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, StringEnum, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { UserID } from './user.schema'

export const identityProviderPath = 'identity-provider'

export const identityProviderMethods = ['find', 'create', 'get', 'patch', 'remove'] as const

export const identityProviderTypes = [
  'email',
  'sms',
  'password',
  'apple',
  'discord',
  'github',
  'google',
  'facebook',
  'twitter',
  'linkedin',
  'auth0',
  'guest'
] as const

// Main data model schema
export const identityProviderSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    token: Type.String(),
    accountIdentifier: Type.Optional(Type.String()),
    oauthToken: Type.Optional(Type.String()),
    oauthRefreshToken: Type.Optional(Type.String()),

    // @ts-ignore
    type: StringEnum(identityProviderTypes),
    userId: TypedString<UserID>(),
    accessToken: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'IdentityProvider', additionalProperties: false }
)
export interface IdentityProviderType extends Static<typeof identityProviderSchema> {}

// Schema for creating new entries
export const identityProviderDataSchema = Type.Pick(
  identityProviderSchema,
  ['token', 'accountIdentifier', 'oauthToken', 'oauthRefreshToken', 'type', 'userId', 'email'],
  {
    $id: 'IdentityProviderData'
  }
)
export interface IdentityProviderData extends Static<typeof identityProviderDataSchema> {}

// Schema for updating existing entries
export const identityProviderPatchSchema = Type.Partial(identityProviderSchema, {
  $id: 'IdentityProviderPatch'
})
export interface IdentityProviderPatch extends Static<typeof identityProviderPatchSchema> {}

// Schema for allowed query properties
export const identityProviderQueryProperties = Type.Pick(identityProviderSchema, [
  'id',
  'token',
  'accountIdentifier',
  'oauthToken',
  'oauthRefreshToken',
  'type',
  'userId',
  'email'
])
export const identityProviderQuerySchema = Type.Intersect(
  [
    querySyntax(identityProviderQueryProperties, {
      accountIdentifier: {
        $like: Type.String()
      },
      email: {
        $like: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface IdentityProviderQuery extends Static<typeof identityProviderQuerySchema> {}

export const identityProviderValidator = /* @__PURE__ */ getValidator(identityProviderSchema, dataValidator)
export const identityProviderDataValidator = /* @__PURE__ */ getValidator(identityProviderDataSchema, dataValidator)
export const identityProviderPatchValidator = /* @__PURE__ */ getValidator(identityProviderPatchSchema, dataValidator)
export const identityProviderQueryValidator = /* @__PURE__ */ getValidator(identityProviderQuerySchema, queryValidator)
