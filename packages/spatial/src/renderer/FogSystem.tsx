
import React, { useEffect } from 'react'
import { Mesh, MeshStandardMaterial, Shader } from 'three'

import { Entity, PresentationSystemGroup, QueryReactor, useComponent, useEntityContext } from '@xrengine/ecs'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { getState } from '@xrengine/hyperflux'
import {
  PluginType,
  addOBCPlugin,
  removeOBCPlugin
} from '@xrengine/spatial/src/common/functions/OnBeforeCompilePlugin'
import { GroupComponent } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'

import { FogSettingsComponent, FogType } from './components/FogSettingsComponent'

export const FogShaders = [] as Shader[]

const getFogPlugin = (): PluginType => {
  return {
    id: 'xrengine.engine.FogPlugin',
    priority: 0,
    compile: (shader) => {
      FogShaders.push(shader)
      shader.uniforms.fogTime = { value: 0.0 }
      shader.uniforms.fogTimeScale = { value: 1 }
      shader.uniforms.heightFactor = { value: 0.05 }
    }
  }
}

function addFogShaderPlugin(obj: Mesh<any, MeshStandardMaterial>) {
  if (!obj.material || !obj.material.fog || obj.material.userData.fogPlugin) return
  obj.material.userData.fogPlugin = getFogPlugin()
  addOBCPlugin(obj.material, obj.material.userData.fogPlugin)
  obj.material.needsUpdate = true
}

function removeFogShaderPlugin(obj: Mesh<any, MeshStandardMaterial>) {
  if (!obj.material?.userData?.fogPlugin) return
  removeOBCPlugin(obj.material, obj.material.userData.fogPlugin)
  delete obj.material.userData.fogPlugin
  obj.material.needsUpdate = true
  const shader = (obj.material as any).shader // todo add typings somehow
  FogShaders.splice(FogShaders.indexOf(shader), 1)
}

function FogGroupReactor(props: { fogEntity: Entity }) {
  const entity = useEntityContext()
  const fogComponent = useComponent(props.fogEntity, FogSettingsComponent)
  const group = useComponent(entity, GroupComponent)

  useEffect(() => {
    const customShader = fogComponent.type.value === FogType.Brownian || fogComponent.type.value === FogType.Height
    if (customShader) {
      const objs = [...group.value]
      for (const obj of objs) addFogShaderPlugin(obj as any)
      return () => {
        for (const obj of objs) removeFogShaderPlugin(obj as any)
      }
    }
  }, [fogComponent.type, group])

  return null
}

const FogReactor = () => {
  const entity = useEntityContext()
  return (
    <QueryReactor
      ChildEntityReactor={FogGroupReactor}
      Components={[GroupComponent, VisibleComponent]}
      props={{ fogEntity: entity }}
    />
  )
}

const reactor = () => {
  // TODO support multiple fog entities via spatial queries
  return <QueryReactor ChildEntityReactor={FogReactor} Components={[FogSettingsComponent]} />
}

const execute = () => {
  for (const s of FogShaders) {
    if (s.uniforms.fogTime) s.uniforms.fogTime.value = getState(ECSState).elapsedSeconds
  }
}

export const FogSystem = defineSystem({
  uuid: 'xrengine.engine.FogSystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor
})
