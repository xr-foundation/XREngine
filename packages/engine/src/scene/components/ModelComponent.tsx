
import { QueryReactor, UUIDComponent } from '@xrengine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { Entity, EntityUUID } from '@xrengine/ecs/src/Entity'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY, dispatchAction, getMutableState, getState, none, useHookstate } from '@xrengine/hyperflux'
import { CameraComponent } from '@xrengine/spatial/src/camera/components/CameraComponent'
import { RendererComponent } from '@xrengine/spatial/src/renderer/WebGLRendererSystem'
import { GroupComponent, addObjectToGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@xrengine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayers } from '@xrengine/spatial/src/renderer/constants/ObjectLayers'
import {
  EntityTreeComponent,
  iterateEntityNode,
  removeEntityNodeRecursively,
  useAncestorWithComponents
} from '@xrengine/spatial/src/transform/components/EntityTree'
import { VRM } from '@pixiv/three-vrm'
import { Not } from 'bitecs'
import React, { FC, useEffect } from 'react'
import { AnimationMixer, Group, Scene } from 'three'
import { useGLTF } from '../../assets/functions/resourceLoaderHooks'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { autoconvertMixamoAvatar } from '../../avatar/functions/avatarFunctions'
import { GLTFDocumentState, GLTFSnapshotAction } from '../../gltf/GLTFDocumentState'
import { GLTFSnapshotState, GLTFSourceState } from '../../gltf/GLTFState'
import { SceneJsonType, convertSceneJSONToGLTF } from '../../gltf/convertJsonToGLTF'
import { addError, removeError } from '../functions/ErrorFunctions'
import { parseGLTFModel, proxifyParentChildRelationships } from '../functions/loadGLTFModel'
import { getModelSceneID, useModelSceneID } from '../functions/loaders/ModelFunctions'
import { SourceComponent } from './SourceComponent'

/**
 * ModelComponent is an entity/object hierarchy loaded from a resource
 */
export const ModelComponent = defineComponent({
  name: 'ModelComponent',
  jsonID: 'XRENGINE_model',

  schema: S.Object({
    src: S.String(''),
    cameraOcclusion: S.Bool(true),
    /** optional, only for bone matchable avatars */
    convertToVRM: S.Bool(false),
    scene: S.Nullable(S.Type<Group>()),
    asset: S.Nullable(S.Type<VRM | GLTF>()),
    dereference: S.Bool(false)
  }),

  toJSON: (component) => {
    return {
      src: component.src,
      cameraOcclusion: component.cameraOcclusion,
      convertToVRM: component.convertToVRM
    }
  },

  errors: ['LOADING_ERROR', 'INVALID_SOURCE'],

  reactor: ModelReactor
})

