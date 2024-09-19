
import React, { useEffect } from 'react'
import { SRGBColorSpace } from 'three'

import { getComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { createEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { QueryReactor, defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { getMutableState, getState, isClient, useHookstate } from '@xrengine/hyperflux'
import { GroupComponent } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { AnimationState } from '../AnimationManager'
import { AvatarDissolveComponent } from '../components/AvatarDissolveComponent'
import { AvatarPendingComponent } from '../components/AvatarPendingComponent'
import { SpawnEffectComponent } from '../components/SpawnEffectComponent'
import { AvatarAnimationSystem } from './AvatarAnimationSystem'

const lightScale = (y, r) => {
  return Math.min(1, Math.max(1e-3, y / r))
}

const lightOpacity = (y, r) => {
  return Math.min(1, Math.max(0, 1 - (y - r) * 0.5))
}

const growQuery = defineQuery([SpawnEffectComponent])
const dissolveQuery = defineQuery([AvatarDissolveComponent])

const execute = () => {
  const delta = getState(ECSState).deltaSeconds

  for (const entity of growQuery()) {
    TransformComponent.dirtyTransforms[entity] = true

    const { opacityMultiplier, plateEntity, lightEntities } = getComponent(entity, SpawnEffectComponent)
    if (!plateEntity) continue

    const plate = getComponent(plateEntity, GroupComponent)[0] as typeof SpawnEffectComponent.plateMesh
    plate.material.opacity = opacityMultiplier * (0.7 + 0.5 * Math.sin((Date.now() % 6283) * 5e-3))

    for (const rayEntity of lightEntities) {
      const ray = getComponent(rayEntity, GroupComponent)[0] as typeof SpawnEffectComponent.lightMesh
      const rayTransform = getComponent(rayEntity, TransformComponent)
      rayTransform.position.y += 2 * delta
      rayTransform.scale.y = lightScale(rayTransform.position.y, ray.geometry.boundingSphere!.radius)
      ray.material.opacity = lightOpacity(rayTransform.position.y, ray.geometry.boundingSphere!.radius)

      if (ray.material.opacity < 1e-3) {
        rayTransform.position.y = plate.position.y
      }
      ray.material.opacity *= opacityMultiplier
    }
  }

  for (const entity of dissolveQuery()) {
    const effectComponent = getComponent(entity, AvatarDissolveComponent)
    AvatarDissolveComponent.updateDissolveEffect(effectComponent.dissolveMaterials, entity, delta)
  }
}

const AvatarPendingReactor = () => {
  const entity = useEntityContext()

  useEffect(() => {
    const effectEntity = createEntity()

    setComponent(effectEntity, SpawnEffectComponent, {
      sourceEntity: entity,
      opacityMultiplier: 1
    })

    return () => {
      SpawnEffectComponent.fadeOut(effectEntity)
    }
  }, [])

  return null
}

const reactor = () => {
  if (!isClient) return null

  const assetsReady = useHookstate(false)

  const [itemLight] = useTexture('/static/itemLight.png')
  const [itemPlate] = useTexture('/static/itemPlate.png')

  useEffect(() => {
    const texture = itemLight
    if (!texture) return

    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
    SpawnEffectComponent.lightMesh.material.map = texture
  }, [itemLight])

  useEffect(() => {
    const texture = itemPlate
    if (!texture) return

    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
    SpawnEffectComponent.plateMesh.material.map = texture
  }, [itemPlate])

  useEffect(() => {
    if (itemLight && itemPlate) assetsReady.set(true)
  }, [itemLight, itemPlate])

  useEffect(() => {
    SpawnEffectComponent.lightMesh.geometry.computeBoundingSphere()
    SpawnEffectComponent.plateMesh.geometry.computeBoundingSphere()
    SpawnEffectComponent.lightMesh.name = 'light_obj'
    SpawnEffectComponent.plateMesh.name = 'plate_obj'
  }, [])

  const loadingEffect = useHookstate(getMutableState(AnimationState).avatarLoadingEffect)

  if (!loadingEffect.value || !assetsReady.value) return null

  return <QueryReactor Components={[AvatarPendingComponent]} ChildEntityReactor={AvatarPendingReactor} />
}

export const AvatarLoadingSystem = defineSystem({
  uuid: 'xrengine.engine.AvatarLoadingSystem',
  insert: { after: AvatarAnimationSystem },
  execute,
  reactor
})
