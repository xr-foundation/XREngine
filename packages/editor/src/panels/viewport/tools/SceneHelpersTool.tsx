
import useFeatureFlags from '@xrengine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@xrengine/common/src/constants/FeatureFlags'
import { downloadScreenshot } from '@xrengine/editor/src/functions/takeScreenshot'
import { EditorHelperState, PlacementMode } from '@xrengine/editor/src/services/EditorHelperState'
import { useMutableState } from '@xrengine/hyperflux'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { LuMousePointerClick, LuMove3D } from 'react-icons/lu'
import { twMerge } from 'tailwind-merge'
import ColliderAtomsSvg from './icons/collider_atoms.svg?react'
import RulerSvg from './icons/ruler.svg?react'
import ScreenshotSvg from './icons/screenshot.svg?react'

export default function SceneHelpersTool() {
  const { t } = useTranslation()
  const editorHelperState = useMutableState(EditorHelperState)
  const rendererState = useMutableState(RendererState)
  const [pointClickEnabled] = useFeatureFlags([FeatureFlags.Studio.UI.PointClick])

  return (
    <div className="flex items-center gap-1">
      {pointClickEnabled && (
        <Tooltip content={t('editor:toolbar.placement.click')}>
          <Button
            startIcon={<LuMousePointerClick className="text-theme-input" />}
            onClick={() => editorHelperState.placementMode.set(PlacementMode.CLICK)}
            variant={editorHelperState.placementMode.value === PlacementMode.CLICK ? 'outline' : 'transparent'}
            className="px-0"
          />
        </Tooltip>
      )}
      <Tooltip content={t('editor:toolbar.placement.drag')}>
        <Button
          startIcon={<LuMove3D className="text-theme-input" />}
          onClick={() => editorHelperState.placementMode.set(PlacementMode.DRAG)}
          variant={editorHelperState.placementMode.value === PlacementMode.DRAG ? 'outline' : 'transparent'}
          className="px-0"
        />
      </Tooltip>
      <Tooltip
        title={t('editor:toolbar.helpersToggle.lbl-helpers')}
        content={t('editor:toolbar.helpersToggle.info-helpers')}
      >
        <Button
          startIcon={<RulerSvg className="text-theme-input" />}
          onClick={() => rendererState.physicsDebug.set(!rendererState.physicsDebug.value)}
          variant={rendererState.physicsDebug.value ? 'outline' : 'transparent'}
          className={twMerge('px-0', rendererState.physicsDebug.value && 'border border-solid border-transparent')}
        />
      </Tooltip>
      <Tooltip
        title={t('editor:toolbar.helpersToggle.lbl-nodeHelpers')}
        content={t('editor:toolbar.helpersToggle.info-nodeHelpers')}
      >
        <Button
          startIcon={<ColliderAtomsSvg className="text-theme-input" />}
          onClick={() => rendererState.nodeHelperVisibility.set(!rendererState.nodeHelperVisibility.value)}
          variant={rendererState.nodeHelperVisibility.value ? 'outline' : 'transparent'}
          className={twMerge(
            'px-0',
            rendererState.nodeHelperVisibility.value && 'border border-solid border-transparent'
          )}
        />
      </Tooltip>
      <Tooltip title={t('editor:toolbar.sceneScreenshot.lbl')} content={t('editor:toolbar.sceneScreenshot.info')}>
        <Button
          startIcon={<ScreenshotSvg className="text-theme-input" />}
          onClick={() => downloadScreenshot()}
          variant="transparent"
          className="border border-solid border-transparent px-0"
        />
      </Tooltip>
    </div>
  )
}
