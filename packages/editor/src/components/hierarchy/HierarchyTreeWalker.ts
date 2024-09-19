
import { getComponent, hasComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID } from '@xrengine/ecs/src/Entity'
import { entityExists } from '@xrengine/ecs/src/EntityFunctions'
import { SourceComponent } from '@xrengine/engine/src/scene/components/SourceComponent'
import { getState } from '@xrengine/hyperflux'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'

import { GLTF } from '@gltf-transform/core'
import { UUIDComponent } from '@xrengine/ecs'
import { GLTFSnapshotState } from '@xrengine/engine/src/gltf/GLTFState'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { getModelSceneID } from '@xrengine/engine/src/scene/functions/loaders/ModelFunctions'
import { HierarchyTreeState } from '../../services/HierarchyNodeState'

export type HierarchyTreeNodeType = {
  depth: number
  entity: Entity
  childIndex: number
  lastChild: boolean
  isLeaf?: boolean
  isCollapsed?: boolean
}

export type HierarchyTreeCollapsedNodeType = { [key: number]: boolean }

type NestedHierarchyTreeNode = HierarchyTreeNodeType & { children: NestedHierarchyTreeNode[] }

function isChild(index: number, nodes: GLTF.INode[]) {
  for (const node of nodes) {
    if (node.children && node.children.includes(index)) return true
  }

  return false
}

function buildHierarchyTree(
  depth: number,
  childIndex: number,
  node: GLTF.INode,
  nodes: GLTF.INode[],
  array: NestedHierarchyTreeNode[],
  lastChild: boolean,
  sceneID: string,
  showModelChildren: boolean
) {
  const uuid = node.extensions && (node.extensions[UUIDComponent.jsonID] as EntityUUID)
  const entity = UUIDComponent.getEntityByUUID(uuid!)
  if (!entity || !entityExists(entity)) return

  const item = {
    depth,
    childIndex,
    entity: entity,
    isCollapsed: !getState(HierarchyTreeState).expandedNodes[sceneID]?.[entity],
    children: [],
    isLeaf: !(node.children && node.children.length > 0),
    lastChild: lastChild
  }
  array.push(item)

  if (hasComponent(entity, ModelComponent) && showModelChildren) {
    const modelSceneID = getModelSceneID(entity)
    const snapshotState = getState(GLTFSnapshotState)
    const snapshots = snapshotState[modelSceneID]
    if (snapshots) {
      const snapshotNodes = snapshots.snapshots[snapshots.index].nodes
      if (snapshotNodes && snapshotNodes.length > 0) {
        item.isLeaf = false
        if (!item.isCollapsed)
          buildHierarchyTreeForNodes(depth + 1, snapshotNodes, item.children, sceneID, showModelChildren)
      }
    }
  }

  if (node.children && !item.isCollapsed) {
    for (let i = 0; i < node.children.length; i++) {
      const childIndex = node.children[i]
      buildHierarchyTree(
        depth + 1,
        i,
        nodes[childIndex],
        nodes,
        item.children,
        i === node.children.length - 1,
        sceneID,
        showModelChildren
      )
    }
  }
}

function buildHierarchyTreeForNodes(
  depth: number,
  nodes: GLTF.INode[],
  outArray: NestedHierarchyTreeNode[],
  sceneID: string,
  showModelChildren: boolean
) {
  for (let i = 0; i < nodes.length; i++) {
    if (isChild(i, nodes)) continue
    buildHierarchyTree(depth, i, nodes[i], nodes, outArray, false, sceneID, showModelChildren)
  }
  if (!outArray.length) return
  outArray[outArray.length - 1].lastChild = true
}

function flattenTree(array: NestedHierarchyTreeNode[], outArray: HierarchyTreeNodeType[]) {
  for (const item of array) {
    if (!item.entity) continue
    outArray.push({
      depth: item.depth,
      entity: item.entity,
      childIndex: item.childIndex,
      lastChild: item.lastChild,
      isLeaf: item.isLeaf,
      isCollapsed: item.isCollapsed
    })
    flattenTree(item.children, outArray)
  }
}

export function gltfHierarchyTreeWalker(
  rootEntity: Entity,
  nodes: GLTF.INode[],
  showModelChildren: boolean
): HierarchyTreeNodeType[] {
  const outArray = [] as NestedHierarchyTreeNode[]

  const sceneID = getComponent(rootEntity, SourceComponent)
  const rootNode = {
    depth: 0,
    entity: rootEntity,
    childIndex: 0,
    lastChild: true,
    isCollapsed: !getState(HierarchyTreeState).expandedNodes[sceneID]?.[rootEntity]
  }
  const tree = [rootNode] as HierarchyTreeNodeType[]

  if (!rootNode.isCollapsed) {
    buildHierarchyTreeForNodes(1, nodes, outArray, sceneID, showModelChildren)
    flattenTree(outArray, tree)
  }

  return tree
}

export function* hierarchyTreeWalker(sceneID: string, treeNode: Entity): Generator<HierarchyTreeNodeType> {
  if (!treeNode) return

  const stack = [] as HierarchyTreeNodeType[]

  stack.push({ depth: 0, entity: treeNode, childIndex: 0, lastChild: true })

  while (stack.length !== 0) {
    const { depth, entity: entityNode, childIndex, lastChild } = stack.pop() as HierarchyTreeNodeType

    if (!entityExists(entityNode) || !hasComponent(entityNode, SourceComponent)) continue

    const expandedNodes = getState(HierarchyTreeState).expandedNodes

    const isCollapsed = !expandedNodes[sceneID]?.[entityNode]

    const entityTreeComponent = getComponent(entityNode as Entity, EntityTreeComponent)

    // treat entites with all helper children as leaf nodes
    const allhelperChildren = entityTreeComponent.children.every((child) => !hasComponent(child, SourceComponent))

    yield {
      isLeaf: entityTreeComponent.children.length === 0 || allhelperChildren,
      isCollapsed,
      depth,
      entity: entityNode,
      childIndex,
      lastChild
    }

    if (entityTreeComponent.children.length !== 0 && !isCollapsed) {
      for (let i = entityTreeComponent.children.length - 1; i >= 0; i--) {
        const childEntity = entityTreeComponent.children[i]
        if (hasComponent(childEntity, SourceComponent)) {
          stack.push({
            depth: depth + 1,
            entity: childEntity,
            childIndex: i,
            lastChild: i === 0
          })
        }
      }
    }
  }
}
