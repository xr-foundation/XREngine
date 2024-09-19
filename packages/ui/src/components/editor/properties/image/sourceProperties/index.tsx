import React from 'react'
import { useTranslation } from 'react-i18next'
import { BackSide, DoubleSide, FrontSide } from 'three'

import { ImageAlphaMode, ImageProjection } from '@xrengine/engine/src/scene/classes/ImageUtils'
import { ImageComponent } from '@xrengine/engine/src/scene/components/ImageComponent'

import { useComponent } from '@xrengine/ecs'
import { EditorComponentType, commitProperty, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'
import SelectInput from '../../../input/Select'

const mapValue = (v) => ({ label: v, value: v })
const imageProjectionOptions = Object.values(ImageProjection).map(mapValue)
const imageTransparencyOptions = Object.values(ImageAlphaMode).map(mapValue)

const ImageProjectionSideOptions = [
  { label: 'Front', value: FrontSide },
  { label: 'Back', value: BackSide },
  { label: 'Both', value: DoubleSide }
]

export const ImageSourceProperties: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const imageComponent = useComponent(props.entity, ImageComponent)

  return (
    <>
      <InputGroup name="Transparency" label={t('editor:properties.image.lbl-transparency')}>
        <SelectInput
          key={props.entity}
          options={imageTransparencyOptions}
          value={imageComponent.alphaMode.value}
          onChange={commitProperty(ImageComponent, 'alphaMode')}
        />
      </InputGroup>

      {imageComponent.alphaMode.value === ImageAlphaMode.Mask && (
        <InputGroup
          name="Alpha Cutoff"
          label={t('editor:properties.image.lbl-alphaCutoff')}
          info={t('editor:properties.image.info-alphaCutoff')}
        >
          <NumericInput
            min={0}
            max={1}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={0.25}
            value={imageComponent.alphaCutoff.value}
            onChange={updateProperty(ImageComponent, 'alphaCutoff')}
            onRelease={commitProperty(ImageComponent, 'alphaCutoff')}
          />
        </InputGroup>
      )}

      <InputGroup name="Projection" label={t('editor:properties.image.lbl-projection')}>
        <SelectInput
          key={props.entity}
          options={imageProjectionOptions}
          value={imageComponent.projection.value}
          onChange={commitProperty(ImageComponent, 'projection')}
        />
      </InputGroup>
      <InputGroup name="Side" label={t('editor:properties.image.lbl-side')}>
        <SelectInput
          key={props.entity}
          options={ImageProjectionSideOptions}
          value={imageComponent.side.value}
          onChange={commitProperty(ImageComponent, 'side')}
        />
      </InputGroup>
    </>
  )
}

export default ImageSourceProperties
