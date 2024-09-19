import React from 'react'
import { createRoot } from 'react-dom/client'
import { Group } from 'three'

import { getComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { EntityContext, createEntity } from '@xrengine/ecs/src/EntityFunctions'
import { State, getState, isClient } from '@xrengine/hyperflux'
import { WebContainer3D } from '@xrengine/xrui/core/three/WebContainer3D'
import { WebLayerManager } from '@xrengine/xrui/core/three/WebLayerManager'

import { AssetLoaderState } from '@xrengine/engine/src/assets/state/AssetLoaderState'
import { EngineState } from '../../EngineState'
import { InputComponent } from '../../input/components/InputComponent'
import { RendererComponent } from '../../renderer/WebGLRendererSystem'
import { addObjectToGroup } from '../../renderer/components/GroupComponent'
import { setObjectLayers } from '../../renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { DistanceFromCameraComponent } from '../../transform/components/DistanceComponents'
import { XRUIStateContext } from '../XRUIStateContext'
import { XRUIComponent } from '../components/XRUIComponent'

export function createXRUI<S extends State<any> | null>(
  UIFunc: React.FC,
  state = null as S,
  settings: { interactable: boolean } = { interactable: true },
  entity = createEntity()
): XRUI<S> {
  if (!isClient) throw new Error('XRUI is not supported in nodejs')

  const containerElement = document.createElement('div')
  containerElement.style.position = 'fixed'
  containerElement.id = 'xrui-' + UIFunc.name

  const rootElement = createRoot(containerElement!)
  rootElement.render(
    //@ts-ignore
    <EntityContext.Provider value={entity}>
      {/* 
      // @ts-ignore */}
      <XRUIStateContext.Provider value={state}>
        <UIFunc />
      </XRUIStateContext.Provider>
    </EntityContext.Provider>
  )

  if (!WebLayerManager.instance) {
    const viewerEntity = getState(EngineState).viewerEntity
    const renderer = getComponent(viewerEntity, RendererComponent)
    const gltfLoader = getState(AssetLoaderState).gltfLoader
    WebLayerManager.initialize(renderer.renderer!, gltfLoader.ktx2Loader!)
  }

  const container = new WebContainer3D(containerElement, { manager: WebLayerManager.instance })

  container.raycaster.layers.enableAll()

  const root = new Group()
  root.name = containerElement.id
  root.add(container)
  addObjectToGroup(entity, root)
  setObjectLayers(container, ObjectLayers.UI)
  setComponent(entity, DistanceFromCameraComponent)
  setComponent(entity, XRUIComponent, container)
  setComponent(entity, VisibleComponent, true)
  if (settings.interactable) setComponent(entity, InputComponent, { highlight: false, grow: true })

  return { entity, state, container }
}

export interface XRUI<S> {
  entity: Entity
  state: S
  container: WebContainer3D
}
