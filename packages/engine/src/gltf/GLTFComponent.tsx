
import { GLTF } from '@gltf-transform/core'
import React, { useEffect } from 'react'

import {
  Component,
  ComponentJSONIDMap,
  defineComponent,
  Entity,
  EntityUUID,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  useComponent,
  useEntityContext,
  useQuery,
  UUIDComponent
} from '@xrengine/ecs'
import { parseStorageProviderURLs } from '@xrengine/engine/src/assets/functions/parseSceneJSON'
import { dispatchAction, getState, useHookstate } from '@xrengine/hyperflux'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { FileLoader } from '../assets/loaders/base/FileLoader'
import { BINARY_EXTENSION_HEADER_MAGIC, EXTENSIONS, GLTFBinaryExtension } from '../assets/loaders/gltf/GLTFExtensions'
import { SourceComponent } from '../scene/components/SourceComponent'
import { SceneJsonType } from '../scene/types/SceneTypes'
import { migrateSceneJSONToGLTF } from './convertJsonToGLTF'
import { GLTFDocumentState, GLTFSnapshotAction } from './GLTFDocumentState'
import { ResourcePendingComponent } from './ResourcePendingComponent'

const loadDependencies = {
  ['XRENGINE_model']: ['scene']
} as Record<string, string[]>

type ComponentDependencies = Record<EntityUUID, Component[]>

const buildComponentDependencies = (json: GLTF.IGLTF) => {
  const dependencies = {} as ComponentDependencies
  if (!json.nodes) return dependencies
  for (const node of json.nodes) {
    if (!node.extensions || !node.extensions[UUIDComponent.jsonID]) continue
    const uuid = node.extensions[UUIDComponent.jsonID] as EntityUUID
    const extensions = Object.keys(node.extensions)
    for (const extension of extensions) {
      if (loadDependencies[extension]) {
        if (!dependencies[uuid]) dependencies[uuid] = []
        dependencies[uuid].push(ComponentJSONIDMap.get(extension)!)
      }
    }
  }

  return dependencies
}

export const GLTFComponent = defineComponent({
  name: 'GLTFComponent',

  schema: S.Object({
    src: S.String(''),
    // internals
    extensions: S.Record(S.String(), S.Any(), {}),
    progress: S.Number(0),
    dependencies: S.Optional(S.Type<ComponentDependencies>())
  }),

  onSet(entity, component, json) {
    if (typeof json?.src === 'string') component.src.set(json.src)
  },

  useDependenciesLoaded(entity: Entity) {
    const dependencies = useComponent(entity, GLTFComponent).dependencies
    return !!(dependencies.value && !dependencies.keys?.length)
  },

  useSceneLoaded(entity: Entity) {
    const gltfComponent = useComponent(entity, GLTFComponent)
    const dependencies = gltfComponent.dependencies
    const progress = gltfComponent.progress.value
    return !!(dependencies.value && !dependencies.keys?.length) && progress === 100
  },

  isSceneLoaded(entity: Entity) {
    const gltfComponent = getComponent(entity, GLTFComponent)
    const dependencies = gltfComponent.dependencies
    const progress = gltfComponent.progress
    return !!(dependencies && !Object.keys(dependencies).length) && progress === 100
  },

  reactor: () => {
    const entity = useEntityContext()
    const gltfComponent = useComponent(entity, GLTFComponent)
    const dependencies = gltfComponent.dependencies

    useGLTFDocument(gltfComponent.src.value, entity)

    const documentID = useComponent(entity, SourceComponent).value

    return (
      <>
        <ResourceReactor documentID={documentID} entity={entity} />
        {dependencies.value && dependencies.keys?.length ? (
          <DependencyReactor
            key={entity}
            gltfComponentEntity={entity}
            dependencies={dependencies.value as ComponentDependencies}
          />
        ) : null}
      </>
    )
  }
})

const ResourceReactor = (props: { documentID: string; entity: Entity }) => {
  const dependenciesLoaded = GLTFComponent.useDependenciesLoaded(props.entity)
  const resourceQuery = useQuery([SourceComponent, ResourcePendingComponent])
  const sourceEntities = useHookstate(SourceComponent.entitiesBySourceState[props.documentID])

  useEffect(() => {
    if (getComponent(props.entity, GLTFComponent).progress === 100) return
    if (!getState(GLTFDocumentState)[props.documentID]) return

    const entities = resourceQuery.filter((e) => getComponent(e, SourceComponent) === props.documentID)
    if (!entities.length) {
      if (dependenciesLoaded) getMutableComponent(props.entity, GLTFComponent).progress.set(100)
      return
    }

    const resources = entities
      .map((entity) => {
        const resource = getOptionalComponent(entity, ResourcePendingComponent)
        if (!resource) return []
        return Object.values(resource).map((resource) => {
          return {
            progress: resource.progress,
            total: resource.total
          }
        })
      })
      .flat()
      .filter(Boolean)

    const progress = resources.reduce((acc, resource) => acc + resource.progress, 0)
    const total = resources.reduce((acc, resource) => acc + resource.total, 0)
    if (!total) return

    const percentage = Math.floor(Math.min((progress / total) * 100, dependenciesLoaded ? 100 : 99))
    getMutableComponent(props.entity, GLTFComponent).progress.set(percentage)
  }, [resourceQuery, sourceEntities, dependenciesLoaded])

  return null
}

