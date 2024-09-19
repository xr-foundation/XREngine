
import React from 'react'
import { useTranslation } from 'react-i18next'

import { getEntityErrors } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { ImageComponent } from '@xrengine/engine/src/scene/components/ImageComponent'

import { useComponent } from '@xrengine/ecs'
import { EditorComponentType, commitProperty } from '@xrengine/editor/src/components/properties/Util'
import { LuImage } from 'react-icons/lu'
import InputGroup from '../../input/Group'
import ImageInput from '../../input/Image'
import NodeEditor from '../nodeEditor'
import ImageSourceProperties from './sourceProperties'

export const ImageNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
  const imageComponent = useComponent(entity, ImageComponent)
  const errors = getEntityErrors(props.entity, ImageComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.image.name')}
      description={t('editor:properties.image.description')}
      icon={<ImageNodeEditor.iconComponent />}
    >
      <InputGroup
        name="Image Url"
        label={t('editor:properties.image.lbl-imgURL')}
        labelClassName="text-nowrap text-[#A0A1A2]"
      >
        <ImageInput
          value={imageComponent.source.value}
          onRelease={commitProperty(ImageComponent, 'source')}
          containerClassName="rounded-lg text-xs text-[#8B8B8D]"
          className="h-10 rounded-md bg-[#1A1A1A] text-xs text-[#8B8B8D]"
        />
      </InputGroup>
      {errors ? (
        Object.entries(errors).map(([err, message]) => (
          <div key={err} style={{ marginTop: 2, color: '#FF8C00' }}>
            {'Error: ' + err + '--' + message}
          </div>
        ))
      ) : (
        <></>
      )}
      {<ImageSourceProperties entity={props.entity} multiEdit={props.multiEdit} />}
      {/*<ScreenshareTargetNodeEditor entity={props.entity} multiEdit={props.multiEdit} />*/}
    </NodeEditor>
  )
}

ImageNodeEditor.iconComponent = LuImage

export default ImageNodeEditor
