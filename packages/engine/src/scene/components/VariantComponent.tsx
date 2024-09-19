
import React, { ReactElement, useEffect } from 'react'

import {
  ComponentType,
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { MeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { DistanceFromCameraComponent } from '@xrengine/spatial/src/transform/components/DistanceComponents'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY, useImmediateEffect } from '@xrengine/hyperflux'
import { setInstancedMeshVariant, updateModelVariant } from '../functions/loaders/VariantFunctions'
import { InstancingComponent } from './InstancingComponent'
import { ModelComponent } from './ModelComponent'

export type VariantLevel = {
  src: string
  metadata: Record<string, any>
}

export enum Heuristic {
  DISTANCE = 'DISTANCE',
  SCENE_SCALE = 'SCENE_SCALE',
  MANUAL = 'MANUAL',
  DEVICE = 'DEVICE',
  BUDGET = 'BUDGET'
}

export const distanceBased = (variantComponent: ComponentType<typeof VariantComponent>): boolean => {
  return (
    variantComponent.heuristic === Heuristic.DISTANCE ||
    (variantComponent.heuristic === Heuristic.BUDGET && variantComponent.useDistance)
  )
}

export const VariantComponent = defineComponent({
  name: 'XRENGINE_variant',
  jsonID: 'XRENGINE_variant',

  schema: S.Object({
    levels: S.Array(S.Object({ src: S.String(), metadata: S.Record(S.String(), S.Any()) })),
    heuristic: S.Enum(Heuristic, Heuristic.MANUAL),
    useDistance: S.Bool(false),
    currentLevel: S.Number(0),
    budgetLevel: S.Number(0)
  }),

  reactor: VariantReactor
})

function VariantReactor(): ReactElement {
  const entity = useEntityContext()
  const variantComponent = useComponent(entity, VariantComponent)
  const modelComponent = useOptionalComponent(entity, ModelComponent)
  const meshComponent = getOptionalComponent(entity, MeshComponent)

  useImmediateEffect(() => {
    const json = VariantComponent.toJSON(getComponent(entity, VariantComponent))
    if (variantComponent.heuristic.value !== Heuristic.BUDGET) return

    const sortedLevels = (variantComponent.levels.get(NO_PROXY) as VariantLevel[]).sort((left, right) => {
      const leftVertexCount = left.metadata['vertexCount'] ? (left.metadata['vertexCount'] as number) : 0
      const rightVertexCount = right.metadata['vertexCount'] ? (right.metadata['vertexCount'] as number) : 0
      return rightVertexCount - leftVertexCount
    })

    variantComponent.levels.set(sortedLevels)
  }, [variantComponent.heuristic])

  useEffect(() => {
    const currentLevel = variantComponent.currentLevel.value
    let src: string | undefined = undefined
    if (variantComponent.heuristic.value === Heuristic.BUDGET) {
      const budgetLevel = variantComponent.budgetLevel.value
      if (currentLevel >= budgetLevel) {
        src = variantComponent.levels[currentLevel].src.value
      } else {
        src = variantComponent.levels[budgetLevel].src.value
      }
    } else {
      src = variantComponent.levels[currentLevel].src && variantComponent.levels[currentLevel].src.value
    }

    if (src && modelComponent && modelComponent.src.value !== src) modelComponent.src.set(src)
  }, [variantComponent.currentLevel])

  useEffect(() => {
    if (variantComponent.heuristic.value === Heuristic.BUDGET)
      updateModelVariant(entity, variantComponent, modelComponent!)
  }, [variantComponent.budgetLevel])

  useEffect(() => {
    if (distanceBased(variantComponent.value as ComponentType<typeof VariantComponent>) && meshComponent) {
      meshComponent.removeFromParent()
    }
  }, [meshComponent])

  return (
    <>
      {variantComponent.levels.map((level, index) => (
        <VariantLevelReactor entity={entity} level={index} key={`${entity}-${index}`} />
      ))}
    </>
  )
}

const VariantLevelReactor = React.memo(({ entity, level }: { level: number; entity: Entity }) => {
  const variantComponent = useComponent(entity, VariantComponent)
  const variantLevel = variantComponent.levels[level]

  useEffect(() => {
    //if the variant heuristic is set to Distance, add the DistanceFromCameraComponent
    if (distanceBased(variantComponent.value as ComponentType<typeof VariantComponent>)) {
      setComponent(entity, DistanceFromCameraComponent)
      variantLevel.metadata['minDistance'].value === undefined && variantLevel.metadata['minDistance'].set(0)
      variantLevel.metadata['maxDistance'].value === undefined && variantLevel.metadata['maxDistance'].set(0)
    } else {
      //otherwise, remove the DistanceFromCameraComponent
      hasComponent(entity, DistanceFromCameraComponent) && removeComponent(entity, DistanceFromCameraComponent)
    }
  }, [variantComponent.heuristic])

  const meshComponent = useOptionalComponent(entity, MeshComponent)
  const instancingComponent = getOptionalComponent(entity, InstancingComponent)

  useEffect(() => {
    meshComponent && instancingComponent && setInstancedMeshVariant(entity)
  }, [variantLevel.src, variantLevel.metadata, meshComponent])

  return null
})
