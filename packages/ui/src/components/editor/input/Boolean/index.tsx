import React from 'react'
import { twMerge } from 'tailwind-merge'
import Checkbox from '../../../../primitives/tailwind/Checkbox'

export interface BooleanInputProp {
  value: boolean
  onChange: (value: boolean) => void
  onRelease?: (value: boolean) => void
  disabled?: boolean
  className?: string
}

export const BooleanInput = (props: BooleanInputProp) => {
  const onBlur = () => {
    if (props.onRelease) props.onRelease(props.value)
  }

  return (
    <Checkbox
      className={twMerge(
        'rounded-sm border border-theme-input bg-black dark:bg-[#1A1A1A]',
        'hover:border-blue-800 hover:bg-theme-highlight',
        props.disabled ? 'cursor-[initial] opacity-80 grayscale-[0.8]' : 'cursor-pointer',
        props.className
      )}
      onBlur={onBlur}
      {...props}
    />
  )
}

export default BooleanInput
