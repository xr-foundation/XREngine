
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineVideoCamera } from 'react-icons/hi2'

import { useComponent, useOptionalComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import { ItemTypes } from '@xrengine/editor/src/constants/AssetTypes'
import { MediaComponent, MediaElementComponent, setTime } from '@xrengine/engine/src/scene/components/MediaComponent'
import { PlayMode } from '@xrengine/engine/src/scene/constants/PlayMode'
import Button from '../../../../primitives/tailwind/Button'
import Slider from '../../../../primitives/tailwind/Slider'
import ArrayInputGroup from '../../input/Array'
import BooleanInput from '../../input/Boolean'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import NodeEditor from '../nodeEditor'

const PlayModeOptions = [
  {
    label: 'Single',
    value: PlayMode.single
  },
  {
    label: 'Random',
    value: PlayMode.random
  },
  {
    label: 'Loop',
    value: PlayMode.loop
  },
  {
    label: 'SingleLoop',
    value: PlayMode.singleloop
  }
]

/**
 * MediaNodeEditor used to render editor view for property customization.
 */
export const MediaNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const media = useComponent(props.entity, MediaComponent)
  const element = useOptionalComponent(props.entity, MediaElementComponent)

  const toggle = () => {
    media.paused.set(!media.paused.value)
  }

  const reset = () => {
    if (element) {
      setTime(element.element, media.seekTime.value)
    }
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.media.name')}
      description={t('editor:properties.media.description')}
      icon={<MediaNodeEditor.iconComponent />}
    >
      <InputGroup name="Volume" label={t('editor:properties.media.lbl-volume')} className="w-auto">
        <Slider
          min={0}
          max={100}
          step={1}
          value={media.volume.value}
          onChange={updateProperty(MediaComponent, 'volume')}
          onRelease={commitProperty(MediaComponent, 'volume')}
        />
      </InputGroup>

      <InputGroup name="Start Time" label={t('editor:properties.media.seektime')}>
        <NumericInput
          value={media.seekTime.value}
          onChange={updateProperty(MediaComponent, 'seekTime')}
          onRelease={commitProperty(MediaComponent, 'seekTime')}
        />
      </InputGroup>

      <InputGroup name="Is Music" label={t('editor:properties.media.lbl-isMusic')}>
        <BooleanInput value={media.isMusic.value} onChange={commitProperty(MediaComponent, 'isMusic')} />
      </InputGroup>

      <InputGroup
        name="Controls"
        label={t('editor:properties.media.lbl-controls')}
        info={t('editor:properties.media.info-controls')}
      >
        <BooleanInput value={media.controls.value} onChange={commitProperty(MediaComponent, 'controls')} />
      </InputGroup>

      <InputGroup
        name="Auto Play"
        label={t('editor:properties.media.lbl-autoplay')}
        info={t('editor:properties.media.info-autoplay')}
      >
        <BooleanInput value={media.autoplay.value} onChange={commitProperty(MediaComponent, 'autoplay')} />
      </InputGroup>

      <InputGroup
        name="Synchronize"
        label={t('editor:properties.media.lbl-synchronize')}
        info={t('editor:properties.media.info-synchronize')}
      >
        <BooleanInput value={media.synchronize.value} onChange={commitProperty(MediaComponent, 'synchronize')} />
      </InputGroup>

      <ArrayInputGroup
        label={t('editor:properties.media.paths')}
        inputLabel={t('editor:properties.media.path')}
        values={media.resources.value as string[]}
        dropTypes={[...ItemTypes.Audios, ...ItemTypes.Videos]}
        onChange={commitProperty(MediaComponent, 'resources')}
      />

      <InputGroup name="Play Mode" label={t('editor:properties.media.playmode')}>
        <SelectInput
          key={props.entity}
          options={PlayModeOptions}
          value={media.playMode.value}
          onChange={commitProperty(MediaComponent, 'playMode')}
        />
      </InputGroup>
      {media.resources.length > 0 && (
        <InputGroup
          name="media-controls"
          label={t('editor:properties.media.lbl-mediaControls')}
          className="flex flex-row gap-2"
        >
          <Button variant="outline" onClick={toggle}>
            {media.paused.value ? t('editor:properties.media.playtitle') : t('editor:properties.media.pausetitle')}
          </Button>
          <Button variant="outline" onClick={reset}>
            {t('editor:properties.media.resettitle')}
          </Button>
        </InputGroup>
      )}
    </NodeEditor>
  )
}

MediaNodeEditor.iconComponent = HiOutlineVideoCamera

export default MediaNodeEditor
