
import { Params } from '@feathersjs/feathers'
import { API } from '@xrengine/common'
import config from '@xrengine/common/src/config'
import multiLogger from '@xrengine/common/src/logger'
import { StaticResourceType, fileBrowserPath } from '@xrengine/common/src/schema.type.module'

const logger = multiLogger.child({ component: 'client-core:SceneAPI' })

/**
 * deleteScene used to delete project using projectId.
 *
 * @param  {string}  sceneId
 * @return {Promise}
 */
export const deleteScene = async (sceneKey: string): Promise<any> => {
  try {
    await API.instance.service(fileBrowserPath).remove(sceneKey)
  } catch (error) {
    logger.error(error, 'Error in deleting project')
    throw error
  }
  return true
}

export const renameScene = async (
  resource: StaticResourceType,
  newKey: string,
  projectName: string,
  params?: Params
) => {
  const oldPath = resource.key
  const newPath = newKey
  const oldName = resource.key.split('/').pop()!
  const newName = newKey.split('/').pop()!
  try {
    return await API.instance
      .service(fileBrowserPath)
      .update(null, { oldProject: projectName, newProject: projectName, oldPath, newPath, oldName, newName }, params)
  } catch (error) {
    logger.error(error, 'Error in renaming project')
    throw error
  }
}

export const createScene = async (
  projectName: string,
  templateURL = config.client.fileServer + '/projects/xrengine/default-project/public/scenes/default.gltf'
) => {
  const sceneData = await API.instance.service(fileBrowserPath).patch(null, {
    project: projectName,
    type: 'scene',
    body: templateURL,
    path: 'public/scenes/New-Scene.gltf',
    thumbnailKey: templateURL.replace(`${config.client.fileServer}/`, '').replace('.gltf', '.thumbnail.jpg'),
    unique: true
  })
  return sceneData
}
