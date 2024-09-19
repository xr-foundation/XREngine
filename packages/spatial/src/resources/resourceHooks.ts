import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Entity, UndefinedEntity } from '@xrengine/ecs'
import { NO_PROXY, State, useDidMount, useHookstate } from '@xrengine/hyperflux'

import { DisposableObject, ResourceManager } from './ResourceState'

/**
 *
 * Loader hook for creating an instance of a class that implements the DisposableObject interface in ResourceState.ts in a React context,
 * but has it's lifecycle managed by the ResourceManager in ResourceState.ts
 *
 * @param disposableLike A class that implements the DisposableObject interface eg. DirectionalLight
 * @param entity *Optional* the entity that is loading the object
 * @param args *Optional* arguments to pass to the constructor of disposableLike
 * @returns A unique instance of the class that is passed in for DisposableObject
 */
export function useDisposable<T extends DisposableObject, T2 extends new (...params: any[]) => T>(
  disposableLike: T2,
  entity: Entity,
  ...args: ConstructorParameters<T2>
): [InstanceType<T2>, () => void] {
  const classState = useHookstate(() => disposableLike)
  const objState = useHookstate<InstanceType<T2>>(() => ResourceManager.loadObj(disposableLike, entity, ...args))

  const unload = () => {
    if (objState.value) {
      ResourceManager.unload(objState.get(NO_PROXY).uuid, entity)
    }
  }

  useEffect(() => {
    return unload
  }, [])

  useEffect(() => {
    if (disposableLike !== classState.value) {
      unload()
      classState.set(() => disposableLike)
      objState.set(() => ResourceManager.loadObj(disposableLike, entity, ...args))
    }
  }, [disposableLike])

  return [objState.get(NO_PROXY) as InstanceType<T2>, unload]
}

/**
 *
 * Loader hook for creating an instance of a class that extends DisposableObject in a non-React context,
 * Tracked by the ResourceManager in ResourceState.ts, but will not be unloaded unless the unload function that is returned is called
 * Useful for when you only want to create the object if a condition is met (eg. is debug enabled)
 *
 * @param disposableLike A class that implements the DisposableObject interface in ResourceState.ts eg. DirectionalLight
 * @param entity *Optional* the entity that is loading the object
 * @param args *Optional* arguments to pass to the constructor of k
 * @returns A unique instance of the class that is passed in for object3D and a callback to unload the object
 */
export function createDisposable<T extends DisposableObject, T2 extends new (...params: any[]) => T>(
  disposableLike: T2,
  entity: Entity,
  ...args: ConstructorParameters<T2>
): [InstanceType<T2>, () => void] {
  const obj = ResourceManager.loadObj(disposableLike, entity, ...args)

  const unload = () => {
    ResourceManager.unload(obj.uuid, entity)
  }

  return [obj, unload]
}

type ObjOrFunction<T> = T | (() => T)
/**
 *
 * Hook to add any resource to be tracked by the resource manager
 * If the resource has a cleanup method that isn't called 'dispose', you'll need to pass in a callback function for onUnload to manage the cleanup
 *
 * @param resource the resource to track
 * @param entity *Optional* the entity that is loading the object
 * @param id *Optional* a unique id to track the resource with, a UUID will be created if an id is not provided
 * @param onUnload *Optional* a callback called when the resource is unloaded
 * @returns the resource object passed in
 */
export function useResource<TObj extends NonNullable<object>>(
  resource: ObjOrFunction<TObj>,
  entity: Entity = UndefinedEntity,
  id?: string,
  onUnload?: () => void
): [State<TObj>, () => void] {
  const uniqueID = useHookstate<string>(id || uuidv4())
  const resourceState = useHookstate<TObj>(() => ResourceManager.addResource(resource, uniqueID.value, entity))

  const unload = () => {
    ResourceManager.unload(uniqueID.value, entity)
    if (onUnload) onUnload()
  }

  useEffect(() => {
    return () => {
      unload()
    }
  }, [])

  useDidMount(() => {
    unload()
    ResourceManager.addResource(resourceState.value, uniqueID.value, entity)
  }, [resourceState])

  return [resourceState, unload]
}
