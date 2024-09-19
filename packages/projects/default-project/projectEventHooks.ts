
import { BadRequest } from '@feathersjs/errors'
import fs from 'fs'
import path from 'path'

import { locationPath, LocationType, OembedType, ProjectType } from '@xrengine/common/src/schema.type.module'
import { createLocations } from '@xrengine/projects/createLocations'
import { ProjectEventHooks } from '@xrengine/projects/ProjectConfigInterface'
import { Application } from '@xrengine/server-core/declarations'
import { getStorageProvider } from '@xrengine/server-core/src/media/storageprovider/storageprovider'

import { patchStaticResourceAsAvatar, supportedAvatars } from '@xrengine/server-core/src/user/avatar/avatar-helper'
import appRootPath from 'app-root-path'
import manifestJson from './manifest.json'

const projectRelativeFolder = path.resolve(appRootPath.path, 'packages/projects')
const avatarsFolder = path.resolve(__dirname, 'assets/avatars')

const handleOEmbedRequest = async (app: Application, project: ProjectType, url: URL, currentOEmbed: OembedType) => {
  const isLocation = /^\/location\//.test(url.pathname)
  const isAdminPanel = /^\/admin/.test(url.pathname)
  const isEditor = /^\/studio/.test(url.pathname)
  if (isLocation) {
    const locationName = url.pathname.replace(/\/location\//, '')
    const locationResult = (await app.service(locationPath).find({
      query: {
        slugifiedName: locationName
      },
      pagination: false
    } as any)) as any as LocationType[]
    if (locationResult.length === 0) throw new BadRequest('Invalid location name')
    const projectName = locationResult[0].sceneAsset.project
    const sceneName = locationResult[0].sceneAsset.key.split('/').pop()!.replace('.gltf', '')
    const storageProvider = getStorageProvider()
    currentOEmbed.title = `${locationResult[0].name} - ${currentOEmbed.title}`
    currentOEmbed.description = `Join others in VR at ${locationResult[0].name}, directly from the web browser`
    currentOEmbed.type = 'photo'
    currentOEmbed.url = `https://${storageProvider.getCacheDomain()}/projects/${projectName}/${sceneName}.thumbnail.jpeg`
    currentOEmbed.height = 320
    currentOEmbed.width = 512

    return currentOEmbed
  } else if (isAdminPanel) {
    currentOEmbed.title = `Admin Dashboard - ${currentOEmbed.title}`
    currentOEmbed.description = `Manage all aspects of your deployment. ${currentOEmbed.description}`

    return currentOEmbed
  } else if (isEditor) {
    currentOEmbed.title = `Studio - ${currentOEmbed.title}`
    currentOEmbed.description = `No need to download extra software. Create, publish, and edit your world directly in the web browser.`

    let subPath = url.pathname.replace(/\/studio\//, '')
    if (subPath.startsWith('studio')) {
      subPath = url.pathname.replace(/\/studio/, '')
    }

    if (subPath.includes('/')) {
      const locationResult = (await app.service(locationPath).find({
        query: {
          sceneId: subPath
        },
        pagination: false
      } as any)) as any as LocationType[]
      if (locationResult.length > 0) {
        const projectName = locationResult[0].sceneAsset.project
        const sceneName = locationResult[0].sceneAsset.key.split('/').pop()!.replace('.gltf', '')
        const storageProvider = getStorageProvider()
        currentOEmbed.title = `${locationResult[0].name} Studio - ${currentOEmbed.title}`
        currentOEmbed.type = 'photo'
        currentOEmbed.url = `https://${storageProvider.getCacheDomain()}/projects/${projectName}/${sceneName}.thumbnail.jpeg`
        currentOEmbed.height = 320
        currentOEmbed.width = 512
        return currentOEmbed
      }
    } else if (subPath.length > 0) {
      currentOEmbed.title = `${subPath} Editor - ${currentOEmbed.title}`
      return currentOEmbed
    }

    return null
  }
}

const config = {
  onInstall: async (app: Application) => {
    await createLocations(app, manifestJson.name, {
      apartment: 'public/scenes/apartment.gltf',
      default: 'public/scenes/default.gltf',
      ['sky-station']: 'public/scenes/sky-station.gltf'
    })
    await Promise.all(
      fs
        .readdirSync(avatarsFolder)
        .filter((file) => supportedAvatars.includes(file.split('.').pop()!))
        .map((file) =>
          patchStaticResourceAsAvatar(
            app,
            manifestJson.name,
            path.resolve(avatarsFolder, file).replace(projectRelativeFolder + '/', '')
          )
        )
    )
  },
  // onUpdate: (app: Application) => {
  //   return installAvatarsFromProject(app, avatarsFolder)
  // },
  onOEmbedRequest: handleOEmbedRequest
  // TODO: remove avatars
  // onUninstall: (app: Application) => {
  // }
} as ProjectEventHooks

export default config
