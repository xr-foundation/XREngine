import { toggleSnapMode } from '@xrengine/editor/src/functions/transformFunctions'
import { EditorHelperState } from '@xrengine/editor/src/services/EditorHelperState'
import { ObjectGridSnapState } from '@xrengine/editor/src/systems/ObjectGridSnapSystem'
import { SnapMode } from '@xrengine/engine/src/scene/constants/transformConstants'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Select from '@xrengine/ui/src/primitives/tailwind/Select'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { LuUtilityPole } from 'react-icons/lu'
import { MdOutlineCenterFocusWeak } from 'react-icons/md'

const translationSnapOptions = [
  { label: '0.1m', value: 0.1 },
  { label: '0.125m', value: 0.125 },
  { label: '0.25m', value: 0.25 },
  { label: '0.5m', value: 0.5 },
  { label: '1m', value: 1 },
  { label: '2m', value: 2 },
  { label: '4m', value: 4 }
]

const rotationSnapOptions = [
  { label: '1°', value: 1 },
  { label: '5°', value: 5 },
  { label: '10°', value: 10 },
  { label: '15°', value: 15 },
  { label: '30°', value: 30 },
  { label: '45°', value: 45 },
  { label: '90°', value: 90 }
]

const TransformSnapTool = () => {
  const { t } = useTranslation()

  const editorHelperState = useHookstate(getMutableState(EditorHelperState))
  const objectSnapState = useHookstate(getMutableState(ObjectGridSnapState))
  const onChangeTranslationSnap = (snapValue: number) => {
    getMutableState(EditorHelperState).translationSnap.set(snapValue)
    if (editorHelperState.gridSnap.value !== SnapMode.Grid) {
      getMutableState(EditorHelperState).gridSnap.set(SnapMode.Grid)
    }
  }

  const onChangeRotationSnap = (snapValue: number) => {
    getMutableState(EditorHelperState).rotationSnap.set(snapValue)
    if (editorHelperState.gridSnap.value !== SnapMode.Grid) {
      getMutableState(EditorHelperState).gridSnap.set(SnapMode.Grid)
    }
  }

  const toggleAttachmentPointSnap = () => {
    objectSnapState.enabled.set(!objectSnapState.enabled.value)
  }

  return (
    <div className="flex items-center">
      <Tooltip content={t('editor:toolbar.transformSnapTool.toggleBBoxSnap')}>
        <Button
          startIcon={<LuUtilityPole className="text-theme-input" />}
          onClick={toggleAttachmentPointSnap}
          variant={objectSnapState.enabled.value ? 'outline' : 'transparent'}
          className="px-0"
        />
      </Tooltip>
      <Tooltip content={t('editor:toolbar.transformSnapTool.toggleSnapMode')}>
        <Button
          startIcon={<MdOutlineCenterFocusWeak className="text-theme-input" />}
          onClick={toggleSnapMode}
          variant={editorHelperState.gridSnap.value === SnapMode.Grid ? 'outline' : 'transparent'}
          className="px-0"
        />
      </Tooltip>
      <Tooltip content={t('editor:toolbar.transformSnapTool.info-translate')} position="right center">
        <Select
          key={editorHelperState.translationSnap.value}
          inputClassName="py-1 h-6 rounded-sm text-theme-gray3 text-xs"
          className="w-20 border-theme-input p-1 text-theme-gray3"
          onChange={onChangeTranslationSnap}
          options={translationSnapOptions}
          currentValue={editorHelperState.translationSnap.value}
        />
      </Tooltip>
      <Tooltip content={t('editor:toolbar.transformSnapTool.info-rotate')} position="right center">
        <Select
          key={editorHelperState.rotationSnap.value}
          inputClassName="py-1 h-6 rounded-sm text-theme-gray3 text-xs pe-9"
          className="w-20 border-theme-input p-1 text-theme-gray3"
          onChange={onChangeRotationSnap}
          options={rotationSnapOptions}
          currentValue={editorHelperState.rotationSnap.value}
        />
      </Tooltip>
    </div>
  )
}

export default TransformSnapTool
