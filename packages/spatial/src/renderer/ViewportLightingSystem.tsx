import { defineQuery, defineSystem, getComponent } from '@xrengine/ecs'
import { getState, useMutableState } from '@xrengine/hyperflux'
import { useEffect } from 'react'
import { AmbientLight } from 'three'
import { EngineState } from '../EngineState'
import { RendererState } from './RendererState'
import { WebGLRendererSystem } from './WebGLRendererSystem'
import { GroupComponent, addObjectToGroup, removeObjectFromGroup } from './components/GroupComponent'
import { LightTagComponent } from './components/lights/LightTagComponent'
import { RenderModes } from './constants/RenderModes'

const _tempAmbientLight = new AmbientLight()

const lightQuery = defineQuery([LightTagComponent, GroupComponent])

const execute = () => {
  const renderMode = getState(RendererState).renderMode
  if (renderMode === RenderModes.UNLIT) {
    for (const entity of lightQuery()) {
      const groupComponent = getComponent(entity, GroupComponent)
      groupComponent.forEach((child: any) => {
        child.visible = !child.isLight
      })
    }
  }
}

const reactor = () => {
  const renderer = useMutableState(RendererState)
  useEffect(() => {
    const root = getState(EngineState).originEntity
    renderer.renderMode.value === RenderModes.UNLIT
      ? addObjectToGroup(root, _tempAmbientLight)
      : removeObjectFromGroup(root, _tempAmbientLight)
  }, [renderer.renderMode])

  return null
}

export const ViewportLightingSystem = defineSystem({
  uuid: 'xrengine.engine.ViewportLightingSystem',
  insert: { before: WebGLRendererSystem },
  execute,
  reactor
})
