
import { LayoutData } from 'rc-dock'

import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import { EntityUUID, getComponent } from '@xrengine/ecs'
import { UndefinedEntity } from '@xrengine/ecs/src/Entity'
import { GLTFModifiedState } from '@xrengine/engine/src/gltf/GLTFDocumentState'
import { LinkState } from '@xrengine/engine/src/scene/components/LinkComponent'
import { SourceComponent } from '@xrengine/engine/src/scene/components/SourceComponent'
import {
  defineState,
  getMutableState,
  getState,
  syncStateWithLocalStorage,
  useHookstate,
  useMutableState
} from '@xrengine/hyperflux'
import { useEffect } from 'react'

export enum UIMode {
  BASIC = 'BASIC',
  ADVANCED = 'ADVANCED'
}

export type StudioUIAddons = {
  container: Record<string, JSX.Element>
  newScene: Record<string, JSX.Element>
  //more addon points to come here
}

export const EditorState = defineState({
  name: 'EditorState',
  initial: () => ({
    projectName: null as string | null,
    sceneName: null as string | null,
    /** the url of the current scene file */
    scenePath: null as string | null,
    /** just used to store the id of the current scene asset */
    sceneAssetID: null as string | null,
    lockPropertiesPanel: '' as EntityUUID,
    panelLayout: {} as LayoutData,
    rootEntity: UndefinedEntity,
    uiEnabled: true,
    uiMode: UIMode.ADVANCED,
    uiAddons: {
      container: {},
      newScene: {}
    } as StudioUIAddons,
    acknowledgedUnsupportedBrowser: false
  }),
  useIsModified: () => {
    const rootEntity = useHookstate(getMutableState(EditorState).rootEntity).value
    const modifiedState = useMutableState(GLTFModifiedState)
    if (!rootEntity) return false
    return !!modifiedState[getComponent(rootEntity, SourceComponent)].value
  },
  isModified: () => {
    const rootEntity = getState(EditorState).rootEntity
    if (!rootEntity) return false
    return !!getState(GLTFModifiedState)[getComponent(rootEntity, SourceComponent)]
  },
  reactor: () => {
    const linkState = useMutableState(LinkState)

    useEffect(() => {
      if (!linkState.location.value) return

      NotificationService.dispatchNotify('Scene navigation is disabled in the studio', { variant: 'warning' })
      linkState.location.set(undefined)
    }, [linkState.location])

    return null
  },
  extension: syncStateWithLocalStorage(['acknowledgedUnsupportedBrowser'])
})
