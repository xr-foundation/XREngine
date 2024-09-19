import { defineComponent, getComponent, hasComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'

export const enum StandardCallbacks {
  PLAY = 'xre.play',
  PAUSE = 'xre.pause',
  RESET = 'xre.reset'
}

export const CallbackComponent = defineComponent({
  name: 'CallbackComponent',
  onInit: () => new Map<string, (...params: any) => void>()
})

export function setCallback(entity: Entity, key: string, callback: (...params: any) => void) {
  if (!hasComponent(entity, CallbackComponent)) setComponent(entity, CallbackComponent, new Map())
  const callbacks = getComponent(entity, CallbackComponent)
  callbacks.set(key, callback)
  callbacks[key] = key // for inspector
}

export function getCallback(entity: Entity, key: string): ((...params: any) => void) | undefined {
  if (!hasComponent(entity, CallbackComponent)) return undefined
  return getComponent(entity, CallbackComponent).get(key)
}
