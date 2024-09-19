
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@xrengine/client-core/src/common/components/Avatar'
import Button from '@xrengine/client-core/src/common/components/Button'
import commonStyles from '@xrengine/client-core/src/common/components/common.module.scss'
import Menu from '@xrengine/client-core/src/common/components/Menu'
import Text from '@xrengine/client-core/src/common/components/Text'
import { useGet } from '@xrengine/common'
import { UserID, userPath } from '@xrengine/common/src/schema.type.module'
import { useMutableState } from '@xrengine/hyperflux'
import Box from '@xrengine/ui/src/primitives/mui/Box'
import Chip from '@xrengine/ui/src/primitives/mui/Chip'

import { NotificationService } from '../../../../common/services/NotificationService'
import { SocialMenus } from '../../../../networking/NetworkInstanceProvisioning'
import { FriendService, FriendState } from '../../../../social/services/FriendService'
import { AvatarUIContextMenuState } from '../../../../systems/ui/UserMenuView'
import { useUserAvatarThumbnail } from '../../../functions/useUserAvatarThumbnail'
import { AuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { PopupMenuServices } from '../PopupMenuService'

interface Props {
  onBack?: () => void
}

const AvatarContextMenu = ({ onBack }: Props): JSX.Element => {
  const { t } = useTranslation()
  const friendState = useMutableState(FriendState)
  const avatarUIContextMenuState = useMutableState(AvatarUIContextMenuState)
  const userId = avatarUIContextMenuState.id.value as UserID
  const user = useGet(userPath, userId)

  const authState = useMutableState(AuthState)
  const selfId = authState.user.id?.value ?? ''

  const isFriend = friendState.relationships
    .get({ noproxy: true })
    .find((item) => item.relatedUserId === userId && item.userRelationshipType === 'friend')
  const isRequested = friendState.relationships
    .get({ noproxy: true })
    .find((item) => item.relatedUserId === userId && item.userRelationshipType === 'requested')
  const isPending = friendState.relationships
    .get({ noproxy: true })
    .find((item) => item.relatedUserId === userId && item.userRelationshipType === 'pending')
  const isBlocked = friendState.relationships
    .get({ noproxy: true })
    .find((item) => item.relatedUserId === userId && item.userRelationshipType === 'blocked')
  const isBlocking = friendState.relationships
    .get({ noproxy: true })
    .find((item) => item.relatedUserId === userId && item.userRelationshipType === 'blocking')

  const userName = isFriend
    ? isFriend.relatedUser.name
    : isRequested
    ? isRequested.relatedUser.name
    : isPending
    ? isPending.relatedUser.name
    : isBlocked
    ? isBlocked.relatedUser.name
    : isBlocking
    ? isBlocking.relatedUser.name
    : user.data?.name ?? 'A user'

  useEffect(() => {
    if (friendState.updateNeeded.value) {
      FriendService.getUserRelationship(selfId)
    }
  }, [friendState.updateNeeded.value])

  const handleMute = () => {
    console.log('Mute pressed')
    NotificationService.dispatchNotify('Mute Pressed', { variant: 'info' })
  }

  const userThumbnail = useUserAvatarThumbnail(userId)

  return (
    <Menu
      open
      contentMargin={onBack ? '-50px 0 0' : undefined}
      maxWidth="xs"
      showBackButton={!!onBack}
      onBack={onBack}
      onClose={() => {
        avatarUIContextMenuState.id.set('')
        PopupMenuServices.showPopupMenu()
      }}
    >
      {userId && (
        <Box
          className={styles.menuContent}
          style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '10px' }}
        >
          <Avatar imageSrc={userThumbnail} size={150} sx={{ margin: '0 auto' }} />

          <Text variant="h6" align="center" mt={2} mb={1}>
            {userName}
          </Text>

          {!isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
            <Button
              type="gradientRounded"
              width="70%"
              onClick={() => {
                FriendService.requestFriend(selfId, userId)
                PopupMenuServices.showPopupMenu(SocialMenus.Friends, { defaultSelectedTab: 'find' })
              }}
            >
              {t('user:personMenu.addAsFriend')}
            </Button>
          )}

          {isFriend && !isRequested && !isPending && !isBlocked && !isBlocking && (
            <Button
              type="gradientRounded"
              width="70%"
              onClick={() => {
                FriendService.unfriend(selfId, userId)
                PopupMenuServices.showPopupMenu(SocialMenus.Friends, { defaultSelectedTab: 'find' })
              }}
            >
              {t('user:personMenu.unFriend')}
            </Button>
          )}

          {isPending && (
            <>
              <Chip
                className={commonStyles.chip}
                sx={{ margin: '10px auto !important' }}
                label={t('user:friends.pending')}
                size="small"
                variant="outlined"
              />

              <Button
                type="gradientRounded"
                width="70%"
                onClick={() => {
                  FriendService.acceptFriend(selfId, userId)
                  PopupMenuServices.showPopupMenu(SocialMenus.Friends)
                }}
              >
                {t('user:personMenu.acceptRequest')}
              </Button>

              <Button
                type="gradientRounded"
                width="70%"
                onClick={() => {
                  FriendService.declineFriend(selfId, userId)
                  PopupMenuServices.showPopupMenu(SocialMenus.Friends, { defaultSelectedTab: 'find' })
                }}
              >
                {t('user:personMenu.declineRequest')}
              </Button>
            </>
          )}

          {isRequested && (
            <>
              <Chip
                className={commonStyles.chip}
                sx={{ margin: '10px auto !important' }}
                label={t('user:friends.requested')}
                size="small"
                variant="outlined"
              />

              <Button
                type="gradientRounded"
                width="70%"
                onClick={() => {
                  FriendService.unfriend(selfId, userId)
                  PopupMenuServices.showPopupMenu(SocialMenus.Friends, { defaultSelectedTab: 'find' })
                }}
              >
                {t('user:personMenu.cancelRequest')}
              </Button>
            </>
          )}

          <Button type="gradientRounded" width="70%" onClick={handleMute}>
            {t('user:personMenu.mute')}
          </Button>

          {!isBlocked && !isBlocking && (
            <Button
              type="gradientRounded"
              width="70%"
              onClick={() => {
                FriendService.blockUser(selfId, userId)
                PopupMenuServices.showPopupMenu(SocialMenus.Friends, { defaultSelectedTab: 'blocked' })
              }}
            >
              {t('user:personMenu.block')}
            </Button>
          )}

          {isBlocking && (
            <Button
              type="gradientRounded"
              width="70%"
              onClick={() => {
                FriendService.unblockUser(selfId, userId)
                PopupMenuServices.showPopupMenu(SocialMenus.Friends)
              }}
            >
              {t('user:personMenu.unblock')}
            </Button>
          )}
        </Box>
      )}
    </Menu>
  )
}

export default AvatarContextMenu
