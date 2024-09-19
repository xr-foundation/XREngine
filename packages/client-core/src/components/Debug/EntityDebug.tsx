
import { getAllEntities, getEntityComponents } from 'bitecs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { UUIDComponent } from '@xrengine/ecs'
import {
  Component,
  ComponentMap,
  getComponent,
  getOptionalComponent,
  hasComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { Entity } from '@xrengine/ecs/src/Entity'
import { entityExists } from '@xrengine/ecs/src/EntityFunctions'
import { defineQuery, removeQuery } from '@xrengine/ecs/src/QueryFunctions'
import { useExecute } from '@xrengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { GLTFSourceState } from '@xrengine/engine/src/gltf/GLTFState'
import {
  HyperFlux,
  NO_PROXY,
  defineState,
  getState,
  syncStateWithLocalStorage,
  useHookstate,
  useMutableState
} from '@xrengine/hyperflux'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'

const renderEntityTreeRoots = () => {
  return Object.fromEntries(
    Object.values(getState(GLTFSourceState))
      .map((entity, i) => {
        if (!entity || !entityExists(entity)) return []
        return [
          `${entity} - ${getOptionalComponent(entity, NameComponent) ?? getOptionalComponent(entity, UUIDComponent)}`,
          renderEntityTree(entity)
        ]
      })
      .filter(([exists]) => !!exists)
  )
}

const renderEntityTree = (entity: Entity) => {
  const node = getComponent(entity, EntityTreeComponent)
  return {
    components: renderEntityComponents(entity),
    children: node
      ? {
          ...node.children.reduce(
            (r, child) =>
              Object.assign(r, {
                [`${child} - ${
                  getOptionalComponent(child, NameComponent) ?? getOptionalComponent(child, UUIDComponent)
                }`]: renderEntityTree(child)
              }),
            {}
          )
        }
      : {}
  }
}

const renderEntityComponents = (entity: Entity) => {
  return Object.fromEntries(
    entityExists(entity)
      ? getEntityComponents(HyperFlux.store, entity).reduce<[string, any][]>((components, C: Component<any, any>) => {
          if (C !== NameComponent) components.push([C.name, getComponent(entity, C)])
          return components
        }, [])
      : []
  )
}

const getQueryFromString = (queryString: string) => {
  const queryComponents = queryString
    .split(',')
    .filter((name) => ComponentMap.has(name))
    .map((name) => ComponentMap.get(name)!)
  const query = defineQuery(queryComponents)
  const entities = query()
  removeQuery(query)
  return entities
}

const renderAllEntities = (filter: string, queryString: string) => {
  const entities = queryString ? getQueryFromString(queryString) : (getAllEntities(HyperFlux.store) as Entity[])
  return {
    ...Object.fromEntries(
      [...entities.entries()]
        .map(([, eid]) => {
          if (!entityExists(eid)) return null!

          const label = `${eid} - ${
            getOptionalComponent(eid, NameComponent) ?? getOptionalComponent(eid, UUIDComponent) ?? ''
          }`

          if (
            filter !== '' &&
            (!hasComponent(eid, NameComponent) || label.toLowerCase().indexOf(filter.toLowerCase()) === -1)
          )
            return null!

          return [label, renderEntityComponents(eid)]
        })
        .filter((exists) => !!exists)
    )
  }
}

const EntitySearchState = defineState({
  name: 'EntitySearchState',
  initial: {
    search: '',
    query: ''
  },
  extension: syncStateWithLocalStorage(['search', 'query'])
})

export const EntityDebug = () => {
  const { t } = useTranslation()

  const namedEntities = useHookstate({})
  const erroredComponents = useHookstate([] as any[])
  const entityTree = useHookstate({} as any)
  const entitySearch = useMutableState(EntitySearchState).search
  const entityQuery = useMutableState(EntitySearchState).query

  erroredComponents.set(
    [...Engine.instance.store.activeReactors.values()]
      .filter((reactor) => (reactor as any).entity && reactor.errors.length)
      .map((reactor) => {
        return reactor.errors.map((error) => {
          return {
            entity: (reactor as any).entity,
            component: (reactor as any).component,
            error
          }
        })
      })
      .flat()
  )

  useExecute(
    () => {
      namedEntities.set(renderAllEntities(entitySearch.value, entityQuery.value))
      entityTree.set(renderEntityTreeRoots())
    },
    { after: PresentationSystemGroup }
  )

  return (
    <div className="m-1 bg-neutral-600 p-1">
      <div className="my-1">
        <Text>{t('common:debug.scenes')}</Text>
        <JSONTree data={entityTree.value} postprocessValue={(v: any) => v?.value ?? v} />
      </div>
      <div className="my-1">
        <Text>{t('common:debug.entities')}</Text>
        <Input
          containerClassName="my-0.5"
          placeholder="Search..."
          value={entitySearch.value}
          onChange={(event) => entitySearch.set(event.target.value)}
        />
        <Input
          containerClassName="my-0.5"
          placeholder="Query..."
          value={entityQuery.value}
          onChange={(e) => entityQuery.set(e.target.value)}
        />
        <JSONTree data={namedEntities.get(NO_PROXY)} />
      </div>
      <div className="my-1">
        <Text>{t('common:debug.erroredEntities')}</Text>
        <JSONTree data={erroredComponents.get(NO_PROXY)} />
      </div>
    </div>
  )
}
