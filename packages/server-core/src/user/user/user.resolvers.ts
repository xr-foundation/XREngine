// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  instanceAttendancePath,
  InstanceAttendanceType
} from '@xrengine/common/src/schemas/networking/instance-attendance.schema'
import { instancePath } from '@xrengine/common/src/schemas/networking/instance.schema'
import { scopePath, ScopeTypeInterface } from '@xrengine/common/src/schemas/scope/scope.schema'
import { locationAdminPath, LocationAdminType } from '@xrengine/common/src/schemas/social/location-admin.schema'
import { locationBanPath, LocationBanType } from '@xrengine/common/src/schemas/social/location-ban.schema'
import { locationPath } from '@xrengine/common/src/schemas/social/location.schema'
import { avatarPath } from '@xrengine/common/src/schemas/user/avatar.schema'
import { identityProviderPath, IdentityProviderType } from '@xrengine/common/src/schemas/user/identity-provider.schema'
import { userApiKeyPath, UserApiKeyType } from '@xrengine/common/src/schemas/user/user-api-key.schema'
import { userAvatarPath, UserAvatarType } from '@xrengine/common/src/schemas/user/user-avatar.schema'
import { userSettingPath, UserSettingType } from '@xrengine/common/src/schemas/user/user-setting.schema'
import { InviteCode, UserID, UserName, UserQuery, UserType } from '@xrengine/common/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'

import { isDev } from '@xrengine/common/src/config'
import { userLoginPath } from '@xrengine/common/src/schemas/user/user-login.schema'
import logger from '../../ServerLogger'
import getFreeInviteCode from '../../util/get-free-invite-code'

export const userResolver = resolve<UserType, HookContext>({
  avatarId: virtual(async (user, context) => {
    const userAvatars = (await context.app.service(userAvatarPath).find({
      query: {
        userId: user.id
      },
      paginate: false
    })) as UserAvatarType[]

    return userAvatars.length > 0 ? userAvatars[0].avatarId : undefined
  }),
  identityProviders: virtual(async (user, context) => {
    return (await context.app.service(identityProviderPath).find({
      query: {
        userId: user.id
      },
      paginate: false
    })) as IdentityProviderType[]
  }),
  scopes: virtual(async (user, context) => {
    return (await context.app.service(scopePath).find({
      query: {
        userId: user.id
      },
      paginate: false
    })) as ScopeTypeInterface[]
  }),
  instanceAttendance: virtual(async (user, context) => {
    try {
      if (context.params.user?.id === context.id) {
        const instanceAttendance = (await context.app.service(instanceAttendancePath).find({
          query: {
            userId: user.id,
            ended: false
          },
          paginate: false
        })) as InstanceAttendanceType[]

        for (const attendance of instanceAttendance || []) {
          if (attendance.instanceId)
            attendance.instance = await context.app.service(instancePath).get(attendance.instanceId)
          if (attendance.instance && attendance.instance.locationId) {
            attendance.instance.location = await context.app.service(locationPath).get(attendance.instance.locationId)
          }
        }

        return instanceAttendance
      }
    } catch (err) {
      logger.error('Error in user service instanceAttendance resolver', err)
    }

    return []
  }),
  acceptedTOS: virtual(async (user, context) => {
    if (isDev) return true
    return !!user.acceptedTOS
  }),
  createdAt: virtual(async (user) => fromDateTimeSql(user.createdAt)),
  updatedAt: virtual(async (user) => fromDateTimeSql(user.updatedAt))
})

export const userExternalResolver = resolve<UserType, HookContext>({
  avatar: virtual(async (user, context) => {
    if (context.params?.actualQuery?.skipAvatar) return {}
    if (context.event !== 'removed' && user.avatarId)
      try {
        return await context.app.service(avatarPath).get(user.avatarId, { query: { skipUser: true } })
      } catch (err) {
        return {}
      }
  }),
  identityProviders: virtual(async (user, context) => {
    return (
      (await context.app.service(identityProviderPath).find({
        query: {
          userId: user.id
        },
        paginate: false
      })) as IdentityProviderType[]
    ).map((ip) => {
      const { oauthToken, ...returned } = ip
      return returned
    })
  }),
  userSetting: virtual(async (user, context) => {
    const userSetting = (await context.app.service(userSettingPath).find({
      query: {
        userId: user.id
      },
      paginate: false
    })) as UserSettingType[]

    return userSetting.length > 0 ? userSetting[0] : undefined
  }),
  apiKey: virtual(async (user, context) => {
    const apiKey = (await context.app.service(userApiKeyPath).find({
      query: {
        userId: user.id
      },
      paginate: false
    })) as UserApiKeyType[]

    return apiKey.length > 0 ? apiKey[0] : undefined
  }),
  locationAdmins: virtual(async (user, context) => {
    return (await context.app.service(locationAdminPath).find({
      query: {
        userId: user.id
      },
      paginate: false
    })) as LocationAdminType[]
  }),
  locationBans: virtual(async (user, context) => {
    return (await context.app.service(locationBanPath).find({
      query: {
        userId: user.id
      },
      paginate: false
    })) as LocationBanType[]
  }),
  lastLogin: virtual(async (user, context) => {
    const login = await context.app.service(userLoginPath).find({
      query: {
        userId: user.id,
        $sort: { createdAt: -1 },
        $limit: 1
      },
      paginate: false
    })
    return login.length > 0 ? login[0] : undefined
  }),
  // https://stackoverflow.com/a/56523892/2077741
  isGuest: async (value, user) => !!user.isGuest
})

export const userDataResolver = resolve<UserType, HookContext>({
  id: async (id) => {
    return id || (uuidv4() as UserID)
  },
  name: async (name) => {
    return name || (('Guest #' + Math.floor(Math.random() * (999 - 100 + 1) + 100)) as UserName)
  },
  inviteCode: async (inviteCode, _, context) => {
    return inviteCode || ((await getFreeInviteCode(context.app)) as InviteCode)
  },
  avatarId: async (avatarId) => {
    return avatarId || undefined
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const userPatchResolver = resolve<UserType, HookContext>({
  updatedAt: getDateTimeSql
})

export const userQueryResolver = resolve<UserQuery, HookContext>({})
