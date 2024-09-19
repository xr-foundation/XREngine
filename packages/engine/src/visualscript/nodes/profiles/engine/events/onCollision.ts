import { getComponent, removeComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { defineQuery, Query, removeQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem, destroySystem, SystemUUID } from '@xrengine/ecs/src/SystemFunctions'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { CollisionComponent } from '@xrengine/spatial/src/physics/components/CollisionComponent'
import { PhysicsSystem } from '@xrengine/spatial/src/physics/PhysicsModule'
import { makeEventNodeDefinition, NodeCategory } from '@xrengine/visual-script'

let systemCounter = 0

// define a type for state
type State = {
  query: Query
  systemUUID: SystemUUID
}

// define initial state based on a type
const initialState = (): State => ({
  query: undefined!,
  systemUUID: '' as SystemUUID
})

// a visual script node
export const OnCollision = makeEventNodeDefinition({
  typeName: 'engine/onCollision',
  category: NodeCategory.Engine,
  label: 'Collision Events',

  // socket configuration support
  configuration: {},

  // flow node inputs
  in: {
    entity: 'entity'
  },

  out: {
    flow: 'flow',
    entity: 'entity',
    target: 'entity'
  },

  initialState: initialState(),

  init: ({ read, write, commit }) => {
    const entityFilter = read<Entity>('entity')
    const query = defineQuery([CollisionComponent])

    // @todo this could be moved to a global system
    // @todo this could be using useComponent although that is asynchronous

    const systemUUID = defineSystem({
      uuid: 'visual-script-onCollision-' + systemCounter++,
      insert: { after: PhysicsSystem },
      execute: () => {
        const results = query()
        for (const entity of results) {
          if (entityFilter && entityFilter != entity) continue
          const name = getComponent(entity, NameComponent)
          const collision = getComponent(entity, CollisionComponent)
          // @todo maybe there should be that delay timer hack?
          for (const [e, hit] of collision) {
            write('entity', entity)
            write('target', e)
            commit('flow', () => {})
          }
          // @todo this should be done in the physics engine rather than here - hack
          removeComponent(entity, CollisionComponent)
        }
      }
    })

    const state: State = {
      query,
      systemUUID
    }

    return state
  },
  dispose: ({ state: { query, systemUUID } }) => {
    destroySystem(systemUUID)
    removeQuery(query)
    return initialState()
  }
})
