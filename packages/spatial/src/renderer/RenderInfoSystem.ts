import { Engine, getOptionalComponent } from '@xrengine/ecs'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { defineState, getMutableState, getState } from '@xrengine/hyperflux'

import { RendererComponent, WebGLRendererSystem } from './WebGLRendererSystem'

export const RenderInfoState = defineState({
  name: 'RenderInfoState',
  initial: {
    visible: false,
    info: {
      geometries: 0,
      textures: 0,
      fps: 0,
      frameTime: 0,
      calls: 0,
      triangles: 0,
      points: 0,
      lines: 0,
      programs: 0
    }
  }
})

const execute = () => {
  const renderer = getOptionalComponent(Engine.instance.viewerEntity, RendererComponent)?.renderer
  if (!renderer) return

  const state = getState(RenderInfoState)
  if (state.visible) {
    const info = renderer.info
    const deltaSeconds = getState(ECSState).deltaSeconds

    const fps = 1 / deltaSeconds
    const frameTime = deltaSeconds * 1000

    getMutableState(RenderInfoState).info.set({
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      fps,
      frameTime,
      calls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines,
      programs: info.programs?.length || 0
    })

    info.reset()
  }

  renderer.info.autoReset = !state.visible
}

export const RenderInfoSystem = defineSystem({
  uuid: 'xrengine.editor.RenderInfoSystem',
  insert: { with: WebGLRendererSystem },
  execute
})
