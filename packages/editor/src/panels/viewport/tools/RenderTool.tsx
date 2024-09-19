import React from 'react'
import { useTranslation } from 'react-i18next'

import { ShadowMapResolutionOptions } from '@xrengine/client-core/src/user/components/UserMenu/menus/SettingMenu'
import { useMutableState } from '@xrengine/hyperflux'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'
import { RenderModes, RenderModesType } from '@xrengine/spatial/src/renderer/constants/RenderModes'
import BooleanInput from '@xrengine/ui/src/components/editor/input/Boolean'
import InputGroup from '@xrengine/ui/src/components/editor/input/Group'
import SelectInput from '@xrengine/ui/src/components/editor/input/Select'
import { Popup } from '@xrengine/ui/src/components/tailwind/Popup'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'
import { GiWireframeGlobe } from 'react-icons/gi'
import { RiArrowDownSLine } from 'react-icons/ri'
import { TbBallBowling, TbInnerShadowBottom, TbInnerShadowBottomFilled, TbShadow } from 'react-icons/tb'

const renderModes: { name: RenderModesType; icon: JSX.Element }[] = [
  {
    name: 'Unlit',
    icon: <TbInnerShadowBottom className="text-theme-input" />
  },
  {
    name: 'Lit',
    icon: <TbInnerShadowBottomFilled className="text-theme-input" />
  },
  { name: 'Normals', icon: <TbBallBowling className="text-theme-input" /> },
  {
    name: 'Wireframe',
    icon: <GiWireframeGlobe className="text-theme-input" />
  },
  {
    name: 'Shadows',
    icon: <TbShadow className="text-theme-input" />
  }
]

const RenderModeTool = () => {
  const { t } = useTranslation()

  const rendererState = useMutableState(RendererState)
  const options = [] as { label: string; value: string }[]

  for (let key of Object.keys(RenderModes)) {
    options.push({
      label: RenderModes[key],
      value: RenderModes[key]
    })
  }

  const handlePostProcessingChange = () => {
    rendererState.usePostProcessing.set(!rendererState.usePostProcessing.value)
    rendererState.automatic.set(false)
  }

  return (
    <div className="flex items-center gap-1">
      {renderModes.map((mode) => (
        <Tooltip key={mode.name} content={mode.name}>
          <Button
            startIcon={mode.icon}
            variant={rendererState.renderMode.value === mode.name ? 'outline' : 'transparent'}
            onClick={() => rendererState.renderMode.set(mode.name)}
            className="p-2"
          />
        </Tooltip>
      ))}
      <Popup keepInside trigger={<Button variant="transparent" className="p-2" startIcon={<RiArrowDownSLine />} />}>
        <div className="w-52 rounded-md bg-theme-primary p-2">
          <InputGroup
            name="Use Post Processing"
            label={t('editor:toolbar.render-settings.lbl-usePostProcessing')}
            info={t('editor:toolbar.render-settings.info-usePostProcessing')}
            containerClassName="justify-between"
            className="w-8"
          >
            <BooleanInput
              className="bg-gray-500 hover:border-0"
              value={rendererState.usePostProcessing.value}
              onChange={handlePostProcessingChange}
            />
          </InputGroup>
          <InputGroup
            name="Shadow Map Resolution"
            label={t('editor:toolbar.render-settings.lbl-shadowMapResolution')}
            info={t('editor:toolbar.render-settings.info-shadowMapResolution')}
            containerClassName="justify-between gap-2"
          >
            <SelectInput
              inputClassName="text-theme-gray3"
              className="border-theme-input text-theme-gray3"
              options={ShadowMapResolutionOptions as { value: string; label: string }[]}
              value={rendererState.shadowMapResolution.value}
              onChange={(resolution: number) => rendererState.shadowMapResolution.set(resolution)}
              disabled={rendererState.renderMode.value !== RenderModes.SHADOW}
            />
          </InputGroup>
        </div>
      </Popup>
    </div>
  )
}

export default RenderModeTool
