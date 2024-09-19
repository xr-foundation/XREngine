import { ECSState } from '@xrengine/ecs/src/ECSState'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { respawnAvatar } from '@xrengine/engine/src/avatar/functions/respawnAvatar'
import { getMutableState, useHookstate, useMutableState } from '@xrengine/hyperflux'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdAllOut, MdFormatColorReset, MdGridOn, MdPerson, MdRefresh, MdSelectAll, MdSquareFoot } from 'react-icons/md'

export default function DebugButtons() {
  const { t } = useTranslation()
  useHookstate(getMutableState(ECSState).frameTime).value
  const rendererState = useMutableState(RendererState)

  const onClickRespawn = (): void => {
    respawnAvatar(AvatarComponent.getSelfAvatarEntity())
  }

  const toggleDebug = () => {
    rendererState.physicsDebug.set(!rendererState.physicsDebug.value)
  }

  const toggleAvatarDebug = () => {
    rendererState.avatarDebug.set(!rendererState.avatarDebug.value)
  }

  const toggleNodeHelpers = () => {
    getMutableState(RendererState).nodeHelperVisibility.set(!getMutableState(RendererState).nodeHelperVisibility.value)
  }

  const toggleGridHelper = () => {
    getMutableState(RendererState).gridVisibility.set(!getMutableState(RendererState).gridVisibility.value)
  }

  return (
    <div className="m-1 rounded bg-neutral-600 p-1">
      <Text>{t('common:debug.debugOptions')}</Text>
      <div className="flex items-center gap-1">
        <Button
          size="small"
          variant={rendererState.physicsDebug.value ? 'secondary' : 'outline'}
          startIcon={<MdSquareFoot />}
          title={t('common:debug.physicsDebug')}
          onClick={toggleDebug}
        />
        <Button
          size="small"
          variant={rendererState.bvhDebug.value ? 'secondary' : 'outline'}
          startIcon={<MdAllOut />}
          title={t('common:debug.bvhDebug')}
          onClick={() => rendererState.bvhDebug.set(!rendererState.bvhDebug.value)}
        />
        <Button
          size="small"
          variant={rendererState.avatarDebug.value ? 'secondary' : 'outline'}
          startIcon={<MdPerson />}
          title={t('common:debug.avatarDebug')}
          onClick={toggleAvatarDebug}
        />
        <Button
          size="small"
          variant={rendererState.nodeHelperVisibility.value ? 'secondary' : 'outline'}
          startIcon={<MdSelectAll />}
          title={t('common:debug.nodeHelperDebug')}
          onClick={toggleNodeHelpers}
        />
        <Button
          size="small"
          variant={rendererState.gridVisibility.value ? 'secondary' : 'outline'}
          startIcon={<MdGridOn />}
          title={t('common:debug.gridDebug')}
          onClick={toggleGridHelper}
        />
        <Button
          size="small"
          variant={rendererState.forceBasicMaterials.value ? 'secondary' : 'outline'}
          startIcon={<MdFormatColorReset />}
          title={t('common:debug.forceBasicMaterials')}
          onClick={() => rendererState.forceBasicMaterials.set(!rendererState.forceBasicMaterials.value)}
        />
        <Button
          size="small"
          variant="outline"
          startIcon={<MdRefresh />}
          title={t('common:debug.respawn')}
          onClick={onClickRespawn}
        />
      </div>
    </div>
  )
}
