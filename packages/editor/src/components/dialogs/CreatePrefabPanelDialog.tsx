import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { API } from '@xrengine/common'
import config from '@xrengine/common/src/config'
import { staticResourcePath } from '@xrengine/common/src/schema.type.module'
import { Entity, createEntity, entityExists, getComponent, removeEntity, setComponent } from '@xrengine/ecs'
import PrefabConfirmationPanelDialog from '@xrengine/editor/src/components/dialogs/PrefabConfirmationPanelDialog'
import { pathJoin } from '@xrengine/engine/src/assets/functions/miscUtils'
import { GLTFDocumentState } from '@xrengine/engine/src/gltf/GLTFDocumentState'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { SourceComponent } from '@xrengine/engine/src/scene/components/SourceComponent'
import { proxifyParentChildRelationships } from '@xrengine/engine/src/scene/functions/loadGLTFModel'
import { getMutableState, getState, startReactor, useHookstate } from '@xrengine/hyperflux'
import { TransformComponent } from '@xrengine/spatial'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Quaternion, Scene, Vector3 } from 'three'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { exportRelativeGLTF } from '../../functions/exportGLTF'
import { EditorState } from '../../services/EditorServices'
import { SelectionState } from '../../services/SelectionServices'

export default function CreatePrefabPanel({ entity }: { entity: Entity }) {
  const defaultPrefabFolder = useHookstate<string>('assets/custom-prefabs')
  const prefabName = useHookstate<string>('prefab')
  const prefabTag = useHookstate<string[]>([])
  const { t } = useTranslation()
  const isOverwriteModalVisible = useHookstate(false)
  const isOverwriteConfirmed = useHookstate(false)
  const onExportPrefab = async () => {
    const editorState = getState(EditorState)
    const fileName = defaultPrefabFolder.value + '/' + prefabName.value + '.gltf'
    const srcProject = editorState.projectName!
    const fileURL = pathJoin(config.client.fileServer, 'projects', srcProject, fileName)
    try {
      const parentEntity = getComponent(entity, EntityTreeComponent).parentEntity
      const resourcesold = await API.instance.service(staticResourcePath).find({
        query: { key: 'projects/' + srcProject + '/' + fileName }
      })
      if (resourcesold.data.length !== 0 && !isOverwriteConfirmed.value) {
        console.log('this name already exist, click confirm to overwrite the prefab')
        await isOverwriteModalVisible.set(true)
      } else {
        const prefabEntity = createEntity()
        const obj = new Scene()
        addObjectToGroup(prefabEntity, obj)
        proxifyParentChildRelationships(obj)
        setComponent(prefabEntity, EntityTreeComponent, { parentEntity })
        setComponent(prefabEntity, NameComponent, prefabName.value)
        const entityTransform = getComponent(entity, TransformComponent)
        const position = entityTransform.position.clone()
        const rotation = entityTransform.rotation.clone()
        const scale = entityTransform.scale.clone()
        setComponent(prefabEntity, TransformComponent, {
          position,
          rotation,
          scale
        })
        setComponent(entity, TransformComponent, {
          position: new Vector3(0, 0, 0),
          rotation: new Quaternion().identity(),
          scale: new Vector3(1, 1, 1)
        })
        setComponent(entity, EntityTreeComponent, { parentEntity: prefabEntity })
        getMutableState(SelectionState).selectedEntities.set([])
        getComponent(entity, TransformComponent).matrix.identity()
        await exportRelativeGLTF(prefabEntity, srcProject, fileName)

        const resources = await API.instance.service(staticResourcePath).find({
          query: { key: 'projects/' + srcProject + '/' + fileName }
        })
        if (resources.data.length === 0) {
          throw new Error('User not found')
        }
        const resource = resources.data[0]
        const tags = [...prefabTag.value]
        await API.instance.service(staticResourcePath).patch(resource.id, { tags: tags, project: srcProject })

        removeEntity(prefabEntity)
        EditorControlFunctions.removeObject([entity])
        const sceneID = getComponent(parentEntity, SourceComponent)
        const reactor = startReactor(() => {
          const documentState = useHookstate(getMutableState(GLTFDocumentState))
          const nodes = documentState[sceneID].nodes
          useEffect(() => {
            if (!entityExists(entity)) {
              const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
                [
                  { name: ModelComponent.jsonID, props: { src: fileURL } },
                  { name: TransformComponent.jsonID, props: { position, rotation, scale } }
                ],
                parentEntity
              )
              getMutableState(SelectionState).selectedEntities.set([entityUUID])
              reactor.stop()
            } else {
              console.log('Entity not removed')
            }
          }, [nodes])
          return null
        })
        PopoverState.hidePopupover()
        defaultPrefabFolder.set('assets/custom-prefabs')
        prefabName.set('prefab')
        prefabTag.set([])
        isOverwriteModalVisible.set(false)
        isOverwriteConfirmed.set(false)
        PopoverState.showPopupover(<PrefabConfirmationPanelDialog entity={entity} />)
      }
    } catch (e) {
      console.error(e)
    }
  }
  return (
    <>
      {!isOverwriteModalVisible.value && !isOverwriteConfirmed.value && (
        <Modal
          title="Create Prefab"
          onSubmit={onExportPrefab}
          className="w-[50vw] max-w-2xl"
          onClose={PopoverState.hidePopupover}
        >
          <Input
            value={defaultPrefabFolder.value}
            onChange={(event) => defaultPrefabFolder.set(event.target.value)}
            label="Default Save Folder"
          />
          <Input
            value={prefabName.value}
            onChange={(event) => prefabName.set(event.target.value)}
            label="Name"
            maxLength={64}
          />

          <Button
            size="small"
            variant="outline"
            className="text-left text-xs"
            onClick={() => {
              prefabTag.set([...(prefabTag.value ?? []), ''])
            }}
          >
            {t('editor:layout.filebrowser.fileProperties.addTag')}
          </Button>
          <div>
            {(prefabTag.value ?? []).map((tag, index) => (
              <div className="ml-4 flex items-end">
                <Input
                  key={index}
                  label={t('editor:layout.filebrowser.fileProperties.tag')}
                  onChange={(event) => {
                    const tags = [...prefabTag.value]
                    tags[index] = event.target.value
                    prefabTag.set(tags)
                  }}
                  value={prefabTag.value[index]}
                  endComponent={
                    <Button
                      onClick={() => {
                        prefabTag.set(prefabTag.value.filter((_, i) => i !== index))
                      }}
                      size="small"
                      variant="outline"
                      className="text-left text-xs"
                    >
                      x
                    </Button>
                  }
                />
              </div>
            ))}
          </div>
        </Modal>
      )}
      {/* Overwrite Confirmation Modal */}
      {isOverwriteModalVisible.value && (
        <Modal
          title="Overwrite Prefab"
          onSubmit={() => {
            isOverwriteConfirmed.set(true)
            isOverwriteModalVisible.set(false)
            onExportPrefab()
          }}
          onClose={() => {
            isOverwriteConfirmed.set(false)
            isOverwriteModalVisible.set(false)
          }}
          className="w-1/3 max-w-md p-4"
        >
          <div className="flex justify-end">
            <p>Prefab with this name already exists. You will overwrite it.</p>
          </div>
        </Modal>
      )}
    </>
  )
}
