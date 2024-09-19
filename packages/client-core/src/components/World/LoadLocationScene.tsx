import { t } from 'i18next'
import { useEffect } from 'react'

import { LocationService, LocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { useFind, useGet } from '@xrengine/common'
import { staticResourcePath } from '@xrengine/common/src/schema.type.module'
import { GLTFAssetState } from '@xrengine/engine/src/gltf/GLTFState'
import { getMutableState, useMutableState } from '@xrengine/hyperflux'

import { RouterState } from '../../common/services/RouterService'
import { WarningUIService } from '../../systems/WarningUISystem'
import { ClientContextState } from '../../util/ClientContextState'

export const useLoadLocation = (props: { locationName: string }) => {
  const locationState = useMutableState(LocationState)
  const scene = useGet(staticResourcePath, locationState.currentLocation.location.sceneId.value).data

  ClientContextState.useValue('location_id', locationState.currentLocation.location.id.value)
  ClientContextState.useValue('project_id', locationState.currentLocation.location.projectId.value)

  useEffect(() => {
    LocationState.setLocationName(props.locationName)
    if (locationState.locationName.value) LocationService.getLocationByName(locationState.locationName.value)
  }, [])

  useEffect(() => {
    if (locationState.invalidLocation.value) {
      WarningUIService.openWarning({
        title: t('common:instanceServer.invalidLocation'),
        body: `${t('common:instanceServer.cantFindLocation')} '${locationState.locationName.value}'. ${t(
          'common:instanceServer.misspelledOrNotExist'
        )}`,
        action: () => RouterState.navigate('/')
      })
    }
  }, [locationState.invalidLocation])

  useEffect(() => {
    if (locationState.currentLocation.selfNotAuthorized.value) {
      WarningUIService.openWarning({
        title: t('common:instanceServer.notAuthorizedAtLocationTitle'),
        body: t('common:instanceServer.notAuthorizedAtLocation'),
        action: () => RouterState.navigate('/')
      })
    }
  }, [locationState.currentLocation.selfNotAuthorized])

  /**
   * Once we have the location, fetch the current scene data
   */
  useEffect(() => {
    if (
      !locationState.currentLocation.location.sceneId.value ||
      locationState.invalidLocation.value ||
      locationState.currentLocation.selfNotAuthorized.value ||
      !scene
    )
      return
    const sceneURL = scene.url
    return GLTFAssetState.loadScene(sceneURL, scene.id)
  }, [locationState.currentLocation.location.sceneId, scene])
}

export const useLoadScene = (props: { projectName: string; sceneName: string }) => {
  const sceneKey = `projects/${props.projectName}/${props.sceneName}`
  const assetID = useFind(staticResourcePath, { query: { key: sceneKey, type: 'scene' } })

  useEffect(() => {
    if (!props.sceneName || !props.projectName) return
    if (!assetID.data.length) return
    getMutableState(LocationState).currentLocation.location.sceneId.set(assetID.data[0].id)
    return GLTFAssetState.loadScene(assetID.data[0].url, assetID.data[0].id)
  }, [assetID.data.length])
}
