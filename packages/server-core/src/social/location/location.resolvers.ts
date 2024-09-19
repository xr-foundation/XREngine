
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { BadRequest } from '@feathersjs/errors'
import { projectPath, staticResourcePath } from '@xrengine/common/src/schema.type.module'
import {
  LocationAuthorizedUserType,
  locationAuthorizedUserPath
} from '@xrengine/common/src/schemas/social/location-authorized-user.schema'
import { LocationBanType, locationBanPath } from '@xrengine/common/src/schemas/social/location-ban.schema'
import { locationSettingPath } from '@xrengine/common/src/schemas/social/location-setting.schema'
import { LocationID, LocationQuery, LocationType } from '@xrengine/common/src/schemas/social/location.schema'
import { UserID } from '@xrengine/common/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import type { HookContext } from '@xrengine/server-core/declarations'
import slugify from 'slugify'
import config from '../../appconfig'
import { LocationService } from './location.class'

export const locationResolver = resolve<LocationType, HookContext>({
  locationSetting: virtual(async (location, context) => {
    const locationSetting = await context.app.service(locationSettingPath).find({
      query: {
        locationId: location.id as LocationID
      },
      paginate: false
    })
    return locationSetting.length > 0 ? locationSetting[0] : undefined
  }),
  locationAuthorizedUsers: virtual(async (location, context) => {
    return (await context.app.service(locationAuthorizedUserPath).find({
      query: {
        locationId: location.id as LocationID
      },
      paginate: false
    })) as LocationAuthorizedUserType[]
  }),
  locationBans: virtual(async (location, context) => {
    return (await context.app.service(locationBanPath).find({
      query: {
        locationId: location.id as LocationID
      },
      paginate: false
    })) as LocationBanType[]
  }),
  sceneAsset: virtual(async (location, context) => {
    return context.app.service(staticResourcePath).get(location.sceneId)
  }),
  url: virtual(async (location, _context) => {
    return `${config.client.url}/location/${location.slugifiedName}`
  }),
  createdAt: virtual(async (location) => fromDateTimeSql(location.createdAt)),
  updatedAt: virtual(async (location) => fromDateTimeSql(location.updatedAt))
})

export const locationExternalResolver = resolve<LocationType, HookContext>({
  isLobby: async (value, location) => !!location.isLobby, // https://stackoverflow.com/a/56523892/2077741
  isFeatured: async (value, location) => !!location.isFeatured // https://stackoverflow.com/a/56523892/2077741
})

export const locationDataResolver = resolve<LocationType, HookContext>({
  id: async () => {
    return uuidv4() as LocationID
  },
  slugifiedName: async (value, location) => {
    if (location.name) return slugify(location.name, { lower: true })
  },
  projectId: async (value, location, context: HookContext<LocationService>) => {
    try {
      const asset = await context.app.service(staticResourcePath).get(location.sceneId)
      if (!asset.project) throw new BadRequest('Error populating projectId into location')
      const project = await context.app.service(projectPath).find({ query: { name: asset.project } })
      if (!project || project.total === 0) throw new BadRequest('Error populating projectId into location')
      return project.data[0].id
    } catch (error) {
      throw new BadRequest('Error populating projectId into location')
    }
  },
  locationSetting: async (value, location) => {
    return {
      ...location.locationSetting,
      id: uuidv4(),
      locationType: location.locationSetting.locationType || 'public',
      locationId: '' as LocationID,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }
  },
  locationAdmin: async (value, location) => {
    return {
      ...location.locationAdmin,
      id: uuidv4(),
      locationId: '' as LocationID,
      userId: '' as UserID,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }
  },
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const locationPatchResolver = resolve<LocationType, HookContext>({
  slugifiedName: async (value, location) => {
    if (location.name) return slugify(location.name, { lower: true })
  },
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  updatedAt: getDateTimeSql
})

export const locationQueryResolver = resolve<LocationQuery, HookContext>({})
