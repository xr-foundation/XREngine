import { Mesh, Object3D } from 'three'

import iterateObject3D from '@xrengine/spatial/src/common/functions/iterateObject3D'

export default function getFirstMesh(obj3d: Object3D): Mesh | null {
  const meshes = iterateObject3D(
    obj3d,
    (child) => child,
    (child: Mesh) => child?.isMesh,
    false,
    true
  )
  return meshes.length > 0 ? meshes[0] : null
}

export function getMeshes(obj3d: Object3D): Mesh[] {
  return iterateObject3D(
    obj3d,
    (child) => child,
    (child: Mesh) => child?.isMesh,
    false,
    false
  )
}
