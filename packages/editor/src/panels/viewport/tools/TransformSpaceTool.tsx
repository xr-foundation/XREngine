
import { setTransformSpace, toggleTransformSpace } from '@xrengine/editor/src/functions/transformFunctions'
import { EditorHelperState } from '@xrengine/editor/src/services/EditorHelperState'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Select from '@xrengine/ui/src/primitives/tailwind/Select'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'
import { t } from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { PiGlobeSimple } from 'react-icons/pi'

const transformSpaceOptions = [
  {
    label: t('editor:toolbar.transformSpace.lbl-selection'),
    description: t('editor:toolbar.transformSpace.info-selection'),
    value: TransformSpace.local
  },
  {
    label: t('editor:toolbar.transformSpace.lbl-world'),
    description: t('editor:toolbar.transformSpace.info-world'),
    value: TransformSpace.world
  }
]

const TransformSpaceTool = () => {
  const { t } = useTranslation()

  const transformSpace = useHookstate(getMutableState(EditorHelperState).transformSpace)

  return (
    <div className="flex items-center">
      <Tooltip content={t('editor:toolbar.transformSpace.lbl-toggleTransformSpace')}>
        <Button
          startIcon={<PiGlobeSimple className="text-theme-input" />}
          onClick={toggleTransformSpace}
          variant="transparent"
          className="px-0"
        />
      </Tooltip>
      <Tooltip
        title={
          transformSpace.value === TransformSpace.local
            ? t('editor:toolbar.transformSpace.info-selection')
            : t('editor:toolbar.transformSpace.info-world')
        }
        content={t('editor:toolbar.transformSpace.description')}
        position="right center"
      >
        <Select
          key={transformSpace.value}
          inputClassName="py-1 h-6 rounded-sm text-theme-gray3 text-xs"
          className="m-1 w-24 border-theme-input text-theme-gray3"
          onChange={setTransformSpace}
          options={transformSpaceOptions}
          currentValue={transformSpace.value}
        />
      </Tooltip>
    </div>
  )
}

export default TransformSpaceTool
