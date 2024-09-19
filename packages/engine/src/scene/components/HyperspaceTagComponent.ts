
import { useEffect } from 'react'
import {
  AmbientLight,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MirroredRepeatWrapping,
  Object3D,
  Texture,
  TubeGeometry,
  Vector3
} from 'three'

import { PresentationSystemGroup } from '@xrengine/ecs'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { Engine } from '@xrengine/ecs/src/Engine'
import { Entity, UndefinedEntity } from '@xrengine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { useExecute } from '@xrengine/ecs/src/SystemFunctions'
import { getMutableState, getState, useHookstate } from '@xrengine/hyperflux'
import { CameraComponent } from '@xrengine/spatial/src/camera/components/CameraComponent'
import { ObjectDirection } from '@xrengine/spatial/src/common/constants/MathConstants'
import {
  createTransitionState,
  TransitionStateSchema
} from '@xrengine/spatial/src/common/functions/createTransitionState'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { addObjectToGroup, GroupComponent } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@xrengine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@xrengine/spatial/src/renderer/constants/ObjectLayers'
import { destroyEntityTree, EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { DomainConfigState } from '../../assets/state/DomainConfigState'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { teleportAvatar } from '../../avatar/functions/moveAvatar'
import { PortalComponent, PortalEffects, PortalState } from './PortalComponent'

export const HyperspacePortalEffect = 'Hyperspace'

class PortalEffect extends Object3D {
  curve: CatmullRomCurve3
  splineMesh: Line
  tubeMaterial: MeshBasicMaterial
  tubeGeometry: TubeGeometry
  tubeMesh: Mesh
  numPoints = 200
  portalEntity: Entity

  constructor(parent: Entity) {
    super()
    this.name = 'PortalEffect'

    this.createMesh()
    const portalEntity = (this.portalEntity = createEntity())
    setComponent(portalEntity, NameComponent, this.name)
    setComponent(portalEntity, EntityTreeComponent, { parentEntity: parent })
    setComponent(portalEntity, VisibleComponent, true)
    addObjectToGroup(portalEntity, this.tubeMesh)
    this.tubeMesh.layers.set(ObjectLayers.Portal)
  }

  get texture() {
    return this.tubeMaterial.map
  }

  set texture(val: Texture | null) {
    this.tubeMaterial.map = val
    if (this.tubeMaterial.map) {
      this.tubeMaterial.map.wrapS = MirroredRepeatWrapping
      this.tubeMaterial.map.wrapT = MirroredRepeatWrapping
      if (this.tubeMaterial.map.repeat) this.tubeMaterial.map.repeat.set(1, 10)
    }
  }

  createMesh() {
    const points: Vector3[] = []

    for (let i = 0; i < this.numPoints; i += 1) {
      points.push(new Vector3(0, 0, i))
    }

    this.curve = new CatmullRomCurve3(points)

    const geometry = new BufferGeometry()
    const curvePoints = new Float32Array(
      this.curve
        .getPoints(this.numPoints)
        .map((val: Vector3) => {
          return val.toArray()
        })
        .flat()
    )
    geometry.setAttribute('position', new BufferAttribute(curvePoints, 3))
    this.splineMesh = new Line(geometry, new LineBasicMaterial())

    this.tubeMaterial = new MeshBasicMaterial({
      side: BackSide,
      transparent: true,
      opacity: 0
    })

    const radialSegments = 24
    const tubularSegments = this.numPoints / 10

    this.tubeGeometry = new TubeGeometry(this.curve, tubularSegments, 2, radialSegments, false)
    const tube = this.tubeGeometry.getAttribute('position') as BufferAttribute

    const entryLength = 5
    const segmentSize = this.numPoints / tubularSegments

    for (let i = 0; i < radialSegments * entryLength; i++) {
      const factor = (segmentSize * entryLength - tube.getZ(i)) * 0.1
      tube.setX(i, tube.getX(i) * factor)
      tube.setY(i, tube.getY(i) * factor)
    }

    this.tubeMesh = new Mesh(this.tubeGeometry, this.tubeMaterial)
    this.tubeMesh.position.set(-0.5, 0, -15)
  }

  updateMaterialOffset(delta: number) {
    if (this.tubeMaterial.map) this.tubeMaterial.map.offset.x += delta
  }

  update(delta: number) {
    this.updateMaterialOffset(delta)
  }
}

export const HyperspaceTagComponent = defineComponent({
  name: 'HyperspaceTagComponent',

  schema: S.Object({
    // all internals
    sceneVisible: S.Bool(true),
    transition: TransitionStateSchema(createTransitionState(0.5, 'OUT'))
  }),

  reactor: () => {
    const entity = useEntityContext()
    const [galaxyTexture] = useTexture(
      `${getState(DomainConfigState).cloudDomain}/projects/xrengine/default-project/assets/galaxyTexture.jpg`,
      entity
    )
    const hyperspaceEffectEntityState = useHookstate(createEntity)
    const ambientLightEntityState = useHookstate(createEntity)

    useEffect(() => {
      const hyperspaceEffectEntity = hyperspaceEffectEntityState.value
      const ambientLightEntity = ambientLightEntityState.value

      const hyperspaceEffect = new PortalEffect(hyperspaceEffectEntity)
      addObjectToGroup(hyperspaceEffectEntity, hyperspaceEffect)
      setObjectLayers(hyperspaceEffect, ObjectLayers.Portal)

      getComponent(hyperspaceEffectEntity, TransformComponent).scale.set(10, 10, 10)
      setComponent(hyperspaceEffectEntity, EntityTreeComponent, { parentEntity: entity })
      setComponent(hyperspaceEffectEntity, VisibleComponent)

      const light = new AmbientLight('#aaa')
      light.layers.enable(ObjectLayers.Portal)
      addObjectToGroup(ambientLightEntity, light)

      setComponent(ambientLightEntity, EntityTreeComponent, { parentEntity: hyperspaceEffectEntity })
      setComponent(ambientLightEntity, VisibleComponent)

      const transition = getComponent(entity, HyperspaceTagComponent).transition
      // TODO: add BPCEM of old and new scenes and fade them in and out too
      transition.setState('IN')

      const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
      const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
      camera.layers.enable(ObjectLayers.Portal)
      camera.zoom = 1.5

      hyperspaceEffect.quaternion.setFromUnitVectors(
        ObjectDirection.Forward,
        new Vector3(0, 0, 1).applyQuaternion(cameraTransform.rotation).setY(0).normalize()
      )

      return () => {
        removeEntity(ambientLightEntity)
        destroyEntityTree(hyperspaceEffectEntity)
      }
    }, [])

    useEffect(() => {
      if (!galaxyTexture) return

      const hyperspaceEffectEntity = hyperspaceEffectEntityState.value
      const hyperspaceEffect = getComponent(hyperspaceEffectEntity, GroupComponent)[0] as any as PortalEffect
      hyperspaceEffect.texture = galaxyTexture
    }, [galaxyTexture])

    useExecute(
      () => {
        if (!hasComponent(entity, HyperspaceTagComponent)) return

        const hyperspaceEffectEntity = hyperspaceEffectEntityState.value
        if (!hyperspaceEffectEntity) return
        const { transition } = getComponent(entity, HyperspaceTagComponent)

        const hyperspaceEffect = getComponent(hyperspaceEffectEntity, GroupComponent)[0] as any as PortalEffect
        const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
        const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
        const ecsState = getState(ECSState)

        if (transition.alpha >= 1 && transition.state === 'IN') {
          transition.setState('OUT')
          camera.layers.enable(ObjectLayers.Scene)
        }

        transition.update(ecsState.deltaSeconds, (opacity) => {
          hyperspaceEffect.update(ecsState.deltaSeconds)
          hyperspaceEffect.tubeMaterial.opacity = opacity
        })

        const sceneVisible = getMutableComponent(entity, HyperspaceTagComponent).sceneVisible

        if (transition.state === 'IN' && transition.alpha >= 1 && sceneVisible.value) {
          /**
           * hide scene, render just the hyperspace effect and avatar
           */
          getMutableState(PortalState).portalReady.set(true)
          const activePortal = getComponent(getState(PortalState).activePortalEntity, PortalComponent)
          // teleport player to where the portal spawn position is
          teleportAvatar(AvatarComponent.getSelfAvatarEntity(), activePortal!.remoteSpawnPosition, true)
          camera.layers.disable(ObjectLayers.Scene)
          sceneVisible.set(false)
        }

        if (transition.state === 'OUT' && transition.alpha <= 0 && !sceneVisible.value) {
          sceneVisible.set(true)
          removeComponent(entity, HyperspaceTagComponent)
          getMutableState(PortalState).activePortalEntity.set(UndefinedEntity)
          getMutableState(PortalState).portalReady.set(false)
          camera.layers.disable(ObjectLayers.Portal)
          return
        }

        getComponent(hyperspaceEffectEntity, TransformComponent).position.copy(cameraTransform.position)

        if (camera.zoom > 0.75) {
          camera.zoom -= ecsState.deltaSeconds
          camera.updateProjectionMatrix()
        }
      },
      { after: PresentationSystemGroup }
    )

    return null
  }
})

PortalEffects.set(HyperspacePortalEffect, HyperspaceTagComponent)
