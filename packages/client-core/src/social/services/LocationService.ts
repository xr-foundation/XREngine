
import { Paginated } from '@feathersjs/feathers'

import {
  locationBanPath,
  LocationID,
  locationPath,
  LocationType,
  UserID,
  userPath
} from '@xrengine/common/src/schema.type.module'
import { Engine } from '@xrengine/ecs/src/Engine'
import { defineState, getMutableState, getState } from '@xrengine/hyperflux'

import { API } from '@xrengine/common'
import { useEffect } from 'react'
import { NotificationService } from '../../common/services/NotificationService'
import { AuthState } from '../../user/services/AuthService'

export const LocationSeed: LocationType = {
  id: '' as LocationID,
  name: '',
  slugifiedName: '',
  maxUsersPerInstance: 10,
  sceneId: '',
  projectId: '',
  url: '',
  sceneAsset: {} as any,
  isLobby: false,
  isFeatured: false,
  locationSetting: {
    id: '',
    locationId: '' as LocationID,
    audioEnabled: false,
    screenSharingEnabled: false,
    faceStreamingEnabled: false,
    locationType: 'private',
    videoEnabled: false,
    createdAt: '',
    updatedAt: ''
  },
  locationAuthorizedUsers: [],
  locationBans: [],
  updatedBy: '' as UserID,
  createdAt: '',
  updatedAt: ''
}

export const LocationState = defineState({
  name: 'LocationState',
  initial: () => ({
    locationName: null! as string,
    currentLocation: {
      location: LocationSeed as LocationType,
      bannedUsers: [] as string[],
      selfUserBanned: false,
      selfNotAuthorized: false
    },
    invalidLocation: false
  }),

  setLocationName: (locationName: string) => {
    getMutableState(LocationState).merge({ locationName })
  },

  fetchingCurrentSocialLocation: () => {
    getMutableState(LocationState).merge({
      currentLocation: {
        location: LocationSeed as LocationType,
        bannedUsers: [] as string[],
        selfUserBanned: false,
        selfNotAuthorized: false
      }
    })
  },

  socialLocationRetrieved: (location: LocationType) => {
    let bannedUsers = [] as string[]
    location.locationBans.forEach((ban) => {
      bannedUsers.push(ban.userId)
    })
    bannedUsers = [...new Set(bannedUsers)]
    getMutableState(LocationState).merge({
      currentLocation: {
        location: {
          ...location
        },
        bannedUsers,
        selfUserBanned: false,
        selfNotAuthorized: false
      }
    })
  },

  socialLocationNotFound: () => {
    getMutableState(LocationState).merge({
      currentLocation: {
        location: LocationSeed,
        bannedUsers: [],
        selfUserBanned: false,
        selfNotAuthorized: false
      },
      invalidLocation: true
    })
  },

  socialSelfUserBanned: (banned: boolean) => {
    getMutableState(LocationState).currentLocation.merge({ selfUserBanned: banned })
  },

  socialLocationNotAuthorized: () => {
    getMutableState(LocationState).currentLocation.merge({ selfNotAuthorized: true })
  }
})

export const LocationService = {
  getLocation: async (locationId: LocationID) => {
    try {
      LocationState.fetchingCurrentSocialLocation()
      const location = await API.instance.service(locationPath).get(locationId)
      LocationState.socialLocationRetrieved(location)
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  getLocationByName: async (locationName: string) => {
    LocationState.fetchingCurrentSocialLocation()
    try {
      const locationResult = (await API.instance.service(locationPath).find({
        query: {
          slugifiedName: locationName
        }
      })) as Paginated<LocationType>

      if (locationResult && locationResult.total > 0) {
        if (
          locationResult.data[0].locationSetting?.locationType === 'private' &&
          !locationResult.data[0].locationAuthorizedUsers?.find(
            (authUser) => authUser.userId === Engine.instance.userID
          )
        ) {
          LocationState.socialLocationNotAuthorized()
        } else LocationState.socialLocationRetrieved(locationResult.data[0])
      } else {
        LocationState.socialLocationNotFound()
      }
    } catch (err) {
      if (err.message.includes('Unable to find projectId'))
        NotificationService.dispatchNotify('You do not have access to this location.', {
          variant: 'error',
          persist: true
        })
    }
  },
  banUserFromLocation: async (userId: UserID, locationId: LocationID) => {
    try {
      await API.instance.service(locationBanPath).create({
        userId: userId,
        locationId: locationId
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  useLocationBanListeners: () => {
    useEffect(() => {
      const locationBanCreatedListener = async (params) => {
        const selfUser = getState(AuthState).user
        const currentLocation = getState(LocationState).currentLocation.location
        const locationBan = params.locationBan
        if (selfUser.id === locationBan.userId && currentLocation.id === locationBan.locationId) {
          const userId = selfUser.id ?? ''
          const user = await API.instance.service(userPath).get(userId)
          getMutableState(AuthState).merge({ user })
        }
      }
      API.instance.service(locationBanPath).on('created', locationBanCreatedListener)
      return () => {
        API.instance.service(locationBanPath).off('created', locationBanCreatedListener)
      }
    }, [])
  }
}
