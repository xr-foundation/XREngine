import React, { useEffect } from 'react'
import {
  Light,
  Material,
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  SkinnedMesh,
  Texture
} from 'three'

import { entityExists, useEntityContext, UUIDComponent } from '@xrengine/ecs'
import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  serializeComponent,
  setComponent,
  useOptionalComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { Entity, EntityUUID } from '@xrengine/ecs/src/Entity'
import { defineQuery, QueryReactor } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { getMutableState, getState, useHookstate, useImmediateEffect } from '@xrengine/hyperflux'
import { CallbackComponent } from '@xrengine/spatial/src/common/CallbackComponent'
import { ColliderComponent } from '@xrengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@xrengine/spatial/src/physics/components/RigidBodyComponent'
import { ThreeToPhysics } from '@xrengine/spatial/src/physics/types/PhysicsTypes'
import { GroupComponent, GroupQueryReactor } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'
import { ResourceManager } from '@xrengine/spatial/src/resources/ResourceState'
import {
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '@xrengine/spatial/src/transform/components/DistanceComponents'
import { isMobileXRHeadset } from '@xrengine/spatial/src/xr/XRState'

import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@xrengine/spatial/src/renderer/materials/MaterialComponent'
import { createAndAssignMaterial } from '@xrengine/spatial/src/renderer/materials/materialFunctions'
import { EnvmapComponent } from '../components/EnvmapComponent'
import { ModelComponent } from '../components/ModelComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { SourceComponent } from '../components/SourceComponent'
import { UpdatableCallback, UpdatableComponent } from '../components/UpdatableComponent'
import { getModelSceneID, useModelSceneID } from '../functions/loaders/ModelFunctions'

const disposeMaterial = (material: Material) => {
  for (const [key, val] of Object.entries(material) as [string, Texture][]) {
    if (val && typeof val.dispose === 'function') {
      val.dispose()
    }
  }
  material.dispose()
}

export const disposeObject3D = (obj: Object3D) => {
  const mesh = obj as Mesh<any, any>
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(disposeMaterial)
    } else {
      disposeMaterial(mesh.material)
    }
  }

  if (mesh.geometry) {
    mesh.geometry.dispose()
    for (const key in mesh.geometry.attributes) {
      mesh.geometry.deleteAttribute(key)
    }
  }

  const skinnedMesh = obj as SkinnedMesh
  if (skinnedMesh.isSkinnedMesh) {
    skinnedMesh.skeleton?.dispose()
  }

  const light = obj as Light // anything with dispose function
  if (typeof light.dispose === 'function') light.dispose()
}

export const ExpensiveMaterials = new Set([MeshPhongMaterial, MeshStandardMaterial, MeshPhysicalMaterial])
/**@todo refactor this to use preprocessor directives instead of new cloned materials with different shaders */
export function setupObject(obj: Object3D, entity: Entity, forceBasicMaterials = false) {
  const child = obj as any as Mesh<any, any>
  if (child.material) {
    const shouldMakeBasic =
      (forceBasicMaterials || isMobileXRHeadset) && ExpensiveMaterials.has(child.material.constructor)
    if (shouldMakeBasic) {
      const basicUUID = `basic-${child.material.uuid}` as EntityUUID
      const basicMaterialEntity = UUIDComponent.getEntityByUUID(basicUUID)
      if (basicMaterialEntity) {
        child.material = getComponent(basicMaterialEntity, MaterialStateComponent).material
        return
      }
      const prevMaterial = child.material
      const onlyEmmisive = prevMaterial.emissiveMap && !prevMaterial.map
      const newBasicMaterial = new MeshLambertMaterial().copy(prevMaterial)
      newBasicMaterial.specularMap = prevMaterial.roughnessMap ?? prevMaterial.specularIntensityMap
      if (onlyEmmisive) newBasicMaterial.emissiveMap = prevMaterial.emissiveMap
      else newBasicMaterial.map = prevMaterial.map
      newBasicMaterial.reflectivity = prevMaterial.metalness
      newBasicMaterial.envMap = prevMaterial.envMap
      newBasicMaterial.uuid = basicUUID
      newBasicMaterial.alphaTest = prevMaterial.alphaTest
      newBasicMaterial.side = prevMaterial.side
      newBasicMaterial.plugins = undefined

      createAndAssignMaterial(entity, newBasicMaterial)
      setComponent(entity, MaterialInstanceComponent, { uuid: [basicUUID] })
    } else {
      const UUID = child.material.uuid as EntityUUID
      const basicMaterialEntity = UUIDComponent.getEntityByUUID(UUID)
      if (!basicMaterialEntity) return

      const nonBasicUUID = UUID.slice(6) as EntityUUID
      const materialEntity = UUIDComponent.getEntityByUUID(nonBasicUUID)
      if (!materialEntity) return

      setComponent(entity, MaterialInstanceComponent, { uuid: [nonBasicUUID] })
    }
  }
}

