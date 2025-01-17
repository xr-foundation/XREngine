

import { useEffect, useMemo, useState } from 'react'
import { Edge, EdgeChange, Node, NodeChange, useKeyPress } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { useVisualScriptFlow } from './useVisualScriptFlow'

type VisualScriptFlow = ReturnType<typeof useVisualScriptFlow>

export const useSelectionHandler = ({
  nodes,
  onNodesChange,
  onEdgesChange
}: Pick<VisualScriptFlow, 'onNodesChange' | 'onEdgesChange'> & {
  nodes: Node[]
}) => {
  const ctrlCPressed = useKeyPress(['Control+c', 'Meta+c'])
  const ctrlVPressed = useKeyPress(['Control+v', 'Meta+v'])
  const [selectedNodes, setSelectedNodes] = useState([] as Node[])
  const [selectedEdges, setSelectedEdges] = useState([] as Edge[])

  const [copiedNodes, setCopiedNodes] = useState([] as Node[])
  const [copiedEdges, setCopiedEdges] = useState([] as Edge[])

  const copyNodes = (nodes = selectedNodes, edges = selectedEdges) => {
    setCopiedNodes(nodes)
    setCopiedEdges(edges)
  }

  const pasteNodes = (nodes = copiedNodes, edges = copiedEdges, groupNodes = false, groupName = '') => {
    const nodeBoundingPositions = nodes.reduce(
      (acc, node) => {
        return {
          top: Math.min(acc.top, node.position.y), // y axis is reversed in react flow co-rdinate system
          bottom: Math.max(acc.bottom, node.position.y + node.height!),
          right: Math.max(acc.right, node.position.x) + node.width!,
          left: Math.min(acc.left, node.position.x)
        }
      },
      {
        top: Number.MAX_VALUE,
        bottom: -Number.MAX_VALUE,
        left: Number.MAX_VALUE,
        right: -Number.MAX_VALUE
      }
    )

    const nodeIdMap = new Map<string, string>()
    const newNodes = nodes.map((node) => {
      nodeIdMap[node.id] = uuidv4()
      return {
        ...node,
        id: nodeIdMap[node.id],
        position: {
          x: nodeBoundingPositions.right + (node.position.x - nodeBoundingPositions.left) + 20,
          y: node.position.y
        }
      }
    })

    const newEdgeChange: EdgeChange[] = edges.map((edge) => {
      return {
        type: 'add',
        item: {
          ...edge,
          id: uuidv4(),
          source: nodeIdMap[edge.source],
          target: nodeIdMap[edge.target]
        }
      }
    })

    const newNodeChange: NodeChange[] = newNodes.map((node) => ({
      type: 'add',
      item: node
    }))

    if (groupNodes) {
      const newGroup: Node = {
        id: uuidv4(),
        type: 'group',
        position: { x: nodeBoundingPositions.right + 10, y: nodeBoundingPositions.top - 20 },
        data: { label: groupName, configuration: {}, values: {} },
        style: {
          width: nodeBoundingPositions.right - nodeBoundingPositions.left + 40,
          height: nodeBoundingPositions.bottom - nodeBoundingPositions.top + 40,
          color: 'var(--panelBackground)',
          opacity: 0.3,
          border: '1px solid var(--border-color-default)',
          zIndex: -1
        }
      }
      newNodes.forEach((node) => {
        node.parentNode = newGroup.id
        node.extent = 'parent'
        node.position.x -= newGroup.position.x
        node.position.y -= newGroup.position.y
      })

      newNodeChange.push({
        type: 'add',
        item: newGroup
      })
    }

    onNodesChange(newNodeChange)
    onEdgesChange(newEdgeChange)
    setCopiedNodes(newNodes)
  }

  const onSelectionChange = useMemo(
    () => (elements) => {
      setSelectedNodes(elements.nodes)
      setSelectedEdges(elements.edges)
    },
    [selectedNodes]
  )

  useEffect(() => {
    if (!ctrlCPressed || selectedNodes.length === 0) return
    copyNodes()
  }, [ctrlCPressed])

  useEffect(() => {
    if (!ctrlVPressed || copiedNodes.length === 0) return
    pasteNodes()
  }, [ctrlVPressed])

  return { selectedNodes, selectedEdges, onSelectionChange, copyNodes, pasteNodes }
}
