
import {
  Component,
  ComponentErrorsType,
  defineComponent,
  getOptionalMutableComponent,
  useOptionalComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'

export const ErrorComponent = defineComponent({
  name: 'ErrorComponent',
  schema: S.Record(S.String(), S.Record(S.String(), S.String()))
})

export const getEntityErrors = <C extends Component>(entity: Entity, component: C) => {
  return getOptionalMutableComponent(entity, ErrorComponent)?.[component.name].value as Record<
    ComponentErrorsType<C>,
    string
  >
}

export const useEntityErrors = <C extends Component>(entity: Entity, component: C) => {
  const errors = useOptionalComponent(entity, ErrorComponent)?.[component.name]
  return errors
}
