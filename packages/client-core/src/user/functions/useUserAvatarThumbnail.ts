import { useFind, useGet } from '@xrengine/common'
import { config } from '@xrengine/common/src/config'
import { UserID, avatarPath, userAvatarPath } from '@xrengine/common/src/schema.type.module'

export const DEFAULT_PROFILE_IMG_PLACEHOLDER = `${config.client.fileServer}/projects/xrengine/default-project/assets/default-silhouette.svg`

export const useUserAvatarThumbnail = (userId?: UserID) => {
  const userAvatar = useFind(userAvatarPath, {
    query: {
      userId
    }
  })

  const avatar = useGet(avatarPath, userAvatar.data?.[0]?.avatarId)
  return avatar.data?.thumbnailResource?.url ?? DEFAULT_PROFILE_IMG_PLACEHOLDER
}
