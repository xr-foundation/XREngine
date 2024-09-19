

import { ColorResult } from '@uiw/color-convert'
import SketchPicker from '@uiw/react-color-sketch'
import React from 'react'
import { Color, ColorRepresentation } from 'three'

import { twMerge } from 'tailwind-merge'
import Text from '../Text'

interface ColorInputProp {
  value: ColorRepresentation
  onChange: (color: Color) => void
  onRelease?: (color: Color) => void
  disabled?: boolean
  isValueAsInteger?: boolean
  className?: string
  textClassName?: string
  sketchPickerClassName?: string
}

export function ColorInput({
  value,
  onChange,
  onRelease,
  disabled,
  className,
  textClassName,
  sketchPickerClassName
}: ColorInputProp) {
  const color = new Color(value)
  const hexColor = '#' + color.getHexString()

  const handleChange = (result: ColorResult) => {
    const color = new Color(result.hex)
    onChange(color)
  }
  return (
    <div
      className={twMerge(
        'relative flex h-9 items-center gap-1 rounded-lg border-none bg-[#1A1A1A] px-2 text-xs text-[#8B8B8D]',
        disabled && 'cursor-not-allowed',
        className
      )}
    >
      <div
        tabIndex={0}
        className={`group h-5 w-5 cursor-pointer rounded border border-black focus:border-theme-primary`}
        style={{ backgroundColor: hexColor }}
      >
        <SketchPicker
          className={twMerge(
            'absolute z-10 mt-5 scale-0 bg-theme-surface-main focus-within:scale-100 group-focus:scale-100',
            sketchPickerClassName
          )}
          color={hexColor}
          onChange={handleChange}
          disableAlpha={true}
          onPointerLeave={() => {
            onRelease && onRelease(color)
          }}
        />
      </div>
      <Text fontSize="xs" className={textClassName}>
        {hexColor.toUpperCase()}
      </Text>
    </div>
  )
}

ColorInput.defaultProps = {
  value: new Color(),
  onChange: () => {}
}

export default ColorInput
