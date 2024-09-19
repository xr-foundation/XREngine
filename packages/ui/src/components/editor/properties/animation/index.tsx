
import { getOptionalComponent, useComponent, useOptionalComponent } from '@xrengine/ecs'
import {
  EditorComponentType,
  commitProperties,
  commitProperty,
  updateProperty
} from '@xrengine/editor/src/components/properties/Util'
import { AnimationComponent } from '@xrengine/engine/src/avatar/components/AnimationComponent'
import { LoopAnimationComponent } from '@xrengine/engine/src/avatar/components/LoopAnimationComponent'
import { getEntityErrors } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { useState } from '@xrengine/hyperflux'
import { getCallback } from '@xrengine/spatial/src/common/CallbackComponent'
import { FaStreetView } from 'react-icons/fa'

import { VRM } from '@pixiv/three-vrm'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SelectOptionsType } from '../../../../primitives/tailwind/Select'
import InputGroup from '../../input/Group'
import ModelInput from '../../input/Model'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import NodeEditor from '../nodeEditor'

export const LoopAnimationNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity

  const animationOptions = useState([] as { label: string; value: number }[])
  const loopAnimationComponent = useComponent(entity, LoopAnimationComponent)

  const modelComponent = useOptionalComponent(entity, ModelComponent)
  const animationComponent = useOptionalComponent(entity, AnimationComponent)

  const errors = getEntityErrors(props.entity, ModelComponent)

  useEffect(() => {
    const animationComponent = getOptionalComponent(entity, AnimationComponent)
    if (!animationComponent || !animationComponent.animations.length) return
    animationOptions.set([
      { label: 'None', value: -1 },
      ...animationComponent.animations.map((clip, index) => ({ label: clip.name, value: index }))
    ])
  }, [modelComponent?.asset, modelComponent?.convertToVRM, animationComponent?.animations])

  const onChangePlayingAnimation = (index) => {
    commitProperties(LoopAnimationComponent, {
      activeClipIndex: index
    })
    getCallback(props.entity, 'xre.play')!()
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.loopAnimation.title')}
      description={t('editor:properties.loopAnimation.description')}
      icon={<LoopAnimationNodeEditor.iconComponent />}
    >
      {/*<ProgressBar value={5} paused={false} totalTime={100} />*/}
      <InputGroup name="Loop Animation" label={t('editor:properties.loopAnimation.lbl-loopAnimation')}>
        <SelectInput
          key={props.entity}
          options={animationOptions.value as SelectOptionsType[]}
          value={loopAnimationComponent.value.activeClipIndex}
          onChange={onChangePlayingAnimation}
        />
      </InputGroup>
      {modelComponent?.asset.value instanceof VRM && (
        <InputGroup name="Animation Pack" label={t('editor:properties.loopAnimation.lbl-animationPack')}>
          <ModelInput
            value={loopAnimationComponent.animationPack.value}
            onRelease={commitProperty(LoopAnimationComponent, 'animationPack')}
          />
          {errors?.LOADING_ERROR && (
            <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.model.error-url')}</div>
          )}
        </InputGroup>
      )}
      <InputGroup name="Time Scale" label={t('editor:properties.loopAnimation.lbl-timeScale')}>
        <NumericInput
          value={loopAnimationComponent.timeScale.value}
          onChange={updateProperty(LoopAnimationComponent, 'timeScale')}
          onRelease={commitProperty(LoopAnimationComponent, 'timeScale')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

LoopAnimationNodeEditor.iconComponent = FaStreetView

export default LoopAnimationNodeEditor
