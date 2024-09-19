import { Not } from 'bitecs'
import { useEffect } from 'react'

import { PresentationSystemGroup } from '@xrengine/ecs'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { getState, useMutableState } from '@xrengine/hyperflux'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import { MeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { PerformanceState } from '@xrengine/spatial/src/renderer/PerformanceState'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { InstancingComponent } from '../components/InstancingComponent'
import { ModelComponent } from '../components/ModelComponent'
import { VariantComponent } from '../components/VariantComponent'
import {
  setInstancedMeshVariant,
  setMeshVariant,
  setModelVariant,
  setModelVariantLOD
} from '../functions/loaders/VariantFunctions'

const updateFrequency = 0.1
let lastUpdate = 0

export const modelVariantQuery = defineQuery([VariantComponent, ModelComponent, TransformComponent])
export const meshVariantQuery = defineQuery([
  VariantComponent,
  MeshComponent,
  TransformComponent,
  Not(InstancingComponent)
])
export const instancedMeshVariantQuery = defineQuery([
  VariantComponent,
  MeshComponent,
  TransformComponent,
  InstancingComponent
])

function execute() {
  const engineState = getState(EngineState)
  if (engineState.isEditing) return

  const ecsState = getState(ECSState)

  if (ecsState.elapsedSeconds - lastUpdate < updateFrequency) return
  lastUpdate = ecsState.elapsedSeconds

  for (const entity of modelVariantQuery()) {
    setModelVariant(entity)
  }
  for (const entity of meshVariantQuery()) {
    setMeshVariant(entity)
  }
  for (const entity of instancedMeshVariantQuery()) {
    setInstancedMeshVariant(entity)
  }
}

function reactor() {
  const performanceOffset = useMutableState(PerformanceState).gpuPerformanceOffset

  useEffect(() => {
    if (getState(EngineState).isEditing) return
    const offset = performanceOffset.value
    for (const entity of modelVariantQuery()) {
      setModelVariantLOD(entity, offset)
    }
  }, [performanceOffset])

  return null
}

export const VariantSystem = defineSystem({
  uuid: 'xrengine.engine.scene.VariantSystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor
})
