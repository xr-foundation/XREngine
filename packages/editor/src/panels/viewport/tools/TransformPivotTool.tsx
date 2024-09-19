
import { setTransformPivot, toggleTransformPivot } from '@xrengine/editor/src/functions/transformFunctions'
import { EditorHelperState } from '@xrengine/editor/src/services/EditorHelperState'
import { TransformPivot } from '@xrengine/engine/src/scene/constants/transformConstants'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Select from '@xrengine/ui/src/primitives/tailwind/Select'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'
import { t } from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaRegDotCircle } from 'react-icons/fa'

const transformPivotOptions = [
  {
    label: t('editor:toolbar.transformPivot.lbl-selection'),
    description: t('editor:toolbar.transformPivot.info-selection'),
    value: TransformPivot.FirstSelected
  },
  {
    label: t('editor:toolbar.transformPivot.lbl-center'),
    description: t('editor:toolbar.transformPivot.info-center'),
    value: TransformPivot.Center
  },
  {
    label: t('editor:toolbar.transformPivot.lbl-bbox'),
    description: t('editor:toolbar.transformPivot.info-bbox'),
    value: TransformPivot.BoundingBox
  },
  {
    label: t('editor:toolbar.transformPivot.lbl-bbox-bottom'),
    description: t('editor:toolbar.transformPivot.info-bbox-bottom'),
    value: TransformPivot.BoundingBoxBottom
  },
  {
    label: t('editor:toolbar.transformPivot.lbl-origin'),
    description: t('editor:toolbar.transformPivot.info-origin'),
    value: TransformPivot.Origin
  }
]

const TransformPivotTool = () => {
  const { t } = useTranslation()

  const editorHelperState = useHookstate(getMutableState(EditorHelperState))

  return (
    <div className="flex items-center">
      <Tooltip content={t('editor:toolbar.transformPivot.toggleTransformPivot')}>
        <Button
          startIcon={<FaRegDotCircle className="text-theme-input" />}
          onClick={toggleTransformPivot}
          variant="transparent"
          className="px-0"
        />
      </Tooltip>
      <Tooltip
        content={
          transformPivotOptions.find((pivot) => pivot.value === editorHelperState.transformPivot.value)?.description
        }
        position="right center"
      >
        <Select
          key={editorHelperState.transformPivot.value}
          inputClassName="py-1 h-6 rounded-sm text-theme-gray3 text-xs"
          className="m-1 w-32 border-theme-input text-theme-gray3"
          onChange={setTransformPivot}
          options={transformPivotOptions}
          currentValue={editorHelperState.transformPivot.value}
        />
      </Tooltip>
    </div>
  )
}

export default TransformPivotTool
