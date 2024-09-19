
import React, { ReactElement, useEffect } from 'react'

import {
  EntityUUID,
  getComponent,
  getOptionalComponent,
  PresentationSystemGroup,
  QueryReactor,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useComponent,
  useEntityContext,
  useOptionalComponent
} from '@xrengine/ecs'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import {
  MaterialPrototypeDefinition,
  MaterialPrototypeDefinitions
} from '@xrengine/spatial/src/renderer/materials/MaterialComponent'
import {
  createAndAssignMaterial,
  createMaterialPrototype,
  materialPrototypeMatches,
  setMeshMaterial,
  updateMaterialPrototype
} from '@xrengine/spatial/src/renderer/materials/materialFunctions'

import { MeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@xrengine/spatial/src/renderer/materials/MaterialComponent'
import { isArray } from 'lodash'
import { Material, MeshBasicMaterial } from 'three'
import { SourceComponent } from '../../components/SourceComponent'

const reactor = (): ReactElement => {
  useEffect(() => {
    MaterialPrototypeDefinitions.map((prototype: MaterialPrototypeDefinition, uuid) =>
      createMaterialPrototype(prototype)
    )
    const fallbackMaterial = new MeshBasicMaterial({ name: 'Fallback Material', color: 0xff69b4 })
    fallbackMaterial.uuid = MaterialStateComponent.fallbackMaterial
    createAndAssignMaterial(UndefinedEntity, fallbackMaterial)
  }, [])

  return (
    <>
      <QueryReactor Components={[MaterialInstanceComponent]} ChildEntityReactor={MaterialInstanceReactor} />
      <QueryReactor Components={[MaterialStateComponent]} ChildEntityReactor={MaterialEntityReactor} />
      <QueryReactor Components={[MeshComponent]} ChildEntityReactor={MeshReactor} />
    </>
  )
}

const MeshReactor = () => {
  const entity = useEntityContext()
  const materialComponent = useOptionalComponent(entity, MaterialInstanceComponent)
  const meshComponent = useComponent(entity, MeshComponent)

  const createAndSourceMaterial = (material: Material) => {
    const materialEntity = createAndAssignMaterial(entity, material)
    const source = getOptionalComponent(entity, SourceComponent)
    if (source) setComponent(materialEntity, SourceComponent, source)
  }

  useEffect(() => {
    if (materialComponent) return
    const material = meshComponent.material.value as Material
    if (!isArray(material)) createAndSourceMaterial(material)
    else for (const mat of material) createAndSourceMaterial(mat)
  }, [])
  return null
}

const MaterialEntityReactor = () => {
  const entity = useEntityContext()
  const materialComponent = useComponent(entity, MaterialStateComponent)
  useEffect(() => {
    if (!materialComponent.instances.value!) return
    for (const sourceEntity of materialComponent.instances.value) {
      const sourceComponent = getOptionalComponent(sourceEntity, SourceComponent)
      if (!sourceComponent || !SourceComponent.entitiesBySource[sourceComponent]) return
      for (const entity of SourceComponent.entitiesBySource[getComponent(sourceEntity, SourceComponent)]) {
        const uuid = getOptionalComponent(entity, MaterialInstanceComponent)?.uuid as EntityUUID[] | undefined
        if (uuid) setMeshMaterial(entity, uuid)
      }
    }
  }, [materialComponent.material])

  useEffect(() => {
    if (materialComponent.prototypeEntity.value && !materialPrototypeMatches(entity)) updateMaterialPrototype(entity)
  }, [materialComponent.prototypeEntity])

  useEffect(() => {
    if (materialComponent.instances.value?.length === 0) removeEntity(entity)
  }, [materialComponent.instances])

  return null
}

const MaterialInstanceReactor = () => {
  const entity = useEntityContext()
  const materialComponent = useComponent(entity, MaterialInstanceComponent)
  const uuid = materialComponent.uuid
  useEffect(() => {
    if (uuid.value) setMeshMaterial(entity, uuid.value as EntityUUID[])
  }, [materialComponent.uuid])
  return null
}

export const MaterialLibrarySystem = defineSystem({
  uuid: 'xrengine.engine.scene.MaterialLibrarySystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
