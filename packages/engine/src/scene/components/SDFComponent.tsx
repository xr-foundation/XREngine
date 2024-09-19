import { DepthPass, ShaderPass } from 'postprocessing'
import React, { useEffect } from 'react'
import {
  Camera,
  Color,
  DepthTexture,
  NearestFilter,
  RGBAFormat,
  Scene,
  UnsignedIntType,
  Vector3,
  WebGLRenderTarget
} from 'three'

import { Entity } from '@xrengine/ecs'
import { defineComponent, getComponent, setComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { createEntity, useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { CameraComponent } from '@xrengine/spatial/src/camera/components/CameraComponent'
import { setCallback } from '@xrengine/spatial/src/common/CallbackComponent'
import { SDFShader } from '@xrengine/spatial/src/renderer/effects/sdf/SDFShader'
import { RendererComponent } from '@xrengine/spatial/src/renderer/WebGLRendererSystem'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { useRendererEntity } from '@xrengine/spatial/src/renderer/functions/useRendererEntity'
import { UpdatableCallback, UpdatableComponent } from './UpdatableComponent'

export enum SDFMode {
  TORUS,
  BOX,
  SPHERE,
  FOG
}

export const SDFComponent = defineComponent({
  name: 'SDFComponent',
  jsonID: 'XRENGINE_sdf',

  schema: S.Object({
    color: S.Color(0xffffff),
    scale: S.Vec3({ x: 0.25, y: 0.001, z: 0.25 }),
    enable: S.Bool(false),
    mode: S.Enum(SDFMode, SDFMode.TORUS)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const sdfComponent = useComponent(entity, SDFComponent)
    const rendererEntity = useRendererEntity(entity)

    useEffect(() => {
      const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
      const cameraPosition = cameraTransform.position
      const transformComponent = getComponent(entity, TransformComponent)
      const cameraComponent = getComponent(Engine.instance.cameraEntity, CameraComponent)
      const updater = createEntity()
      setCallback(updater, UpdatableCallback, (dt) => {
        SDFShader.shader.uniforms.uTime.value += dt * 0.1
      })

      SDFShader.shader.uniforms.cameraMatrix.value = cameraTransform.matrix
      SDFShader.shader.uniforms.fov.value = cameraComponent.fov
      SDFShader.shader.uniforms.aspectRatio.value = cameraComponent.aspect
      SDFShader.shader.uniforms.near.value = cameraComponent.near
      SDFShader.shader.uniforms.far.value = cameraComponent.far
      SDFShader.shader.uniforms.sdfMatrix.value = transformComponent.matrixWorld
      SDFShader.shader.uniforms.cameraPos.value = cameraPosition
      setComponent(updater, UpdatableComponent, true)
    }, [])

    useEffect(() => {
      const color = new Color(sdfComponent.color.value)
      SDFShader.shader.uniforms.uColor.value = new Vector3(color.r, color.g, color.b)
    }, [sdfComponent.color])

    useEffect(() => {
      SDFShader.shader.uniforms.scale.value = sdfComponent.scale.value
    }, [sdfComponent.scale])

    useEffect(() => {
      SDFShader.shader.uniforms.mode.value = sdfComponent.mode.value
    }, [sdfComponent.mode])

    if (!rendererEntity) return null

    return <RendererReactor entity={entity} rendererEntity={rendererEntity} />
  }
})

const RendererReactor = (props: { entity: Entity; rendererEntity: Entity }) => {
  const { entity, rendererEntity } = props
  const sdfComponent = useComponent(entity, SDFComponent)
  const rendererComponent = useComponent(rendererEntity, RendererComponent)

  useEffect(() => {
    if (!rendererEntity) return
    const composer = rendererComponent.effectComposer.value
    if (!composer) return

    const depthRenderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight)
    depthRenderTarget.texture.minFilter = NearestFilter
    depthRenderTarget.texture.magFilter = NearestFilter
    depthRenderTarget.texture.generateMipmaps = false
    depthRenderTarget.stencilBuffer = false
    depthRenderTarget.depthBuffer = true
    depthRenderTarget.depthTexture = new DepthTexture(window.innerWidth, window.innerHeight)
    depthRenderTarget.texture.format = RGBAFormat
    depthRenderTarget.depthTexture.type = UnsignedIntType

    const depthPass = new DepthPass(new Scene(), new Camera(), {
      renderTarget: depthRenderTarget
    })

    composer.addPass(depthPass, 3) // hardcoded to 3, should add a registry instead later

    SDFShader.shader.uniforms.uDepth.value = depthRenderTarget.depthTexture
    const SDFPass = new ShaderPass(SDFShader.shader, 'inputBuffer')
    composer.addPass(SDFPass, 4)

    return () => {
      composer.removePass(depthPass)
      composer.removePass(SDFPass)
    }
  }, [sdfComponent.enable, rendererComponent.effectComposer])

  return null
}
