
import { DefaultLogger, ManualLifecycleEventEmitter, registerCoreProfile } from '../profiles/ProfilesModule'
import { registerSceneProfile } from '../profiles/scene/SceneProfileModule'
import { registerStructProfile } from '../profiles/struct/StructProfileModule'
import { XRENGINEScene } from '../profiles/xrengineScene'

export const createBaseRegistry = () => {
  let registry = registerCoreProfile({
    values: {},
    nodes: {},
    dependencies: {
      ILogger: new DefaultLogger(),
      ILifecycleEventEmitter: new ManualLifecycleEventEmitter(),
      IScene: new XRENGINEScene()
    }
  })
  registry = registerSceneProfile(registry)
  registry = registerStructProfile(registry)

  return registry
}
