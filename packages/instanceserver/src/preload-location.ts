
// import { WorldScene } from '@xrengine/engine/src/scene/systems/SceneLoadingSystem'
// import { Application } from '@xrengine/server-core/declarations'
// import config from '@xrengine/server-core/src/appconfig'
// import getLocalServerIp from '@xrengine/server-core/src/util/get-local-server-ip'

// TODO: fix this file - currently unused (but nice to have)

export {}
/*
export default async function (locationName, app: Application) {
  await app.isSetup
  let service, serviceId
  const locationResult = await app.service(locationPath).find({
    query: {
      slugifiedName: locationName
    }
  })
  if (locationResult.total === 0) return
  const location = locationResult.data[0]
  const scene = await app.get('sequelizeClient').models.collection.findOne({
    query: {
      sid: location.sceneId
    }
  })
  if (scene == null) return
  const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/
  const projectResult = await app.service(scenePath).get(scene.sid, null!)
  const projectUrl = projectResult.scene_url
  const regexResult = projectUrl.match(projectRegex)
  if (regexResult) {
    service = regexResult[1]
    serviceId = regexResult[2]
  }
  const result = await app.service(service).get(serviceId)

  let entitiesLeft = -1
  let lastEntitiesLeft = -1
  const loadingInterval = setInterval(() => {
    if (entitiesLeft >= 0 && lastEntitiesLeft !== entitiesLeft) {
      lastEntitiesLeft = entitiesLeft
      console.log(entitiesLeft + ' entites left...')
    }
  }, 1000)

  await updateSceneFromJSON(result, (left) => {
    entitiesLeft = left
  })

  clearInterval(loadingInterval)
  const agonesSDK = app.agonesSDK
  const isResult = await agonesSDK.getGameServer()
  const { status } = isResult
  const localIp = await getLocalServerIp()
  const selfIpAddress = `${status.address as string}:${status.portsList[0].port as string}`
  const newInstance = {
    currentUsers: 0,
    sceneId: location.sid,
    ipAddress: config.kubernetes.enabled ? selfIpAddress : `${localIp.ipAddress}:3031`,
    locationId: location.id
  } as any
  app.isMediaInstance = false
  const instanceResult = await app.service(instancePath).create(newInstance)
  app.instance = instanceResult

  console.log('Pre-loaded location', location.id)
}
*/