const ComponentReactor = (props: { gltfComponentEntity: Entity; entity: Entity; component: Component }) => {
  const { gltfComponentEntity, entity, component } = props
  const dependencies = loadDependencies[component.jsonID!]
  const comp = useComponent(entity, component)

  useEffect(() => {
    const compValue = comp.value
    for (const key of dependencies) {
      if (!compValue[key]) return
    }

    // console.log(`All dependencies loaded for entity: ${entity} on component: ${component.jsonID}`)

    const gltfComponent = getMutableComponent(gltfComponentEntity, GLTFComponent)
    const uuid = getComponent(entity, UUIDComponent)
    gltfComponent.dependencies.set((prev) => {
      const dependencyArr = prev![uuid] as Component[]
      const index = dependencyArr.findIndex((compItem) => compItem.jsonID === component.jsonID)
      dependencyArr.splice(index, 1)
      if (!dependencyArr.length) {
        delete prev![uuid]
      }
      return prev
    })
  }, [...dependencies.map((key) => comp[key])])

  return null
}

const DependencyEntryReactor = (props: { gltfComponentEntity: Entity; uuid: string; components: Component[] }) => {
  const { gltfComponentEntity, uuid, components } = props
  const entity = UUIDComponent.useEntityByUUID(uuid as EntityUUID) as Entity | undefined
  return entity ? (
    <>
      {components.map((component) => {
        return (
          <ComponentReactor
            key={component.jsonID}
            gltfComponentEntity={gltfComponentEntity}
            entity={entity}
            component={component}
          />
        )
      })}
    </>
  ) : null
}

const DependencyReactor = (props: { gltfComponentEntity: Entity; dependencies: ComponentDependencies }) => {
  const { gltfComponentEntity, dependencies } = props
  const entries = Object.entries(dependencies)

  return (
    <>
      {entries.map(([uuid, components]) => {
        return (
          <DependencyEntryReactor
            key={uuid}
            gltfComponentEntity={gltfComponentEntity}
            uuid={uuid}
            components={components}
          />
        )
      })}
    </>
  )
}

const onError = (error: ErrorEvent) => {
  // console.error(error)
}

const onProgress: (event: ProgressEvent) => void = (event) => {
  // console.log(event)
}

const useGLTFDocument = (url: string, entity: Entity) => {
  const state = useComponent(entity, GLTFComponent)
  const sourceComponent = useComponent(entity, SourceComponent)

  useEffect(() => {
    const source = sourceComponent.value
    return () => {
      dispatchAction(GLTFSnapshotAction.unload({ source }))
    }
  }, [])

  useEffect(() => {
    if (!url) return

    const abortController = new AbortController()
    const signal = abortController.signal

    const onSuccess = (data: string | ArrayBuffer | GLTF.IGLTF) => {
      if (signal.aborted) return

      const textDecoder = new TextDecoder()
      let json: GLTF.IGLTF | SceneJsonType

      if (typeof data === 'string') {
        json = JSON.parse(data)
      } else if (data instanceof ArrayBuffer) {
        const magic = textDecoder.decode(new Uint8Array(data, 0, 4))

        if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
          try {
            /** TODO we will need to refactor and persist this */
            state.extensions.merge({ [EXTENSIONS.KHR_BINARY_GLTF]: new GLTFBinaryExtension(data) })
          } catch (error) {
            if (onError) onError(error)
            return
          }

          json = JSON.parse(state.extensions.value[EXTENSIONS.KHR_BINARY_GLTF].content)
        } else {
          json = JSON.parse(textDecoder.decode(data))
        }
      } else {
        json = data
      }

      /** Migrate old scene json format */
      if ('entities' in json && 'root' in json) {
        json = migrateSceneJSONToGLTF(json)
      }

      const dependencies = buildComponentDependencies(json)
      state.dependencies.set(dependencies)

      dispatchAction(
        GLTFSnapshotAction.createSnapshot({
          source: getComponent(entity, SourceComponent),
          data: parseStorageProviderURLs(JSON.parse(JSON.stringify(json)))
        })
      )
    }

    const loader = new FileLoader()

    loader.setResponseType('arraybuffer')
    loader.setRequestHeader({})
    loader.setWithCredentials(false)

    loader.load(url, onSuccess, onProgress, onError, signal)

    return () => {
      abortController.abort()
      if (!hasComponent(entity, GLTFComponent)) return
      state.merge({
        extensions: {}
      })
    }
  }, [url])
}
