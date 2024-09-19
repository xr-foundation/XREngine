import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import '../../engine'

import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import { useNetwork } from '@xrengine/client-core/src/components/World/EngineHooks'
import { LocationService, LocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { ECSRecordingActions } from '@xrengine/common/src/recording/ECSRecordingSystem'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { defineActionQueue, useMutableState } from '@xrengine/hyperflux'
import CaptureUI from '@xrengine/ui/src/pages/Capture'

import '@xrengine/client-core/src/world/ClientNetworkModule'

import { getMutableComponent, hasComponent, useQuery } from '@xrengine/ecs'

import '@xrengine/engine/src/EngineModule'

import Debug from '@xrengine/client-core/src/components/Debug'
import { AvatarControllerComponent } from '@xrengine/engine/src/avatar/components/AvatarControllerComponent'
import { RigidBodyComponent } from '@xrengine/spatial/src/physics/components/RigidBodyComponent'

const ecsRecordingErrorActionQueue = defineActionQueue(ECSRecordingActions.error.matches)

const NotifyRecordingErrorSystem = defineSystem({
  uuid: 'notifyRecordingErrorSystem',
  insert: { after: PresentationSystemGroup },
  execute: () => {
    for (const action of ecsRecordingErrorActionQueue()) {
      NotificationService.dispatchNotify(action.error, { variant: 'error' })
    }
  }
})

export const CaptureLocation = () => {
  const locationState = useMutableState(LocationState)

  const params = useParams()

  const locationName = params?.locationName as string | undefined

  useEffect(() => {
    if (locationName) LocationState.setLocationName(locationName)
  }, [])

  useEffect(() => {
    if (locationState.locationName.value) LocationService.getLocationByName(locationState.locationName.value)
  }, [locationState.locationName.value])

  const avatarQuery = useQuery([AvatarControllerComponent, RigidBodyComponent])

  useEffect(() => {
    //removeComponent(avatarQuery[0], AvatarControllerComponent)
    if (hasComponent(avatarQuery[0], RigidBodyComponent))
      getMutableComponent(avatarQuery[0], RigidBodyComponent).type.set('fixed')
  }, [avatarQuery])

  useNetwork({ online: !!locationName })

  AuthService.useAPIListeners()

  return (
    <>
      <CaptureUI />
      <Debug />
    </>
  )
}

export default CaptureLocation
