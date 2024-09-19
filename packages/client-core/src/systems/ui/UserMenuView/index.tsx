import React from 'react'
import { useTranslation } from 'react-i18next'

import { UserID } from '@xrengine/common/src/schema.type.module'
import { removeComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { defineState, getMutableState, useMutableState } from '@xrengine/hyperflux'
import { NetworkState } from '@xrengine/network'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { XRUI, createXRUI } from '@xrengine/spatial/src/xrui/functions/createXRUI'

import { FriendService, FriendState } from '../../../social/services/FriendService'
import { useUserAvatarThumbnail } from '../../../user/functions/useUserAvatarThumbnail'
import { AuthState } from '../../../user/services/AuthService'
import XRTextButton from '../../components/XRTextButton'
import styles from './index.scss?inline'

export const AvatarUIContextMenuState = defineState({
  name: 'AvatarUISystem',
  initial: () => {
    const ui = createXRUI(AvatarContextMenu) as XRUI<null>
    removeComponent(ui.entity, VisibleComponent)
    return {
      ui,
      id: null! as string | UserID
    }
  }
})

export const AvatarUIContextMenuService = {
  setId: (id: UserID) => {
    const avatarUIContextMenuState = getMutableState(AvatarUIContextMenuState)
    avatarUIContextMenuState.id.set(id)
  }
}

function AvatarContextMenu() {
  const detailState = useMutableState(AvatarUIContextMenuState)
  const friendState = useMutableState(FriendState)
  const authState = useMutableState(AuthState)
  const selfId = authState.user.id?.value ?? ''

  const peers = NetworkState.worldNetwork?.peers
  const user = peers
    ? Object.values(peers).find((peer) => peer.userId === detailState.id.value) || undefined
    : undefined
  const { t } = useTranslation()

  const isFriend = friendState.relationships.value.find(
    (item) => item.relatedUserId === user?.userId && item.userRelationshipType === 'friend'
  )
  const isRequested = friendState.relationships.value.find(
    (item) => item.relatedUserId === user?.userId && item.userRelationshipType === 'requested'
  )
  const isPending = friendState.relationships.value.find(
    (item) => item.relatedUserId === user?.userId && item.userRelationshipType === 'pending'
  )
  const isBlocked = friendState.relationships.value.find(
    (item) => item.relatedUserId === user?.userId && item.userRelationshipType === 'blocked'
  )
  const isBlocking = friendState.relationships.value.find(
    (item) => item.relatedUserId === user?.userId && item.userRelationshipType === 'blocking'
  )

  const handleMute = () => {
    console.log('Mute pressed')
  }

  // useEffect(() => {
  //   if (detailState.id.value !== '') {
  //     const tappedUser = Object.values(NetworkState.worldNetwork.peers).find(
  //       (peer) => peer.userId === detailState.id.value
  //     )
  //     PopupMenuServices.showPopupMenu(AvatarMenus.AvatarContext, { user: tappedUser })
  //   }
  // }, [detailState.id])

  const userThumbnail = useUserAvatarThumbnail(user?.userId)

  return (
    <>
      {user?.userId && (
        <div className={styles.rootContainer}>
          <img
            style={{
              height: 'auto',
              maxWidth: '100%'
            }}
            className={styles.ownerImage}
            src={userThumbnail}
            alt=""
            crossOrigin="anonymous"
          />
          <div className={styles.buttonContainer}>
            <section className={styles.buttonSection}>
              {!isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
                <XRTextButton onClick={() => FriendService.requestFriend(selfId, user?.userId)}>
                  {t('user:personMenu.addAsFriend')}
                </XRTextButton>
              )}

              {isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
                <XRTextButton onClick={() => FriendService.unfriend(selfId, user?.userId)}>
                  {t('user:personMenu.unFriend')}
                </XRTextButton>
              )}

              {isPending && (
                <>
                  <XRTextButton onClick={() => FriendService.acceptFriend(selfId, user?.userId)}>
                    {t('user:personMenu.acceptRequest')}
                  </XRTextButton>

                  <XRTextButton onClick={() => FriendService.declineFriend(selfId, user?.userId)}>
                    {t('user:personMenu.declineRequest')}
                  </XRTextButton>
                </>
              )}

              {isRequested && (
                <XRTextButton onClick={() => FriendService.unfriend(selfId, user?.userId)}>
                  {t('user:personMenu.cancelRequest')}
                </XRTextButton>
              )}

              <XRTextButton onClick={handleMute}>{t('user:personMenu.mute')}</XRTextButton>

              {isFriend && !isBlocked && !isBlocking && (
                <XRTextButton onClick={() => FriendService.blockUser(selfId, user?.userId)}>
                  {t('user:personMenu.block')}
                </XRTextButton>
              )}

              {isBlocking && (
                <XRTextButton onClick={() => FriendService.unblockUser(selfId, user?.userId)}>
                  {t('user:personMenu.unblock')}
                </XRTextButton>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  )
}
