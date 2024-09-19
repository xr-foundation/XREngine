import React, { useEffect } from 'react'

import {
  defineSystem,
  Entity,
  PresentationSystemGroup,
  QueryReactor,
  useComponent,
  useEntityContext
} from '@xrengine/ecs'
import { GroupComponent } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { BackgroundComponent } from '@xrengine/spatial/src/renderer/components/SceneComponents'
import { haveCommonAncestor } from '@xrengine/spatial/src/transform/components/EntityTree'

import { EnvmapComponent, updateEnvMap } from '../components/EnvmapComponent'
import { EnvMapSourceType } from '../constants/EnvMapEnum'

const EnvmapReactor = (props: { backgroundEntity: Entity }) => {
  const entity = useEntityContext()
  const envmapComponent = useComponent(entity, EnvmapComponent)
  const backgroundComponent = useComponent(props.backgroundEntity, BackgroundComponent)
  const groupComponent = useComponent(entity, GroupComponent)

  useEffect(() => {
    // TODO use spatial queries
    if (!haveCommonAncestor(entity, props.backgroundEntity)) return
    if (envmapComponent.type.value !== EnvMapSourceType.Skybox) return
    for (const obj of groupComponent.value) {
      updateEnvMap(obj as any, backgroundComponent.value as any)
    }
  }, [envmapComponent.type, backgroundComponent])

  return null
}

const BackgroundReactor = () => {
  const backgroundEntity = useEntityContext()
  return <QueryReactor Components={[EnvmapComponent]} ChildEntityReactor={EnvmapReactor} props={{ backgroundEntity }} />
}

export const EnvironmentSystem = defineSystem({
  uuid: 'xrengine.engine.EnvironmentSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => <QueryReactor Components={[BackgroundComponent]} ChildEntityReactor={BackgroundReactor} />
})
