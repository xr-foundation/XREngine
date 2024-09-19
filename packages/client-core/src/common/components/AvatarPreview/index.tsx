import { SxProps, Theme } from '@mui/material/styles'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import commonStyles from '@xrengine/client-core/src/common/components/common.module.scss'
import Text from '@xrengine/client-core/src/common/components/Text'
import { useRender3DPanelSystem } from '@xrengine/client-core/src/user/components/Panel3D/useRender3DPanelSystem'
import { createEntity, generateEntityUUID, setComponent, UndefinedEntity, UUIDComponent } from '@xrengine/ecs'
import { preloadedAnimations } from '@xrengine/engine/src/avatar/animation/Util'
import { LoopAnimationComponent } from '@xrengine/engine/src/avatar/components/LoopAnimationComponent'
import { AssetPreviewCameraComponent } from '@xrengine/engine/src/camera/components/AssetPreviewCameraComponent'
import { EnvmapComponent } from '@xrengine/engine/src/scene/components/EnvmapComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { EnvMapSourceType } from '@xrengine/engine/src/scene/constants/EnvMapEnum'
import { AmbientLightComponent, TransformComponent } from '@xrengine/spatial'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'
import Box from '@xrengine/ui/src/primitives/mui/Box'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'
import Tooltip from '@xrengine/ui/src/primitives/mui/Tooltip'

import { DomainConfigState } from '@xrengine/engine/src/assets/state/DomainConfigState'
import { getState } from '@xrengine/hyperflux'
import styles from './index.module.scss'

interface Props {
  fill?: boolean
  avatarUrl?: string
  sx?: SxProps<Theme>
  onAvatarError?: (error: string) => void
  onAvatarLoaded?: () => void
}

const defaultAnimationPath = '/projects/xrengine/default-project/assets/animations/'

const AvatarPreview = ({ fill, avatarUrl, sx, onAvatarError, onAvatarLoaded }: Props) => {
  const { t } = useTranslation()
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const renderPanel = useRender3DPanelSystem(panelRef)

  useEffect(() => {
    if (!avatarUrl) return

    const { sceneEntity, cameraEntity } = renderPanel
    const uuid = generateEntityUUID()
    setComponent(sceneEntity, UUIDComponent, uuid)
    setComponent(sceneEntity, NameComponent, '3D Preview Entity')
    setComponent(sceneEntity, LoopAnimationComponent, {
      animationPack:
        getState(DomainConfigState).cloudDomain + defaultAnimationPath + preloadedAnimations.locomotion + '.glb',
      activeClipIndex: 5
    })
    setComponent(sceneEntity, ModelComponent, { src: avatarUrl, convertToVRM: true })
    setComponent(sceneEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(sceneEntity, VisibleComponent, true)
    setComponent(sceneEntity, EnvmapComponent, { type: EnvMapSourceType.Skybox })

    setComponent(cameraEntity, AssetPreviewCameraComponent, { targetModelEntity: sceneEntity })

    const lightEntity = createEntity()
    setComponent(lightEntity, AmbientLightComponent)
    setComponent(lightEntity, TransformComponent)
    setComponent(lightEntity, VisibleComponent)
    setComponent(lightEntity, NameComponent, 'Ambient Light')
    setComponent(lightEntity, EntityTreeComponent, { parentEntity: sceneEntity })
  }, [avatarUrl])

  return (
    <Box className={`${commonStyles.preview} ${fill ? styles.fill : ''}`} sx={sx}>
      <div id="stage" className={`${styles.stage} ${fill ? styles.fill : ''}`}>
        <canvas ref={panelRef} style={{ pointerEvents: 'all' }} />
      </div>

      {!avatarUrl && (
        <Text className={commonStyles.previewText} variant="body2">
          {t('admin:components.avatar.avatarPreview')}
        </Text>
      )}

      <Tooltip
        arrow
        title={
          <Box sx={{ width: 100 }}>
            <Text variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {t('user:avatar.rotate')}:
            </Text>
            <Text variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
              {t('admin:components.avatar.leftClick')}
              <Icon type="Mouse" fontSize="small" />
            </Text>

            <br />

            <Text variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {t('user:avatar.pan')}:
            </Text>
            <Text variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
              {t('admin:components.avatar.rightClick')} <Icon type="Mouse" fontSize="small" />
            </Text>

            <br />

            <Text variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {t('admin:components.avatar.zoom')}:
            </Text>
            <Text variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
              {t('admin:components.avatar.scroll')} <Icon type="Mouse" fontSize="small" />
            </Text>
          </Box>
        }
      >
        <Icon type="Help" sx={{ position: 'absolute', top: 0, right: 0, margin: 1 }} />
      </Tooltip>
    </Box>
  )
}

export default AvatarPreview
