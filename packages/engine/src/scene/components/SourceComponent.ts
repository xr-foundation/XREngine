
import { useEntityContext } from '@xrengine/ecs'
import { defineComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { hookstate, none, useImmediateEffect } from '@xrengine/hyperflux'

const entitiesBySource = {} as Record<string, Entity[]>

export const SourceComponent = defineComponent({
  name: 'SourceComponent',

  schema: S.String(''),

  onSet: (entity, component, src) => {
    if (typeof src !== 'string') throw new Error('SourceComponent expects a non-empty string')
    component.set(src)
  },

  reactor: () => {
    const entity = useEntityContext()
    const sourceComponent = useComponent(entity, SourceComponent)

    useImmediateEffect(() => {
      const source = sourceComponent.value
      const entitiesBySourceState = SourceComponent.entitiesBySourceState[source]
      if (!entitiesBySourceState.value) {
        entitiesBySourceState.set([entity])
      } else {
        entitiesBySourceState.merge([entity])
      }

      return () => {
        const entities = SourceComponent.entitiesBySource[source].filter((currentEntity) => currentEntity !== entity)
        if (entities.length === 0) {
          SourceComponent.entitiesBySourceState[source].set(none)
        } else {
          SourceComponent.entitiesBySourceState[source].set(entities)
        }
      }
    }, [sourceComponent])

    return null
  },

  entitiesBySourceState: hookstate(entitiesBySource),
  entitiesBySource: entitiesBySource as Readonly<typeof entitiesBySource>
})
