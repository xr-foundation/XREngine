import { useEffect } from 'react'

import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import BufferHandlerExtension from '@xrengine/engine/src/assets/exporters/gltf/extensions/BufferHandlerExtension'
import { defineActionQueue, getState } from '@xrengine/hyperflux'

import { clearModelResources, uploadProjectFiles } from '../functions/assetFunctions'
import { ImportSettingsState } from '../services/ImportSettingsState'

const beginModelExportQueue = defineActionQueue(BufferHandlerExtension.beginModelExport.matches)
const saveBufferQueue = defineActionQueue(BufferHandlerExtension.saveBuffer.matches)

const executionPromises = new Map<string, Promise<void>>()
const executionPromiseKey = ({ projectName, modelName }) => `${projectName}-${modelName}`

const getPromise = ({ projectName, modelName }) =>
  executionPromises.get(executionPromiseKey({ projectName, modelName })) ?? Promise.resolve()

/** @todo convert these to reactors */
const execute = () => {
  for (const action of beginModelExportQueue()) {
    const key = executionPromiseKey(action)
    const currentPromise = getPromise(action)
    executionPromises.set(
      key,
      currentPromise.then(() => clearModelResources(action.projectName, action.modelName))
    )
  }

  for (const action of saveBufferQueue()) {
    const { saveParms, projectName, modelName } = action
    const blob = new Blob([saveParms.buffer])
    const file = new File([blob], saveParms.uri)
    const importSettings = getState(ImportSettingsState)
    const currentPromise = getPromise({ projectName, modelName })
    executionPromises.set(
      executionPromiseKey({ projectName, modelName }),
      currentPromise.then(() =>
        Promise.all(
          uploadProjectFiles(projectName, [file], [`projects/${projectName}${importSettings.importFolder}`]).promises
        ).then(() => Promise.resolve())
      )
    )
  }
}

const reactor = () => {
  useEffect(() => {
    return () => {
      executionPromises.clear()
    }
  }, [])
  return null
}

export const ModelHandlingSystem = defineSystem({
  uuid: 'xrengine.editor.ModelHandlingSystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor
})