const groupQuery = defineQuery([GroupComponent])
const updatableQuery = defineQuery([UpdatableComponent, CallbackComponent])

function SceneObjectReactor(props: { entity: Entity; obj: Object3D }) {
  const { entity, obj } = props

  const renderState = getMutableState(RendererState)
  const forceBasicMaterials = useHookstate(renderState.forceBasicMaterials)

  useImmediateEffect(() => {
    setComponent(entity, DistanceFromCameraComponent)
    return () => {
      if (entityExists(entity)) removeComponent(entity, DistanceFromCameraComponent)
    }
  }, [])

  useEffect(() => {
    const source = hasComponent(entity, ModelComponent)
      ? getModelSceneID(entity)
      : getOptionalComponent(entity, SourceComponent)
    return () => {
      ResourceManager.unloadObj(obj, source)
    }
  }, [])

  useEffect(() => {
    setupObject(obj, entity, forceBasicMaterials.value)
  }, [forceBasicMaterials])

  return null
}

const minimumFrustumCullDistanceSqr = 5 * 5 // 5 units

const execute = () => {
  const delta = getState(ECSState).deltaSeconds
  for (const entity of updatableQuery()) {
    const callbacks = getComponent(entity, CallbackComponent)
    callbacks.get(UpdatableCallback)?.(delta)
  }

  for (const entity of groupQuery()) {
    const group = getComponent(entity, GroupComponent)
    /**
     * do frustum culling here, but only if the object is more than 5 units away
     */
    const visible =
      hasComponent(entity, VisibleComponent) &&
      !(
        FrustumCullCameraComponent.isCulled[entity] &&
        DistanceFromCameraComponent.squaredDistance[entity] > minimumFrustumCullDistanceSqr
      )

    for (const obj of group) obj.visible = visible
  }
}

const ModelEntityReactor = () => {
  const entity = useEntityContext()
  const modelSceneID = useModelSceneID(entity)
  const childEntities = useHookstate(SourceComponent.entitiesBySourceState[modelSceneID])

  return (
    <>
      {childEntities.value?.map((childEntity: Entity) => (
        <ChildReactor key={childEntity} entity={childEntity} parentEntity={entity} />
      ))}
    </>
  )
}

const ChildReactor = (props: { entity: Entity; parentEntity: Entity }) => {
  const isMesh = useOptionalComponent(props.entity, MeshComponent)
  const isModelColliders = useOptionalComponent(props.parentEntity, RigidBodyComponent)
  const isVisible = useOptionalComponent(props.entity, VisibleComponent)

  const shadowComponent = useOptionalComponent(props.parentEntity, ShadowComponent)
  useEffect(() => {
    if (!isMesh || !isVisible) return
    if (shadowComponent) setComponent(props.entity, ShadowComponent, getComponent(props.parentEntity, ShadowComponent))
    else removeComponent(props.entity, ShadowComponent)
  }, [isVisible, isMesh, shadowComponent?.cast, shadowComponent?.receive])

  const envmapComponent = useOptionalComponent(props.parentEntity, EnvmapComponent)
  useEffect(() => {
    if (!isMesh || !isVisible) return
    if (envmapComponent)
      setComponent(props.entity, EnvmapComponent, serializeComponent(props.parentEntity, EnvmapComponent))
    else removeComponent(props.entity, EnvmapComponent)
  }, [
    isVisible,
    isMesh,
    envmapComponent,
    envmapComponent?.envMapIntensity,
    envmapComponent?.envmap,
    envmapComponent?.envMapSourceColor,
    envmapComponent?.envMapSourceURL,
    envmapComponent?.envMapTextureType,
    envmapComponent?.envMapSourceEntityUUID
  ])

  useEffect(() => {
    if (!isModelColliders || !isMesh) return

    const geometry = getComponent(props.entity, MeshComponent).geometry

    const shape = ThreeToPhysics[geometry.type]

    if (!shape) return

    setComponent(props.entity, ColliderComponent, { shape })

    return () => {
      removeComponent(props.entity, ColliderComponent)
    }
  }, [isModelColliders, isMesh])

  return null
}

const reactor = () => {
  return (
    <>
      <QueryReactor Components={[ModelComponent]} ChildEntityReactor={ModelEntityReactor} />
      <GroupQueryReactor GroupChildReactor={SceneObjectReactor} />
    </>
  )
}
//<QueryReactor Components={[SourceComponent]} ChildEntityReactor={SceneObjectEntityReactor} />
export const SceneObjectSystem = defineSystem({
  uuid: 'xrengine.engine.SceneObjectSystem',
  insert: { after: AnimationSystemGroup },
  execute,
  reactor
})
