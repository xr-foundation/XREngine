
import { useEffect, useLayoutEffect } from 'react'
import {
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry
} from 'three'

import {
  defineComponent,
  getComponent,
  getMutableComponent,
  setComponent,
  useComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { createEntity, entityExists, removeEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import { WebContainer3D } from '@xrengine/xrui'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { getState } from '@xrengine/hyperflux'
import { EngineState } from '../../EngineState'
import { NameComponent } from '../../common/NameComponent'
import { useAnimationTransition } from '../../common/functions/createTransitionState'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'
import { addObjectToGroup, removeObjectFromGroup } from '../../renderer/components/GroupComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'

export const PointerComponent = defineComponent({
  name: 'PointerComponent',

  schema: S.Object({
    inputSource: S.Type<XRInputSource>(),
    lastHit: S.Nullable(S.Type<ReturnType<typeof WebContainer3D.prototype.hitTest>>()),
    // internal
    pointer: S.Type<PointerObject>(),
    cursor: S.Nullable(S.Type<Mesh<BufferGeometry, MeshBasicMaterial>>())
  }),

  reactor: () => {
    const entity = useEntityContext()
    const pointerComponentState = useComponent(entity, PointerComponent)

    const transition = useAnimationTransition(0.5, 'OUT', (alpha) => {
      const cursorMaterial = pointerComponentState.cursor.value?.material as MeshBasicMaterial
      const pointerMaterial = pointerComponentState.pointer.value?.material as MeshBasicMaterial
      if (cursorMaterial) {
        cursorMaterial.opacity = alpha
        cursorMaterial.visible = alpha > 0
      }
      if (pointerMaterial) {
        pointerMaterial.opacity = alpha
        pointerMaterial.visible = alpha > 0
      }
    })

    useLayoutEffect(() => {
      const inputSource = pointerComponentState.inputSource.value as XRInputSource
      return () => {
        PointerComponent.pointers.delete(inputSource)
      }
    }, [])

    useEffect(() => {
      const inputSource = pointerComponentState.inputSource.value
      const pointer = createPointer(inputSource as XRInputSource)
      const cursor = createUICursor()
      const pointerEntity = createEntity()
      addObjectToGroup(pointerEntity, pointer)
      setComponent(pointerEntity, EntityTreeComponent, { parentEntity: entity })
      addObjectToGroup(pointerEntity, cursor)
      getMutableComponent(entity, PointerComponent).merge({ pointer, cursor })
      addObjectToGroup(entity, pointer)
      return () => {
        if (entityExists(entity)) removeObjectFromGroup(entity, pointer)
        removeEntity(pointerEntity)
      }
    }, [pointerComponentState.inputSource])

    useEffect(() => {
      transition(pointerComponentState.lastHit.value ? 'IN' : 'OUT')
    }, [pointerComponentState.lastHit])

    return null
  },

  addPointer: (inputSourceEntity: Entity) => {
    const inputSource = getComponent(inputSourceEntity, InputSourceComponent).source
    const entity = createEntity()
    setComponent(entity, PointerComponent, { inputSource })
    setComponent(entity, NameComponent, 'Pointer' + inputSource.handedness)
    setComponent(entity, EntityTreeComponent, { parentEntity: getState(EngineState).localFloorEntity })
    setComponent(entity, ComputedTransformComponent, {
      referenceEntities: [inputSourceEntity],
      computeFunction: () => {
        const inputTransform = getComponent(inputSourceEntity, TransformComponent)
        const pointerTransform = getComponent(entity, TransformComponent)
        pointerTransform.position.copy(inputTransform.position)
        pointerTransform.rotation.copy(inputTransform.rotation)
      }
    })

    setComponent(entity, TransformComponent)
    setComponent(entity, VisibleComponent)
    PointerComponent.pointers.set(inputSource, entity)
  },

  pointers: new Map<XRInputSource, Entity>(),

  getPointers: () => {
    return Array.from(PointerComponent.pointers.values()).map(
      (entity) => getComponent(entity, PointerComponent).pointer
    )
  }
})

// pointer taken from https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_ballshooter.html
const createPointer = (inputSource: XRInputSource): PointerObject => {
  switch (inputSource.targetRayMode) {
    case 'gaze': {
      const geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, -1)
      const material = new MeshBasicMaterial({ opacity: 0, transparent: true })
      return new Mesh(geometry, material) as PointerObject
    }
    default:
    case 'tracked-pointer': {
      const geometry = new BufferGeometry()
      geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3))
      geometry.setAttribute('color', new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3))
      const material = new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, linewidth: 2 })
      return new Line(geometry, material)
    }
  }
}

const createUICursor = () => {
  const geometry = new SphereGeometry(0.01, 16, 16)
  const material = new MeshBasicMaterial({ color: 0xffffff, opacity: 0 })
  return new Mesh(geometry, material)
}

export type PointerObject = Line<BufferGeometry, LineBasicMaterial> | Mesh<RingGeometry, MeshBasicMaterial>