function ModelReactor() {
  const entity = useEntityContext()
  const modelComponent = useComponent(entity, ModelComponent)
  const gltfDocumentState = useHookstate(getMutableState(GLTFDocumentState))
  const modelSceneID = getModelSceneID(entity)

  const [gltf, error] = useGLTF(modelComponent.src.value, entity)

  useEffect(() => {
    const occlusion = modelComponent.cameraOcclusion.value
    if (!occlusion) ObjectLayerMaskComponent.disableLayer(entity, ObjectLayers.Camera)
    else ObjectLayerMaskComponent.enableLayer(entity, ObjectLayers.Camera)
  }, [modelComponent.cameraOcclusion])

  useEffect(() => {
    if (!error) return
    console.error(error)
    addError(entity, ModelComponent, 'INVALID_SOURCE', error.message)
  }, [error])

  useEffect(() => {
    if (!gltf) {
      if (!hasComponent(entity, GroupComponent)) {
        const obj3d = new Group()
        obj3d.entity = entity
        addObjectToGroup(entity, obj3d)
        proxifyParentChildRelationships(obj3d)
      }
      return
    }

    if (typeof gltf !== 'object') {
      addError(entity, ModelComponent, 'INVALID_SOURCE', 'Invalid URL')
      return
    }

    const boneMatchedAsset =
      gltf instanceof VRM || modelComponent.convertToVRM.value ? (autoconvertMixamoAvatar(gltf) as GLTF) : gltf

    /**if we've loaded or converted to vrm, create animation component whose mixer's root is the normalized rig */
    if (boneMatchedAsset instanceof VRM)
      setComponent(entity, AnimationComponent, {
        mixer: new AnimationMixer(boneMatchedAsset.humanoid.normalizedHumanBonesRoot)
      })

    modelComponent.asset.set(boneMatchedAsset)
  }, [gltf])

  useEffect(() => {
    const model = modelComponent.get(NO_PROXY)!
    const asset = model.asset as GLTF | VRM | null
    if (!asset) return

    const group = getOptionalComponent(entity, GroupComponent)
    if (!group) return

    removeError(entity, ModelComponent, 'INVALID_SOURCE')
    removeError(entity, ModelComponent, 'LOADING_ERROR')
    const sceneObj = group[0] as Group

    sceneObj.userData.src = model.src
    modelComponent.scene.set(sceneObj)
  }, [modelComponent.asset])

  // update scene
  useEffect(() => {
    const { scene, asset, src } = getComponent(entity, ModelComponent)

    if (!scene || !asset) return

    /**hotfix for gltf animations being stored in the root and not scene property */
    if (!asset.scene.animations.length && !(asset instanceof VRM)) asset.scene.animations = asset.animations

    const loadedJsonHierarchy = parseGLTFModel(entity, asset.scene as Scene)
    const uuid = getModelSceneID(entity)
    const sceneJson: SceneJsonType = {
      entities: loadedJsonHierarchy,
      root: getComponent(entity, UUIDComponent),
      version: 0
    }
    const sceneGLTF = convertSceneJSONToGLTF(sceneJson)
    dispatchAction(
      GLTFSnapshotAction.createSnapshot({
        source: uuid,
        data: sceneGLTF
      })
    )
    getMutableState(GLTFSourceState)[uuid].set(entity)

    const renderer = getOptionalComponent(Engine.instance.viewerEntity, RendererComponent)

    if (renderer)
      renderer.renderer!.compileAsync(scene, getComponent(Engine.instance.viewerEntity, CameraComponent)).catch(() => {
        addError(entity, ModelComponent, 'LOADING_ERROR', 'Error compiling model')
      })

    const gltf = asset as GLTF
    if (gltf.animations?.length) scene.animations = gltf.animations
    if (scene.animations?.length) {
      setComponent(entity, AnimationComponent, {
        mixer: new AnimationMixer(scene),
        animations: scene.animations
      })
    }
    return () => {
      getMutableState(GLTFSourceState)[uuid].set(none)

      // If model hasn't been dereferenced unload and remove children
      if (getState(GLTFSnapshotState)[uuid]) {
        dispatchAction(GLTFSnapshotAction.unload({ source: uuid }))
        for (const childUUID in loadedJsonHierarchy) {
          const entity = UUIDComponent.getEntityByUUID(childUUID as EntityUUID)
          if (entity) {
            removeEntityNodeRecursively(entity)
          }
        }
      }
    }
  }, [modelComponent.scene])

  useEffect(() => {
    if (!modelComponent.scene.value) return
    if (!modelComponent.dereference.value) return
    if (!gltfDocumentState[modelSceneID].value) return
    const modelUUID = getComponent(entity, UUIDComponent)
    const sourceID = getModelSceneID(entity)
    const parentEntity = getComponent(entity, EntityTreeComponent).parentEntity
    if (!parentEntity) return
    const parentUUID = getComponent(parentEntity, UUIDComponent)
    const parentSource = getComponent(parentEntity, SourceComponent)
    iterateEntityNode(entity, (entity) => {
      setComponent(entity, SourceComponent, parentSource)
    })
    GLTFSnapshotState.injectSnapshot(modelUUID, sourceID, parentUUID, parentSource)
  }, [modelComponent.dereference, gltfDocumentState[modelSceneID]])

  return null
}

/**
 * Returns true if the entity has a model component or a mesh component that is not a child of model
 * @param entity
 * @returns {boolean}
 */
export const useHasModelOrIndependentMesh = (entity: Entity) => {
  const hasModel = !!useOptionalComponent(entity, ModelComponent)
  const isChildOfModel = !!useAncestorWithComponents(entity, [ModelComponent])
  const hasMesh = !!useOptionalComponent(entity, MeshComponent)

  return hasModel || (hasMesh && !isChildOfModel)
}

export const MeshOrModelQuery = (props: { ChildReactor: FC<{ entity: Entity; rootEntity: Entity }> }) => {
  const ModelReactor = () => {
    const entity = useEntityContext()
    const sceneInstanceID = useModelSceneID(entity)
    const childEntities = useHookstate(SourceComponent.entitiesBySourceState[sceneInstanceID])
    return (
      <>
        {childEntities.value?.map((childEntity) => (
          <props.ChildReactor entity={childEntity} rootEntity={entity} key={childEntity} />
        ))}
      </>
    )
  }

  const MeshReactor = () => {
    const entity = useEntityContext()
    return <props.ChildReactor entity={entity} rootEntity={entity} key={entity} />
  }

  return (
    <>
      <QueryReactor Components={[ModelComponent]} ChildEntityReactor={ModelReactor} />
      <QueryReactor Components={[Not(SourceComponent), MeshComponent]} ChildEntityReactor={MeshReactor} />
    </>
  )
}
