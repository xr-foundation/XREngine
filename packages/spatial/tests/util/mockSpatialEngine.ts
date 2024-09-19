
import { ECSState, Timer, setComponent } from '@xrengine/ecs'
import { getMutableState, getState } from '@xrengine/hyperflux'
import { EngineState } from '../../src/EngineState'
import { initializeSpatialEngine, initializeSpatialViewer } from '../../src/initializeEngine'
import { RendererComponent } from '../../src/renderer/WebGLRendererSystem'
import { XRState } from '../../src/xr/XRState'
import { mockEngineRenderer } from './MockEngineRenderer'

export const mockSpatialEngine = () => {
  initializeSpatialEngine()
  initializeSpatialViewer()

  const timer = Timer((time, xrFrame) => {
    getMutableState(XRState).xrFrame.set(xrFrame)
    // executeSystems(time)
    getMutableState(XRState).xrFrame.set(null)
  })
  getMutableState(ECSState).timer.set(timer)

  const { originEntity, localFloorEntity, viewerEntity } = getState(EngineState)
  mockEngineRenderer(viewerEntity)
  setComponent(viewerEntity, RendererComponent, { scenes: [originEntity, localFloorEntity, viewerEntity] })
}
