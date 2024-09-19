
import { getComponent } from '@xrengine/ecs'
import { getState, useHookstate, useMutableState } from '@xrengine/hyperflux'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import { destroySpatialViewer, initializeSpatialViewer } from '@xrengine/spatial/src/initializeEngine'
import { RendererComponent } from '@xrengine/spatial/src/renderer/WebGLRendererSystem'
import { useEffect, useLayoutEffect } from 'react'

export const useEngineCanvas = (ref: React.RefObject<HTMLElement>) => {
  const lastRef = useHookstate(() => ref.current)

  const engineState = useMutableState(EngineState)

  useLayoutEffect(() => {
    if (ref.current !== lastRef.value) {
      lastRef.set(ref.current)
    }
  }, [ref.current])

  useLayoutEffect(() => {
    if (!lastRef.value) return
    if (!engineState.localFloorEntity || !engineState.originEntity) return

    const parent = lastRef.value as HTMLElement

    const canvas = document.getElementById('engine-renderer-canvas') as HTMLCanvasElement
    const originalParent = canvas.parentElement
    initializeSpatialViewer(canvas)
    parent.appendChild(canvas)

    const observer = new ResizeObserver(() => {
      getComponent(getState(EngineState).viewerEntity, RendererComponent).needsResize = true
    })

    observer.observe(parent)

    return () => {
      destroySpatialViewer()
      observer.disconnect()
      parent.removeChild(canvas)
      originalParent?.appendChild(canvas)
    }
  }, [lastRef.value, engineState.localFloorEntity, engineState.originEntity])
}

export const useRemoveEngineCanvas = () => {
  useEffect(() => {
    const canvas = document.getElementById('engine-renderer-canvas')!
    const parent = canvas.parentElement
    parent?.removeChild(canvas)

    return () => {
      parent?.appendChild(canvas)
    }
  }, [])

  return null
}
