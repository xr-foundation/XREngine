
import { defineState } from '@xrengine/hyperflux'

import { GLTF } from '../assets/loaders/gltf/GLTFLoader'

export const AnimationState = defineState({
  name: 'AnimationState',
  initial: () => ({
    loadedAnimations: {} as Record<string, GLTF>,
    avatarLoadingEffect: false
  })
})
