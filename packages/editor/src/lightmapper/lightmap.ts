import { MeshStandardMaterial, Object3D, Scene, WebGLRenderer } from 'three'

import { getComponent, hasComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { MeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { iterateEntityNode } from '@xrengine/spatial/src/transform/components/EntityTree'

import { runBakingPasses } from './bake'
import { withLightScene } from './lightScene'
import { initializeWorkbench, LIGHTMAP_READONLY_FLAG, WorkbenchSettings } from './workbench'

const meshQuery = defineQuery([MeshComponent])

export async function bakeLightmaps(
  target: Object3D,
  props: WorkbenchSettings,
  requestWork: () => Promise<WebGLRenderer>
) {
  const scene = new Scene()
  const meshes = meshQuery()
  for (const entity of meshes) {
    const mesh = getComponent(entity, MeshComponent)
    mesh.isMesh && Object.assign(mesh.userData, { [LIGHTMAP_READONLY_FLAG]: true })
  }

  iterateEntityNode(
    target.entity,
    (entity) => {
      const mesh = getComponent(entity, MeshComponent)
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      materials.map((material: MeshStandardMaterial) => {
        if (material.lightMap) {
          material.lightMap = null
        }
      })
    },
    (entity) => hasComponent(entity, MeshComponent)
  )

  const workbench = await initializeWorkbench(scene, props, requestWork)
  await withLightScene(workbench, async () => {
    await runBakingPasses(workbench, requestWork)
  })

  for (const entity of meshes) {
    const mesh = getComponent(entity, MeshComponent)
    Object.prototype.hasOwnProperty.call(mesh.userData, LIGHTMAP_READONLY_FLAG) &&
      Reflect.deleteProperty(mesh.userData, LIGHTMAP_READONLY_FLAG)
  }

  return workbench.irradiance
}
