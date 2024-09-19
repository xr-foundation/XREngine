
import { useGet } from '@xrengine/common'
import { staticResourcePath } from '@xrengine/common/src/schema.type.module'
import { GLTFAssetState } from '@xrengine/engine/src/gltf/GLTFState'
import { useMutableState } from '@xrengine/hyperflux'

export const useLoadedSceneEntity = (sceneID: string | undefined) => {
  const scene = useGet(staticResourcePath, sceneID).data
  const scenes = useMutableState(GLTFAssetState)
  const sceneKey = scene?.url
  return sceneKey ? scenes[sceneKey].value : null
}
