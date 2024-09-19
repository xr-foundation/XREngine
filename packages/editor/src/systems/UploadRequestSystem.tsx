import { useEffect } from 'react'

import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { UploadRequestState } from '@xrengine/engine/src/assets/state/UploadRequestState'
import { getMutableState, getState, NO_PROXY, useState } from '@xrengine/hyperflux'

import { uploadProjectFiles } from '../functions/assetFunctions'
import { EditorState } from '../services/EditorServices'
import { ImportSettingsState } from '../services/ImportSettingsState'

export const UploadRequestSystem = defineSystem({
  uuid: 'xrengine.editor.UploadRequestSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const uploadRequestState = useState(getMutableState(UploadRequestState))
    useEffect(() => {
      const uploadRequests = uploadRequestState.queue.get(NO_PROXY)
      if (uploadRequests.length === 0) return

      const importSettings = getState(ImportSettingsState)
      const projectName = getState(EditorState).projectName
      const uploadPromises = uploadRequests.map((uploadRequest) => {
        return Promise.all(
          uploadProjectFiles(
            uploadRequest.projectName,
            [uploadRequest.file],
            [`projects/${projectName}${importSettings.importFolder}`]
          ).promises
        ).then(uploadRequest.callback)
      })
      uploadRequestState.queue.set([])
    }, [uploadRequestState.queue.length])
    return null
  }
})
