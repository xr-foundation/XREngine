
import React, { useEffect } from 'react'
import { Material, Mesh } from 'three'

import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'

import { GroupQueryReactor } from '../renderer/components/GroupComponent'
import { MeshComponent } from '../renderer/components/MeshComponent'
import { VisibleComponent } from '../renderer/components/VisibleComponent'
import { XRState } from './XRState'

type ScenePlacementMaterialType = {
  userData: {
    ScenePlacement?: {
      previouslyTransparent: boolean
      previousOpacity: number
    }
  }
}

const addShaderToObject = (obj: Mesh<any, Material & ScenePlacementMaterialType>) => {
  if (obj.material) {
    if (!obj.material.userData) obj.material.userData = {}
    const userData = obj.material.userData
    if (!userData.ScenePlacement) {
      userData.ScenePlacement = {
        previouslyTransparent: obj.material.transparent,
        previousOpacity: obj.material.opacity
      }
    }
    obj.material.transparent = true
    obj.material.opacity = 0.3
    obj.material.needsUpdate = true
  }
}

const removeShaderFromObject = (obj: Mesh<any, Material & ScenePlacementMaterialType>) => {
  if (obj.material) {
    const userData = obj.material.userData
    if (userData?.ScenePlacement) {
      obj.material.transparent = userData.ScenePlacement.previouslyTransparent
      obj.material.opacity = userData.ScenePlacement.previousOpacity
      delete userData.ScenePlacement
    }
  }
}

/**
 * Updates materials with scene object placement opacity shader
 * @param world
 * @returns
 */

function XRScenePlacementReactor({ obj }) {
  const xrState = getMutableState(XRState)
  const scenePlacementMode = useHookstate(xrState.scenePlacementMode).value
  const sessionActive = useHookstate(xrState.sessionActive).value

  useEffect(() => {
    if (scenePlacementMode !== 'placing' || !sessionActive) return

    addShaderToObject(obj)
    return () => {
      removeShaderFromObject(obj)
    }
  }, [scenePlacementMode, sessionActive])

  return null
}

const reactor = () => {
  return (
    <GroupQueryReactor GroupChildReactor={XRScenePlacementReactor} Components={[VisibleComponent, MeshComponent]} />
  )
}

export const XRScenePlacementShaderSystem = defineSystem({
  uuid: 'xrengine.engine.XRScenePlacementShaderSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
