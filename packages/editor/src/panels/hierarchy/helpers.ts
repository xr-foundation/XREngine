import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import { Entity, getComponent, UUIDComponent } from '@xrengine/ecs'
import { AllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { getState } from '@xrengine/hyperflux'
import { t } from 'i18next'
import { CopyPasteFunctions } from '../../functions/CopyPasteFunctions'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { SelectionState } from '../../services/SelectionServices'

/* COMMON */

export const uploadOptions = {
  multiple: true,
  accepts: AllFileTypes
}

/** UTILITIES **/

const getSelectedEntities = (entity?: Entity) => {
  const selected = entity
    ? getState(SelectionState).selectedEntities.includes(getComponent(entity, UUIDComponent))
    : true
  const selectedEntities = selected ? SelectionState.getSelectedEntities() : [entity!]
  return selectedEntities
}

export const deleteNode = (entity: Entity) => {
  EditorControlFunctions.removeObject(getSelectedEntities(entity))
}

export const duplicateNode = (entity?: Entity) => {
  EditorControlFunctions.duplicateObject(getSelectedEntities(entity))
}

export const groupNodes = (entity?: Entity) => {
  EditorControlFunctions.groupObjects(getSelectedEntities(entity))
}

export const copyNodes = (entity?: Entity) => {
  CopyPasteFunctions.copyEntities(getSelectedEntities(entity))
}

export const pasteNodes = (entity?: Entity) => {
  CopyPasteFunctions.getPastedEntities()
    .then((nodeComponentJSONs) => {
      nodeComponentJSONs.forEach((componentJSONs) => {
        EditorControlFunctions.createObjectFromSceneElement(componentJSONs, undefined, getSelectedEntities(entity)[0])
      })
    })
    .catch(() => {
      NotificationService.dispatchNotify(t('editor:hierarchy.copy-paste.no-hierarchy-nodes') as string, {
        variant: 'error'
      })
    })
}
