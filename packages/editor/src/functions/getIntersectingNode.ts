import { Camera, Intersection, Mesh, Object3D, Raycaster, Vector2 } from 'three'

import { defineQuery } from '@xrengine/ecs'
import { getComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { Entity } from '@xrengine/ecs/src/Entity'
import { getState } from '@xrengine/hyperflux'
import { CameraComponent } from '@xrengine/spatial/src/camera/components/CameraComponent'
import { GroupComponent } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayers } from '@xrengine/spatial/src/renderer/constants/ObjectLayers'

import { SelectionState } from '../services/SelectionServices'

type RaycastIntersectionNode = Intersection<Object3D> & {
  obj3d: Object3D
  node?: Entity
}

function getParentEntity(obj: Object3D): Object3D {
  let curObj = obj

  while (curObj) {
    if (curObj.entity) break
    curObj = curObj.parent! as Object3D
  }

  return curObj
}

export function getIntersectingNode(results: Intersection<Object3D>[]): RaycastIntersectionNode | undefined {
  if (results.length <= 0) return
  const selectionState = getState(SelectionState)
  const selected = new Set<string | Entity>(selectionState.selectedEntities)
  for (const result of results as RaycastIntersectionNode[]) {
    const obj = result.object //getParentEntity(result.object)
    const parentNode = getParentEntity(obj)
    if (!parentNode) continue //skip obj3ds that are not children of EntityNodes
    if (!obj.entity && parentNode && !selected.has(parentNode.entity)) {
      result.node = parentNode.entity
      result.obj3d = getComponent(parentNode.entity, GroupComponent)[0] as Object3D
      return result
    }

    if (obj) {
      result.obj3d = obj
      result.node = obj.entity
      //if(result.node && hasComponent(result.node.entity, GroupComponent))
      //result.obj3d = result.object
      //result.node = result.object.uuid
      return result
    }
  }
}

export const getIntersectingNodeOnScreen = (
  raycaster: Raycaster,
  coord: Vector2,
  target: Intersection<Object3D>[] = [],
  camera: Camera = getComponent(Engine.instance.cameraEntity, CameraComponent),
  object?: Object3D,
  recursive = true
): RaycastIntersectionNode | undefined => {
  raycaster.setFromCamera(coord, camera)
  raycaster.layers.enable(ObjectLayers.NodeHelper)
  raycaster.intersectObjects(
    object ? ([object] as Mesh[]) : (allMeshes().map((e) => getComponent(e, MeshComponent)) as Mesh[]),
    recursive,
    target as Intersection<Object3D>[]
  )
  raycaster.layers.disable(ObjectLayers.NodeHelper)
  return getIntersectingNode(target as Intersection<Object3D>[])
}

const allMeshes = defineQuery([MeshComponent])
