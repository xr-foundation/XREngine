// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@xrengine/common/src/interfaces/OpaqueType'

import { UserID } from '@xrengine/hyperflux'
import { TypedString } from '../../types/TypeboxUtils'
import { instanceAttendanceSchema } from '../networking/instance-attendance.schema'
import { ScopeType } from '../scope/scope.schema'
import { locationAdminSchema } from '../social/location-admin.schema'
import { locationBanSchema } from '../social/location-ban.schema'
import { userSettingSchema } from '../user/user-setting.schema'
import { dataValidator, queryValidator } from '../validators'
import { avatarDataSchema, AvatarID } from './avatar.schema'
import { identityProviderSchema } from './identity-provider.schema'
import { userApiKeySchema } from './user-api-key.schema'
import { userLoginSchema } from './user-login.schema'

export type { UserID }

export const userPath = 'user'

export const userMethods = ['get', 'find', 'create', 'patch', 'remove'] as const

export const userScopeSchema = Type.Object(
  {
    type: TypedString<ScopeType>()
  },
  { $id: 'UserScope', additionalProperties: false }
)

export type InviteCode = OpaqueType<'InviteCode'> & string
export type UserName = OpaqueType<'UserName'> & string

// Main data model schema
export const userSchema = Type.Object(
  {
    id: TypedString<UserID>({
      format: 'uuid'
    }),
    name: TypedString<UserName>(),
    acceptedTOS: Type.Boolean(),
    isGuest: Type.Boolean(),
    inviteCode: Type.Optional(TypedString<InviteCode>()),
    avatarId: TypedString<AvatarID>(),
    avatar: Type.Ref(avatarDataSchema),
    userSetting: Type.Ref(userSettingSchema),
    apiKey: Type.Ref(userApiKeySchema),
    identityProviders: Type.Array(Type.Ref(identityProviderSchema)),
    locationAdmins: Type.Array(Type.Ref(locationAdminSchema)),
    locationBans: Type.Array(Type.Ref(locationBanSchema)),
    scopes: Type.Array(Type.Ref(userScopeSchema)),
    instanceAttendance: Type.Array(Type.Ref(instanceAttendanceSchema)),
    lastLogin: Type.Optional(Type.Ref(userLoginSchema)),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'User', additionalProperties: false }
)
export interface UserType extends Static<typeof userSchema> {}

// Schema for creating new entries
export const userDataSchema = Type.Partial(
  Type.Pick(userSchema, ['name', 'isGuest', 'inviteCode', 'avatarId', 'scopes']),
  { $id: 'UserData' }
)
export interface UserData extends Static<typeof userDataSchema> {}

// Schema for updating existing entries
export const userPatchSchema = Type.Partial(userSchema, {
  $id: 'UserPatch'
})
export interface UserPatch extends Static<typeof userPatchSchema> {}

export interface UserPublicPatch extends Pick<UserType, 'name' | 'id'> {}

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, [
  'id',
  'name',
  'isGuest',
  'inviteCode',
  'createdAt'
  // 'scopes'   Commented out because: https://discord.com/channels/509848480760725514/1093914405546229840/1095101536121667694
])
export const userQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties, {
      id: {
        $like: Type.String()
      },
      name: {
        $like: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object(
      {
        search: Type.Optional(Type.String()),
        skipAvatar: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface UserQuery extends Static<typeof userQuerySchema> {}

export const userScopeValidator = /* @__PURE__ */ getValidator(userScopeSchema, dataValidator)
export const userValidator = /* @__PURE__ */ getValidator(userSchema, dataValidator)
export const userDataValidator = /* @__PURE__ */ getValidator(userDataSchema, dataValidator)
export const userPatchValidator = /* @__PURE__ */ getValidator(userPatchSchema, dataValidator)
export const userQueryValidator = /* @__PURE__ */ getValidator(userQuerySchema, queryValidator)
