
import { defineComponent } from '@xrengine/ecs/src/ComponentFunctions'

export const ScreenshareTargetComponent = defineComponent({
  name: 'ScreenshareTargetComponent',
  jsonID: 'XRENGINE_screenshare_target',
  toJSON: () => true
})
