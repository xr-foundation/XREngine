
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import { DistanceModel, DistanceModelOptions } from '@xrengine/engine/src/audio/constants/AudioConstants'
import { MediaSettingsComponent } from '@xrengine/engine/src/scene/components/MediaSettingsComponent'
import { MdPermMedia } from 'react-icons/md'
import Slider from '../../../../../primitives/tailwind/Slider'
import BooleanInput from '../../../input/Boolean'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'
import SelectInput from '../../../input/Select'
import PropertyGroup from '../../group'

export const MediaSettingsEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const mediaState = useComponent(props.entity, MediaSettingsComponent)

  return (
    <PropertyGroup
      name={t('editor:properties.mediaSettings.name')}
      description={t('editor:properties.mediaSettings.description')}
      icon={<MediaSettingsEditor.iconComponent />}
    >
      <InputGroup
        name="Media Distance Model"
        label={t('editor:properties.mediaSettings.lbl-mediaDistanceModel')}
        info={t('editor:properties.mediaSettings.info-mediaDistanceModel')}
      >
        <SelectInput
          options={DistanceModelOptions}
          value={mediaState.distanceModel.value}
          onChange={commitProperty(MediaSettingsComponent, 'distanceModel')}
        />
      </InputGroup>
      <InputGroup
        name="Use Immersive Media"
        label={t('editor:properties.mediaSettings.lbl-immersiveMedia')}
        info={t('editor:properties.mediaSettings.info-immersiveMedia')}
      >
        <BooleanInput
          value={mediaState.immersiveMedia.value}
          onChange={commitProperty(MediaSettingsComponent, 'immersiveMedia')}
        />
      </InputGroup>

      {mediaState.distanceModel.value === DistanceModel.Linear ? (
        <InputGroup
          name="Media Rolloff Factor"
          label={t('editor:properties.mediaSettings.lbl-mediaRolloffFactor')}
          info={t('editor:properties.mediaSettings.info-mediaRolloffFactor')}
          className="w-auto"
        >
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={mediaState.rolloffFactor.value}
            onChange={updateProperty(MediaSettingsComponent, 'rolloffFactor')}
            onRelease={commitProperty(MediaSettingsComponent, 'rolloffFactor')}
          />
        </InputGroup>
      ) : (
        <InputGroup
          name="Media Rolloff Factor"
          label={t('editor:properties.mediaSettings.lbl-mediaRolloffFactor')}
          info={t('editor:properties.mediaSettings.info-mediaRolloffFactorInfinity')}
        >
          <NumericInput
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={mediaState.rolloffFactor.value}
            onChange={updateProperty(MediaSettingsComponent, 'rolloffFactor')}
            onRelease={commitProperty(MediaSettingsComponent, 'rolloffFactor')}
          />
        </InputGroup>
      )}
      <InputGroup
        name="Media Ref Distance"
        label={t('editor:properties.mediaSettings.lbl-mediaRefDistance')}
        info={t('editor:properties.mediaSettings.info-mediaRefDistance')}
      >
        <NumericInput
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={mediaState.refDistance.value}
          onChange={updateProperty(MediaSettingsComponent, 'refDistance')}
          onRelease={commitProperty(MediaSettingsComponent, 'refDistance')}
          unit="m"
        />
      </InputGroup>
      <InputGroup
        name="Media Max Distance"
        label={t('editor:properties.mediaSettings.lbl-mediaMaxDistance')}
        info={t('editor:properties.mediaSettings.info-mediaMaxDistance')}
      >
        <NumericInput
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={mediaState.maxDistance.value}
          onChange={updateProperty(MediaSettingsComponent, 'maxDistance')}
          onRelease={commitProperty(MediaSettingsComponent, 'maxDistance')}
          unit="m"
        />
      </InputGroup>
      <InputGroup
        name="Media Cone Inner Angle"
        label={t('editor:properties.mediaSettings.lbl-mediaConeInnerAngle')}
        info={t('editor:properties.mediaSettings.info-mediaConeInnerAngle')}
      >
        <NumericInput
          min={0}
          max={360}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={mediaState.coneInnerAngle.value}
          onChange={updateProperty(MediaSettingsComponent, 'coneInnerAngle')}
          onRelease={commitProperty(MediaSettingsComponent, 'coneInnerAngle')}
          unit="°"
        />
      </InputGroup>
      <InputGroup
        name="Media Cone Outer Angle"
        label={t('editor:properties.mediaSettings.lbl-mediaConeOuterAngle')}
        info={t('editor:properties.mediaSettings.info-mediaConeOuterAngle')}
      >
        <NumericInput
          min={0}
          max={360}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={mediaState.coneOuterAngle.value}
          onChange={updateProperty(MediaSettingsComponent, 'coneOuterAngle')}
          onRelease={commitProperty(MediaSettingsComponent, 'coneOuterAngle')}
          unit="°"
        />
      </InputGroup>
      <InputGroup
        name="Media Cone Outer Gain"
        label={t('editor:properties.mediaSettings.lbl-mediaConeOuterGain')}
        info={t('editor:properties.mediaSettings.info-mediaConeOuterGain')}
        className="w-auto"
      >
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={mediaState.coneOuterGain.value}
          onChange={updateProperty(MediaSettingsComponent, 'coneOuterGain')}
          onRelease={commitProperty(MediaSettingsComponent, 'coneOuterGain')}
        />
      </InputGroup>
    </PropertyGroup>
  )
}

MediaSettingsEditor.iconComponent = MdPermMedia
export default MediaSettingsEditor
