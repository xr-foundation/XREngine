import type { Quaternion, Vector3 } from 'three'

export type PortalDetail = {
  sceneName: string
  portalEntityId: string
  portalEntityName: string
  previewImageURL: string
  spawnPosition: Vector3
  spawnRotation: Quaternion
}
