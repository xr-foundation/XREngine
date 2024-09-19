import { useComponent } from '@xrengine/ecs'
import { EditorComponentType, commitProperty, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import { TextComponent } from '@xrengine/engine/src/scene/components/TextComponent'
import { FaStreetView } from 'react-icons/fa'

import React from 'react'
import { useTranslation } from 'react-i18next'
import ColorInput from '../../../../../primitives/tailwind/Color'
import Text from '../../../../../primitives/tailwind/Text'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'
import StringInput, { ControlledStringInput } from '../../../input/String'
import NodeEditor from '../../nodeEditor'

const PaddingNumericInput = ({
  value,
  onChange,
  borderStyles
}: {
  value: number
  onChange: (value: number) => void
  borderStyles: Record<string, string>
}) => {
  return (
    <div className="flex h-8 items-center justify-between rounded bg-[#1A1A1A] p-2">
      <div
        className="relative mr-2 min-h-3.5 min-w-3.5"
        style={{
          borderTop: '1px dotted #8B8B8D',
          borderLeft: '1px dotted #8B8B8D',
          borderBottom: '1px dotted #8B8B8D',
          borderRight: '1px dotted #8B8B8D',
          ...borderStyles
        }}
      />
      <input
        className="mr-1 max-w-7 bg-inherit text-xs text-[#8B8B8D] focus:outline-none"
        value={value.toFixed(2)}
        onChange={(event) => onChange(parseFloat(event.target.value))}
      />
      <Text fontSize="xs" className="text-right text-[#444444]">
        {'rem'}
      </Text>
    </div>
  )
}

export const TextBoxEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const text = useComponent(props.entity, TextComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.textBox.name')}
      description={t('editor:properties.textBox.description')}
    >
      <InputGroup name="Text" label={t('editor:properties.textBox.lbl-text')}>
        <ControlledStringInput
          containerClassName="w-56"
          value={text.text.value}
          onChange={updateProperty(TextComponent, 'text')}
          onRelease={commitProperty(TextComponent, 'text')}
        />
      </InputGroup>
      <InputGroup name="Family" label={t('editor:properties.textBox.lbl-family')} info="">
        <StringInput />
      </InputGroup>
      <InputGroup name="Size" label={t('editor:properties.textBox.lbl-size')}>
        <NumericInput value={0.2} displayPrecision={2} onChange={() => {}} unit="em" />
      </InputGroup>
      <InputGroup containerClassName="mt-5" name="Font Stroke" label={t('editor:properties.textBox.lbl-fontStroke')}>
        <NumericInput value={5.2} displayPrecision={2} onChange={() => {}} unit="px" />
      </InputGroup>
      <InputGroup name="Font Color" label={t('editor:properties.textBox.lbl-fontColor')}>
        <ColorInput />
      </InputGroup>
      <InputGroup
        containerClassName="mt-5"
        name="Corner Radius"
        label={t('editor:properties.textBox.lbl-cornerRadius')}
      >
        <NumericInput value={5.2} displayPrecision={2} onChange={() => {}} unit="rem" />
      </InputGroup>
      <InputGroup name="Background Color" label={t('editor:properties.textBox.lbl-backgroundColor')}>
        <ColorInput />
      </InputGroup>
      <InputGroup name="Opacity" label={t('editor:properties.textBox.lbl-opacity')}>
        <NumericInput value={100.0} displayPrecision={2} onChange={() => {}} unit="pc" />
      </InputGroup>
      <InputGroup name="Padding" label={t('editor:properties.textBox.lbl-padding')}>
        <div>
          <div className="mb-1 flex items-center gap-1">
            <div className="w-24">
              <PaddingNumericInput value={3.0} onChange={() => {}} borderStyles={{ borderTop: '1px solid white' }} />
            </div>
            <div className="w-24">
              <PaddingNumericInput value={3.0} onChange={() => {}} borderStyles={{ borderBottom: '1px solid white' }} />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-24">
              <PaddingNumericInput value={2.0} onChange={() => {}} borderStyles={{ borderLeft: '1px solid white' }} />
            </div>
            <div className="w-24">
              <PaddingNumericInput value={2.0} onChange={() => {}} borderStyles={{ borderRight: '1px solid white' }} />
            </div>
          </div>
        </div>
      </InputGroup>
    </NodeEditor>
  )
}

TextBoxEditor.iconComponent = FaStreetView

export default TextBoxEditor
