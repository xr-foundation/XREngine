
import { InstancedMesh, Material, Object3D, Vector3 } from 'three'

import {
  ComponentType,
  getComponent,
  getMutableComponent,
  getOptionalMutableComponent,
  hasComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { Entity } from '@xrengine/ecs/src/Entity'
import { getState, State } from '@xrengine/hyperflux'
import { isMobile } from '@xrengine/spatial/src/common/functions/isMobile'
import { addOBCPlugin } from '@xrengine/spatial/src/common/functions/OnBeforeCompilePlugin'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import {
  addObjectToGroup,
  GroupComponent,
  removeObjectFromGroup
} from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { DistanceFromCameraComponent } from '@xrengine/spatial/src/transform/components/DistanceComponents'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'
import { isMobileXRHeadset } from '@xrengine/spatial/src/xr/XRState'

import { STATIC_ASSET_REGEX } from '@xrengine/engine/src/assets/functions/pathResolver'
import { getGLTFAsync } from '../../../assets/functions/resourceLoaderHooks'
import { InstancingComponent } from '../../components/InstancingComponent'
import { ModelComponent } from '../../components/ModelComponent'
import { distanceBased, Heuristic, VariantComponent, VariantLevel } from '../../components/VariantComponent'
import getFirstMesh from '../../util/meshUtils'

export function updateModelVariant(
  entity: Entity,
  variantComponent: State<ComponentType<typeof VariantComponent>>,
  modelComponent: State<ComponentType<typeof ModelComponent>>
) {
  if (variantComponent.heuristic.value === Heuristic.DEVICE) {
    const targetDevice = isMobile || isMobileXRHeadset ? 'MOBILE' : 'DESKTOP'
    //get model src to mobile variant src
    const levelIndex = variantComponent.levels.findIndex((level) => level.metadata['device'] === targetDevice)
    if (levelIndex < 0) return
    const deviceVariant = variantComponent.levels[levelIndex]
    const modelRelativePath = STATIC_ASSET_REGEX.exec(modelComponent.src.value)?.[3]
    const deviceRelativePath = deviceVariant ? STATIC_ASSET_REGEX.exec(deviceVariant.src.value)?.[3] : ''
    if (deviceVariant && modelRelativePath !== deviceRelativePath) {
      variantComponent.currentLevel.set(levelIndex)
    }
  } else if (distanceBased(variantComponent.value as ComponentType<typeof VariantComponent>)) {
    const distance = DistanceFromCameraComponent.squaredDistance[entity]
    for (let i = 0; i < variantComponent.levels.length; i++) {
      const level = variantComponent.levels[i].value
      if ([level.metadata['minDistance'], level.metadata['maxDistance']].includes(undefined)) continue
      const minDistance = Math.pow(level.metadata['minDistance'], 2)
      const maxDistance = Math.pow(level.metadata['maxDistance'], 2)
      const useLevel = minDistance <= distance && distance <= maxDistance
      if (useLevel && level.src) {
        if (variantComponent.heuristic.value === Heuristic.BUDGET) {
          if (i >= variantComponent.budgetLevel.value) variantComponent.currentLevel.set(i)
          else variantComponent.currentLevel.set(variantComponent.budgetLevel.value)
        } else variantComponent.currentLevel.set(i)
        break
      }
    }
  } else if (
    variantComponent.heuristic.value === Heuristic.BUDGET &&
    variantComponent.budgetLevel.value != variantComponent.currentLevel.value
  ) {
    variantComponent.currentLevel.set(variantComponent.budgetLevel.value)
  }
}

function getMeshVariant(entity: Entity, variantComponent: ComponentType<typeof VariantComponent>): string | null {
  if (variantComponent.heuristic === Heuristic.DEVICE) {
    const targetDevice = isMobileXRHeadset ? 'XR' : isMobile ? 'MOBILE' : 'DESKTOP'
    //get model src to mobile variant src
    const deviceVariant = variantComponent.levels.find((level) => level.metadata['device'] === targetDevice)
    if (deviceVariant) return deviceVariant.src
  }

  return null
}

export function updateVariant(entity?: Entity) {
  if (!entity || getState(EngineState).isEditing) return null
  const variantComponent = getOptionalMutableComponent(entity, VariantComponent)
  if (!variantComponent) return null

  const modelComponent = getOptionalMutableComponent(entity, ModelComponent)
  if (modelComponent) updateModelVariant(entity, variantComponent, modelComponent)
}

/**
 * Handles setting LOD level for variant components of models based on performance offset
 * @param entity
 * @param performanceOffset
 */
export function setModelVariantLOD(entity: Entity, performanceOffset: number) {
  const variantComponent = getMutableComponent(entity, VariantComponent)
  if (variantComponent.heuristic.value === Heuristic.BUDGET)
    variantComponent.budgetLevel.set(Math.min(performanceOffset, variantComponent.levels.length - 1))
}

/**
 * Handles setting model src for model component based on variant component
 * @param entity
 */
export function setModelVariant(entity: Entity) {
  const variantComponent = getMutableComponent(entity, VariantComponent)
  const modelComponent = getMutableComponent(entity, ModelComponent)

  updateModelVariant(entity, variantComponent, modelComponent)
}

export async function setMeshVariant(entity: Entity) {
  const variantComponent = getComponent(entity, VariantComponent)
  const meshComponent = getComponent(entity, MeshComponent)

  const src = getMeshVariant(entity, variantComponent)
  if (!src) return
  const [gltf] = await getGLTFAsync(src, entity)
  if (!gltf) return
  const mesh = getFirstMesh(gltf.scene)
  if (!mesh) return
  if (!hasComponent(entity, MeshComponent)) return
  meshComponent.geometry = mesh.geometry
  meshComponent.material = mesh.material
  getMutableComponent(entity, MeshComponent).set((val) => val) // reactivly update mesh
}

export async function setInstancedMeshVariant(entity: Entity) {
  const variantComponent = getComponent(entity, VariantComponent)
  const meshComponent = getComponent(entity, MeshComponent)
  const instancingComponent = getComponent(entity, InstancingComponent)
  const transformComponent = getComponent(entity, TransformComponent)
  if (variantComponent.heuristic === Heuristic.DEVICE) {
    const targetDevice = isMobileXRHeadset ? 'XR' : isMobile ? 'MOBILE' : 'DESKTOP'
    //set model src to mobile variant src
    const deviceVariant = variantComponent.levels.find((level) => level.metadata['device'] === targetDevice)
    if (!deviceVariant) return
    const [gltf] = await getGLTFAsync(deviceVariant.src, entity)
    if (!gltf) return
    const mesh = getFirstMesh(gltf.scene)
    if (!mesh) return
    if (!hasComponent(entity, MeshComponent)) return
    meshComponent.geometry = mesh.geometry
    meshComponent.material = mesh.material
    getMutableComponent(entity, MeshComponent).set((val) => val) // reactivly update mesh
  } else if (variantComponent.heuristic === Heuristic.DISTANCE) {
    const referencedVariants: VariantLevel[] = []
    const variantIndices: number[] = []
    const cameraPosition = getComponent(Engine.instance.cameraEntity, TransformComponent).position
    const position = new Vector3()
    //complex solution: load only variants in range
    /*for (let i = 0; i < instancingComponent.instanceMatrix.count; i++) {
      //for each level, check if distance is in range
      position.set(
        instancingComponent.instanceMatrix.array[i * 16 + 12],
        instancingComponent.instanceMatrix.array[i * 16 + 13],
        instancingComponent.instanceMatrix.array[i * 16 + 14]
      )
      position.applyMatrix4(transformComponent.matrix)
      const distanceSq = cameraPosition.distanceToSquared(position)
      for (let j = 0; j < variantComponent.levels.length; j++) {
        const level = variantComponent.levels[j]
        const minDistance = Math.pow(level.metadata['minDistance'], 2)
        const maxDistance = Math.pow(level.metadata['maxDistance'], 2)
        const useLevel = minDistance <= distanceSq && distanceSq <= maxDistance
        if (useLevel) {
          if (!referencedVariants.includes(level)) {
            referencedVariants.push(level)
            variantIndices.push(j)
          }
        }
      }
    }*/

    //naive solution: load all variants
    for (let i = 0; i < variantComponent.levels.length; i++) {
      referencedVariants.push(variantComponent.levels[i])
      variantIndices.push(i)
    }
    const group = getComponent(entity, GroupComponent)
    const loadedVariants: VariantLevel[] = []
    //for levels in range, check if already loaded
    for (let i = 0; i < group.length; i++) {
      const loadedElement = group[i]
      if (!loadedElement.userData['variant']) continue
      const elementVariantData = loadedElement.userData['variant']
      const loadedVariant = referencedVariants.find(
        (variant, index) =>
          //if already loaded, check that the src and index are the same
          variant.src === elementVariantData.src && variantIndices[index] === elementVariantData.index
      )
      if (loadedVariant) {
        loadedVariants.push(loadedVariant)
        continue
      }
      //if not referenced or src is different, remove from group
      removeObjectFromGroup(entity, loadedElement)
    }
    for (let i = 0; i < referencedVariants.length; i++) {
      const referencedVariant = referencedVariants[i]
      if (loadedVariants.includes(referencedVariant)) continue //already loaded
      //if not already loaded, load src
      //add a placeholder element with src and index to group until actual variant loads
      const placeholder = new Object3D()
      placeholder.userData['variant'] = { src: referencedVariant.src, index: variantIndices[i] }
      addObjectToGroup(entity, placeholder)
      const [gltf] = await getGLTFAsync(referencedVariant.src, entity)
      if (!gltf) return
      const minDistance = referencedVariant.metadata['minDistance']
      const maxDistance = referencedVariant.metadata['maxDistance']
      const mesh = getFirstMesh(gltf.scene)
      if (!mesh) return
      //convert to instanced mesh, using existing instance matrix
      const instancedMesh =
        mesh instanceof InstancedMesh
          ? mesh
          : new InstancedMesh(mesh.geometry, mesh.material, instancingComponent.instanceMatrix.count)
      instancedMesh.instanceMatrix = instancingComponent.instanceMatrix
      instancedMesh.frustumCulled = false

      //add distance culling shader plugin
      const materials: Material[] = Array.isArray(instancedMesh.material)
        ? instancedMesh.material
        : [instancedMesh.material]
      for (const material of materials) {
        addOBCPlugin(material, {
          id: 'lod-culling',
          priority: 1,
          compile: (shader, renderer) => {
            shader.fragmentShader = shader.fragmentShader.replace(
              'void main() {\n',
              `
      void main() {
        float maxDistance = ${maxDistance.toFixed(1)};
        float minDistance = ${minDistance.toFixed(1)};
        // Calculate the camera distance from the geometry
        float cameraDistance = length(vViewPosition);
        // Discard fragments outside the minDistance and maxDistance range
        if (cameraDistance <= minDistance || cameraDistance >= maxDistance) {
          discard;
        }
    `
            )
          }
        })
      }
      //add variant metadata to mesh
      instancedMesh.userData['variant'] = {
        src: referencedVariant.src,
        index: variantIndices[i]
      }
      //remove placeholder
      removeObjectFromGroup(entity, placeholder)
      //add to group
      addObjectToGroup(entity, instancedMesh)
    }
  }
}
