
import { useEntityContext } from '@xrengine/ecs'
import { defineComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useImmediateEffect } from '@xrengine/hyperflux'

const entitiesByName = {} as Record<string, Entity[]>

export const NameComponent = defineComponent({
  name: 'NameComponent',

  schema: S.String(''),

  onSet: (entity, component, name?: string) => {
    if (typeof name !== 'string') throw new Error('NameComponent expects a non-empty string')
    component.set(name)
  },

  reactor: () => {
    const entity = useEntityContext()
    const nameComponent = useComponent(entity, NameComponent)

    useImmediateEffect(() => {
      const name = nameComponent.value
      if (!entitiesByName[name]) {
        entitiesByName[name] = []
      }

      entitiesByName[name].push(entity)
      return () => {
        const index = entitiesByName[name].indexOf(entity)
        entitiesByName[name].splice(index, 1)
      }
    }, [nameComponent.value])

    return null
  },

  entitiesByName: entitiesByName as Readonly<typeof entitiesByName>
})
