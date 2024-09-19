
import { GraphJSON } from '@xrengine/visual-script'

export const hasPositionMetaData = (visualScript: GraphJSON): boolean => {
  if (visualScript.nodes === undefined) return false
  return visualScript.nodes.some(
    (node) => node.metadata?.positionX !== undefined || node.metadata?.positionY !== undefined
  )
}
