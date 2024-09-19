import React, { useEffect } from 'react'
import matches, { Validator } from 'ts-matches'

import { Entity } from '@xrengine/ecs'
import { defineComponent, hasComponent, setComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { parseStorageProviderURLs } from '@xrengine/engine/src/assets/functions/parseSceneJSON'
import { useImmediateEffect, useMutableState } from '@xrengine/hyperflux'
import { useAncestorWithComponents } from '@xrengine/spatial/src/transform/components/EntityTree'
import { GraphJSON, IRegistry, VisualScriptState, defaultVisualScript } from '@xrengine/visual-script'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { useVisualScriptRunner } from '../systems/useVisualScriptRunner'

export enum VisualScriptDomain {
  'ECS' = 'ECS'
}

export const VisualScriptComponent = defineComponent({
  name: 'VisualScriptComponent',
  jsonID: 'XRENGINE_visual_script',

  schema: S.Object({
    domain: S.Enum(VisualScriptDomain, VisualScriptDomain.ECS),
    visualScript: S.Nullable(S.Type<GraphJSON>()),
    run: S.Bool(false),
    disabled: S.Bool(false)
  }),

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.disabled === 'boolean') component.disabled.set(json.disabled)
    if (typeof json.run === 'boolean') component.run.set(json.run)
    const domainValidator = matches.string as Validator<unknown, VisualScriptDomain>
    if (domainValidator.test(json.domain)) {
      component.domain.value !== json.domain && component.domain.set(json.domain!)
    }
    const visualScriptValidator = matches.object as Validator<unknown, GraphJSON>
    if (visualScriptValidator.test(json.visualScript)) {
      component.visualScript.set(parseStorageProviderURLs(json.visualScript)!)
    }
  },

  // we make reactor for each component handle the engine
  reactor: () => {
    const entity = useEntityContext()
    const visualScript = useComponent(entity, VisualScriptComponent)
    const visualScriptState = useMutableState(VisualScriptState)
    const canPlay = visualScript.run.value && !visualScript.disabled.value
    const registry = visualScriptState.registries[visualScript.domain.value].get({ noproxy: true }) as IRegistry
    const gltfAncestor = useAncestorWithComponents(entity, [GLTFComponent])

    useImmediateEffect(() => {
      if (visualScript.visualScript.value === null)
        visualScript.visualScript.set(parseStorageProviderURLs(defaultVisualScript))
    }, [])

    const visualScriptRunner = useVisualScriptRunner({
      visualScriptJson: visualScript.visualScript.get({ noproxy: true }) as GraphJSON,
      autoRun: canPlay,
      registry
    })

    useEffect(() => {
      if (visualScript.disabled.value) return
      visualScript.run.value ? visualScriptRunner.play() : visualScriptRunner.pause()
    }, [visualScript.run])

    useEffect(() => {
      if (!visualScript.disabled.value) return
      visualScript.run.set(false)
    }, [visualScript.disabled])

    if (!gltfAncestor) return null

    return <LoadReactor entity={entity} gltfAncestor={gltfAncestor} key={gltfAncestor} />
  }
})

const LoadReactor = (props: { entity: Entity; gltfAncestor: Entity }) => {
  const loaded = GLTFComponent.useSceneLoaded(props.gltfAncestor)

  useEffect(() => {
    setComponent(props.entity, VisualScriptComponent, { run: true })

    return () => {
      if (!hasComponent(props.entity, VisualScriptComponent)) return
      setComponent(props.entity, VisualScriptComponent, { run: false })
    }
  }, [loaded])

  return null
}
