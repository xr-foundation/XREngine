
import { GLTF } from '@gltf-transform/core'
import matches, { Validator } from 'ts-matches'

import { Entity, EntityUUID, UUIDComponent, getComponent, useOptionalComponent } from '@xrengine/ecs'
import {
  HyperFlux,
  State,
  defineAction,
  defineState,
  getMutableState,
  getState,
  useHookstate
} from '@xrengine/hyperflux'
import { SourceComponent } from '../scene/components/SourceComponent'

export const GLTFDocumentState = defineState({
  name: 'xrengine.engine.gltf.GLTFDocumentState',
  initial: {} as Record<string, GLTF.IGLTF>
})

export const GLTFNodeState = defineState({
  name: 'xrengine.engine.gltf.GLTFNodeState',
  initial: {} as Record<
    string,
    Record<
      string,
      {
        nodeIndex: number
        childIndex: number
        parentUUID: EntityUUID | null // store parent, if no parent, then it is a root node
      }
    >
  >,

  getMutableNode(entity: Entity): State<GLTF.INode> {
    const source = getComponent(entity, SourceComponent)
    const uuid = getComponent(entity, UUIDComponent)
    if (!source || !uuid) {
      HyperFlux.store
        .logger('GLTFNodeState.getMutableNode')
        .error('entity does not have SourceComponent or UUIDComponent')
    }
    const nodeLookup = getState(GLTFNodeState)[source][uuid]
    if (!nodeLookup) {
      HyperFlux.store.logger('GLTFNodeState.getMutableNode').error('node not found in lookup')
    }
    const gltf = getMutableState(GLTFDocumentState)[source]
    return gltf.nodes![nodeLookup.nodeIndex]
  },

  useMutableNode(entity: Entity): GLTF.INode | undefined {
    try {
      const nodeState = useHookstate(getMutableState(GLTFNodeState))
      const source = useOptionalComponent(entity, SourceComponent)?.value
      const uuid = useOptionalComponent(entity, UUIDComponent)?.value

      if (!source || !uuid) {
        console.warn('useMutableNode: Missing source or UUID for entity', entity)
        return undefined
      }

      const sourceNodes = nodeState.value[source]
      if (!sourceNodes) {
        console.warn(`useMutableNode: No nodes found for source "${source}"`)
        return undefined
      }

      const nodeLookup = sourceNodes[uuid]
      if (!nodeLookup) {
        console.warn(`useMutableNode: No node lookup found for UUID "${uuid}"`)
        return undefined
      }

      const gltfDocument = getState(GLTFDocumentState)[source]
      if (!gltfDocument || !gltfDocument.nodes) {
        console.warn(`useMutableNode: No GLTF document or nodes found for source "${source}"`)
        return undefined
      }

      return gltfDocument.nodes[nodeLookup.nodeIndex]
    } catch (error) {
      console.error('Error in useMutableNode:', error)
      return undefined
    }
  },

  convertGltfToNodeDictionary: (gltf: GLTF.IGLTF) => {
    const nodes: Record<string, { nodeIndex: number; childIndex: number; parentUUID: EntityUUID | null }> = {}

    const addNode = (nodeIndex: number, childIndex: number, parentUUID: EntityUUID | null) => {
      const node = gltf.nodes![nodeIndex]
      const uuid = node.extensions?.[UUIDComponent.jsonID] as any as EntityUUID
      if (uuid) {
        nodes[uuid] = { nodeIndex, childIndex, parentUUID }
      } else {
        /** @todo generate a globally deterministic UUID here */
        console.warn('Node does not have a UUID:', node)
        return
      }
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          addNode(node.children[i], i, uuid)
        }
      }
    }

    const scene = gltf.scenes![0]
    for (let i = 0; i < scene.nodes!.length; i++) {
      const index = scene.nodes[i]
      addNode(index, i, null)
    }

    for (let i = 0; i < gltf.scenes![0].nodes!.length; i++) {
      const nodeIndex = gltf.scenes![0].nodes![i]
      const node = gltf.nodes![nodeIndex]
      const uuid = node.extensions?.[UUIDComponent.jsonID] as any as EntityUUID
      if (uuid) {
        nodes[uuid] = {
          nodeIndex,
          childIndex: i,
          parentUUID: null
        }
      } else {
        console.warn('Node does not have a UUID:', node)
      }
    }
    return nodes
  }
})

export const GLTFModifiedState = defineState({
  name: 'xrengine.engine.gltf.GLTFModifiedState',
  initial: {} as Record<string, boolean>
})

export class GLTFSnapshotAction {
  static createSnapshot = defineAction({
    type: 'xrengine.gltf.snapshot.CREATE_SNAPSHOT' as const,
    source: matches.string as Validator<unknown, string>,
    data: matches.object as Validator<unknown, GLTF.IGLTF>
  })

  static undo = defineAction({
    type: 'xrengine.gltf.snapshot.UNDO' as const,
    source: matches.string as Validator<unknown, string>,
    count: matches.number
  })

  static redo = defineAction({
    type: 'xrengine.gltf.snapshot.REDO' as const,
    source: matches.string as Validator<unknown, string>,
    count: matches.number
  })

  static clearHistory = defineAction({
    type: 'xrengine.gltf.snapshot.CLEAR_HISTORY' as const,
    source: matches.string as Validator<unknown, string>
  })

  static unload = defineAction({
    type: 'xrengine.gltf.snapshot.UNLOAD' as const,
    source: matches.string as Validator<unknown, string>
  })
}
