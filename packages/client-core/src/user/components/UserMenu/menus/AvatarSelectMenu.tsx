import { debounce } from 'lodash'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@xrengine/client-core/src/common/components/Avatar'
import AvatarPreview from '@xrengine/client-core/src/common/components/AvatarPreview'
import Button from '@xrengine/client-core/src/common/components/Button'
import InputText from '@xrengine/client-core/src/common/components/InputText'
import Menu from '@xrengine/client-core/src/common/components/Menu'
import Text from '@xrengine/client-core/src/common/components/Text'
import { useFind, useMutation } from '@xrengine/common'
import { AvatarID, avatarPath, userAvatarPath } from '@xrengine/common/src/schema.type.module'
import { hasComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Engine } from '@xrengine/ecs/src/Engine'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { SpawnEffectComponent } from '@xrengine/engine/src/avatar/components/SpawnEffectComponent'
import { AvatarState } from '@xrengine/engine/src/avatar/state/AvatarNetworkState'
import { LocalAvatarState } from '@xrengine/engine/src/avatar/state/AvatarState'
import { getMutableState, useHookstate, useMutableState } from '@xrengine/hyperflux'
import Box from '@xrengine/ui/src/primitives/mui/Box'
import Grid from '@xrengine/ui/src/primitives/mui/Grid'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'
import IconButton from '@xrengine/ui/src/primitives/mui/IconButton'

import useFeatureFlags from '@xrengine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@xrengine/common/src/constants/FeatureFlags'
import { LoadingCircle } from '../../../../components/LoadingCircle'
import { UserMenus } from '../../../UserUISystem'
import { AuthState } from '../../../services/AuthService'
import { PopupMenuServices } from '../PopupMenuService'
import styles from '../index.module.scss'

const AVATAR_PAGE_LIMIT = 100

const AvatarMenu = () => {
  const { t } = useTranslation()
  const authState = useMutableState(AuthState)
  const userId = authState.user?.id?.value
  const userAvatarId = useHookstate(getMutableState(AvatarState)[Engine.instance.userID].avatarID as AvatarID)
  const avatarLoading = useHookstate(false)
  const isUserReady = useHookstate(getMutableState(LocalAvatarState).avatarReady)

  const [createAvatarEnabled] = useFeatureFlags([FeatureFlags.Client.Menu.CreateAvatar])

  const page = useHookstate(0)
  const selectedAvatarId = useHookstate('' as AvatarID)
  const search = useHookstate({ local: '', query: '' })
  const userAvatarMutation = useMutation(userAvatarPath)

  const avatarsData = useFind(avatarPath, {
    query: {
      name: {
        $like: `%${search.query.value}%`
      },
      $skip: page.value * AVATAR_PAGE_LIMIT,
      $limit: AVATAR_PAGE_LIMIT
    }
  }).data
  const currentAvatar = avatarsData.find((item) => item.id === selectedAvatarId.value)

  const searchTimeoutCancelRef = useRef<(() => void) | null>(null)

  const handleConfirmAvatar = () => {
    if (userAvatarId.value !== selectedAvatarId.value) {
      const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
      if (!selfAvatarEntity || !hasComponent(selfAvatarEntity, SpawnEffectComponent)) {
        userAvatarMutation.patch(
          null,
          { avatarId: selectedAvatarId.value },
          { query: { userId: Engine.instance.store.userID } }
        )
        if (selfAvatarEntity) avatarLoading.set(true)
        else PopupMenuServices.showPopupMenu()
      }
    }
    selectedAvatarId.set('' as AvatarID)
  }

  const handleSearch = async (searchString: string) => {
    search.local.set(searchString)

    if (searchTimeoutCancelRef.current) {
      searchTimeoutCancelRef.current()
    }

    const debouncedSearchQuery = debounce(() => {
      search.query.set(searchString)
    }, 500)

    debouncedSearchQuery()

    searchTimeoutCancelRef.current = debouncedSearchQuery.cancel
  }

  useEffect(() => {
    if (avatarLoading.value && isUserReady.value) {
      avatarLoading.set(false)
      PopupMenuServices.showPopupMenu()
    }
  }, [isUserReady, avatarLoading])

  return (
    <Menu
      open
      showBackButton
      actions={
        <Box display="flex" width="100%" justifyContent="center">
          {avatarLoading.value ? (
            <LoadingCircle />
          ) : (
            <Button
              disabled={!currentAvatar || currentAvatar.id === userAvatarId.value}
              startIcon={<Icon type="Check" />}
              size="medium"
              type="gradientRounded"
              title={t('user:avatar.confirm')}
              onClick={handleConfirmAvatar}
            >
              {t('user:avatar.confirm')}
            </Button>
          )}
        </Box>
      }
      title={t('user:avatar.titleSelectAvatar')}
      onBack={() => PopupMenuServices.showPopupMenu(UserMenus.Profile)}
      onClose={() => PopupMenuServices.showPopupMenu()}
    >
      <Box className={styles.menuContent}>
        <Grid container spacing={2}>
          <Grid item md={6} sx={{ width: '100%', mt: 1 }}>
            <AvatarPreview fill avatarUrl={currentAvatar?.modelResource?.url} />
          </Grid>

          <Grid item md={6} sx={{ width: '100%' }}>
            <InputText
              placeholder={t('user:avatar.searchAvatar')}
              value={search.local.value}
              sx={{ mt: 1 }}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <IconButton
              icon={<Icon type="KeyboardArrowUp" />}
              sx={{ display: 'none' }}
              onClick={() => page.set((prevPage) => prevPage - 1)}
            />

            <Grid container sx={{ height: '275px', gap: 1.5, overflowX: 'hidden', overflowY: 'auto' }}>
              {avatarsData.map((avatar) => (
                <Grid item key={avatar.id} md={12} sx={{ pt: 0, width: '100%' }}>
                  <Avatar
                    imageSrc={avatar.thumbnailResource?.url || ''}
                    isSelected={currentAvatar && avatar.id === currentAvatar.id}
                    name={avatar.name}
                    showChangeButton={userId && avatar.userId === userId}
                    type="rectangle"
                    onClick={() => selectedAvatarId.set(avatar.id)}
                    onChange={() => PopupMenuServices.showPopupMenu(UserMenus.AvatarModify, { currentAvatar: avatar })}
                  />
                </Grid>
              ))}

              {avatarsData.length === 0 && (
                <Text align="center" margin={'32px auto'} variant="body2">
                  {t('user:avatar.noAvatars')}
                </Text>
              )}
            </Grid>

            <Box>
              <IconButton
                icon={<Icon type="KeyboardArrowDown" />}
                sx={{ display: 'none' }}
                onClick={() => page.set((prevPage) => prevPage + 1)}
              />
            </Box>
            {createAvatarEnabled && (
              <Button
                fullWidth
                startIcon={<Icon type="PersonAdd" />}
                title={t('user:avatar.createAvatar')}
                type="gradientRounded"
                sx={{ mb: 0 }}
                onClick={() => PopupMenuServices.showPopupMenu(UserMenus.AvatarModify)}
              >
                {t('user:avatar.createAvatar')}
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>
    </Menu>
  )
}

export default AvatarMenu
