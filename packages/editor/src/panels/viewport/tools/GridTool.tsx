
import { useMutableState } from '@xrengine/hyperflux'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'
import NumericInput from '@xrengine/ui/src/components/editor/input/Numeric'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MdBorderClear } from 'react-icons/md'

const GridTool = () => {
  const { t } = useTranslation()

  const rendererState = useMutableState(RendererState)

  const onToggleGridVisible = () => {
    rendererState.gridVisibility.set(!rendererState.gridVisibility.value)
  }

  useEffect(() => {
    if (!rendererState.gridVisibility.value) {
      rendererState.gridVisibility.set(true)
    }
  }, [])

  return (
    <div className="flex items-center">
      <Tooltip content={t('editor:toolbar.grid.info-toggleGridVisibility')}>
        <Button
          startIcon={<MdBorderClear className="text-theme-input" />}
          onClick={onToggleGridVisible}
          variant={rendererState.gridVisibility.value ? 'outline' : 'transparent'}
          className="px-0"
        />
      </Tooltip>
      <Tooltip content={t('editor:toolbar.grid.info-gridHeight')}>
        <NumericInput
          value={rendererState.gridHeight.value}
          onChange={(value) => rendererState.gridHeight.set(value)}
          className="h-6 w-16 rounded-sm border-theme-input bg-transparent px-2 py-1"
          inputClassName="text-theme-gray3"
          precision={0.01}
          smallStep={0.5}
          mediumStep={1}
          largeStep={5}
          min={0.0}
          unit="m"
        />
      </Tooltip>
    </div>
  )
}

export default GridTool
