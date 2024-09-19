import { defineComponent, hasComponent, removeComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const VisibleComponent = defineComponent({
  name: 'VisibleComponent',
  jsonID: 'XRENGINE_visible',
  schema: S.Bool(true)
})

export const setVisibleComponent = (entity: Entity, visible: boolean) => {
  if (visible) {
    !hasComponent(entity, VisibleComponent) && setComponent(entity, VisibleComponent, true)
  } else removeComponent(entity, VisibleComponent)
}
