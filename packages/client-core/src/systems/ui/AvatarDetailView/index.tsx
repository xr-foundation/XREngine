
import React from 'react'
import { useTranslation } from 'react-i18next'
import { CircleGeometry, Mesh, MeshBasicMaterial } from 'three'

import { useGet } from '@xrengine/common'
import { userPath } from '@xrengine/common/src/schema.type.module'
import { setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { getMutableState, hookstate, useHookstate } from '@xrengine/hyperflux'
import { NetworkState } from '@xrengine/network'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { createXRUI } from '@xrengine/spatial/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/spatial/src/xrui/functions/useXRUIState'

import { AvatarUIState } from '../../state/AvatarUIState'
import styleString from './index.scss?inline'

export function createAvatarDetailView(id: string) {
  const videoPreviewMesh = new Mesh(new CircleGeometry(0.25, 32), new MeshBasicMaterial())
  const state = hookstate({
    id,
    videoPreviewMesh
  })
  const ui = createXRUI(AvatarDetailView, state)
  setComponent(ui.entity, NameComponent, 'avatar-detail-ui-' + id)
  return ui
}

interface AvatarDetailState {
  id: string
}

const AvatarDetailView = () => {
  const { t } = useTranslation()
  const detailState = useXRUIState<AvatarDetailState>()
  const networkPeer = NetworkState.worldNetworkState?.peers
    ? Object.values(NetworkState.worldNetwork.peers).find((peer) => peer.userId === detailState.id.value)
    : undefined
  const user = useGet(userPath, networkPeer?.userId)
  const usersTypingState = useHookstate(getMutableState(AvatarUIState).usersTyping)
  const usersTyping = usersTypingState[detailState.id.value]?.value
  const username = user.data?.name ?? 'A user'

  return (
    <>
      <link href="https://fonts.googleapis.com/css?family=Lato:400" rel="stylesheet" type="text/css" />
      <style>{styleString}</style>
      {networkPeer && (
        <div className="avatarName">
          {username}
          {usersTyping && <h6 className="typingIndicator">{t('common:typing')}</h6>}
        </div>
      )}
    </>
  )
}
