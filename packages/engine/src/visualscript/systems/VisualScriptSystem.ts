import { useEffect } from 'react'
import { matches, Validator } from 'ts-matches'

import { hasComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { defineAction, defineActionQueue, getState } from '@xrengine/hyperflux'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import { VisualScriptState } from '@xrengine/visual-script'

import { registerEngineProfile } from '../nodes/profiles/ProfileModule'
import { VisualScriptComponent, VisualScriptDomain } from '../VisualScriptModule'

export const VisualScriptActions = {
  execute: defineAction({
    type: 'xrengine.engine.VisualScript.EXECUTE',
    entity: matches.number as Validator<unknown, Entity>
  }),
  stop: defineAction({
    type: 'xrengine.engine.VisualScript.STOP',
    entity: matches.number as Validator<unknown, Entity>
  }),
  executeAll: defineAction({
    type: 'xrengine.engine.VisualScript.EXECUTEALL',
    entity: matches.number as Validator<unknown, Entity>
  }),
  stopAll: defineAction({
    type: 'xrengine.engine.VisualScript.STOPALL',
    entity: matches.number as Validator<unknown, Entity>
  })
}

export const visualScriptQuery = defineQuery([VisualScriptComponent])

const executeQueue = defineActionQueue(VisualScriptActions.execute.matches)
const stopQueue = defineActionQueue(VisualScriptActions.stop.matches)
const execute = () => {
  if (getState(EngineState).isEditor) return

  for (const action of executeQueue()) {
    const entity = action.entity
    if (hasComponent(entity, VisualScriptComponent)) setComponent(entity, VisualScriptComponent, { run: true })
  }

  for (const action of stopQueue()) {
    const entity = action.entity
    if (hasComponent(entity, VisualScriptComponent)) setComponent(entity, VisualScriptComponent, { run: false })
  }
}

const reactor = () => {
  useEffect(() => {
    VisualScriptState.registerProfile(registerEngineProfile, VisualScriptDomain.ECS)
  }, [])
  return null
}

export const VisualScriptSystem = defineSystem({
  uuid: 'xrengine.engine.VisualScriptSystem',
  insert: { with: InputSystemGroup },
  execute,
  reactor
})
