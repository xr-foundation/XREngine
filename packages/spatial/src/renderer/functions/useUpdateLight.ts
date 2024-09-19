import { DirectionalLight, SpotLight, Vector3 } from 'three'

import { useExecute } from '@xrengine/ecs/src/SystemFunctions'
import { TransformSystem } from '../../transform/systems/TransformSystem'

const _vec3 = new Vector3()

export const useUpdateLight = (light: DirectionalLight | SpotLight) => {
  useExecute(
    () => {
      light.getWorldDirection(_vec3)
      light.getWorldPosition(light.target.position).add(_vec3)
      light.target.updateMatrixWorld()
    },
    { after: TransformSystem }
  )
}
