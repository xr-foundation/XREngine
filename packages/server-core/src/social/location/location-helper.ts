import { Paginated } from '@feathersjs/feathers/lib'
import { v4 as uuidv4 } from 'uuid'

import {
  LocationData,
  LocationID,
  locationPath,
  LocationSettingType,
  LocationType,
  staticResourcePath
} from '@xrengine/common/src/schema.type.module'
import { Application } from '@xrengine/server-core/declarations'
import logger from '@xrengine/server-core/src/ServerLogger'

export const createLocations = async (app: Application, projectName: string, sceneFiles: Record<string, string>) => {
  return Promise.all(
    Object.entries(sceneFiles).map(async ([locationName, fileName]) => {
      const cleanedLocationName = locationName.replace('-', ' ')

      const assetURL = `projects/${projectName}/${fileName}`
      const locationId = uuidv4() as LocationID

      const scene = (
        await app.service(staticResourcePath).find({
          query: { key: assetURL }
        })
      ).data.pop()
      if (!scene) return logger.warn(`Location ${cleanedLocationName} Scene not found for ${fileName}`)

      const locationSetting = {
        locationId,
        locationType: 'public',
        audioEnabled: true,
        videoEnabled: true,
        screenSharingEnabled: true,
        faceStreamingEnabled: true
      } as LocationSettingType

      const location = {
        id: locationId,
        name: cleanedLocationName,
        slugifiedName: cleanedLocationName,
        maxUsersPerInstance: 20,
        sceneId: scene.id,
        locationSetting,
        isLobby: false,
        isFeatured: false
      } as LocationData

      const existingLocation = (await app.service(locationPath).find({
        query: {
          slugifiedName: cleanedLocationName
        }
      })) as Paginated<LocationType>
      if (existingLocation.total === 0) await app.service(locationPath).create(location)
    })
  )
}
