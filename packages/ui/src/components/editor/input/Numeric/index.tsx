
import React from 'react'

import { clamp } from '@xrengine/spatial/src/common/functions/MathLerpFunctions'

import { getStepSize } from '@xrengine/editor/src/functions/utils'
import { toPrecision } from '@xrengine/engine/src/assets/functions/miscUtils'
import { useHookstate } from '@xrengine/hyperflux'
import { twMerge } from 'tailwind-merge'
import Text from '../../../../primitives/tailwind/Text'

function toPrecisionString(value: number, precision?: number) {
  if (precision && precision <= 1) {
    const numDigits = Math.abs(Math.log10(precision))
    const minimumFractionDigits = Math.min(numDigits, 2)
    const maximumFractionDigits = Math.max(minimumFractionDigits, numDigits)

    return value.toLocaleString('fullwide', {
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping: false
    })
  }
  return value.toLocaleString('fullwide', { useGrouping: false })
}

export interface NumericInputProp extends Omit<React.HTMLAttributes<HTMLInputElement>, 'onChange' | 'prefix'> {
  value: number
  onChange: (value: number) => void
  onRelease?: (value: number) => void
  className?: string
  inputClassName?: string
  unit?: string
  prefix?: React.ReactNode
  displayPrecision?: number
  precision?: number
  mediumStep?: number
  smallStep?: number
  largeStep?: number
  min?: number
  max?: number
}

const NumericInput = ({
  className,
  inputClassName,
  unit,
  prefix,
  displayPrecision,
  value,
  precision,
  mediumStep,
  onChange,
  onRelease,
  smallStep,
  largeStep,
  min,
  max,
  ...rest
}: NumericInputProp) => {
  const tempValue = useHookstate(0)
  const focused = useHookstate(false)

  const handleStep = (event: React.KeyboardEvent<HTMLInputElement>, direction: number, focus = true) => {
    const stepSize = event ? getStepSize(event, smallStep, mediumStep, largeStep) : mediumStep

    const nextValue = value + stepSize * direction
    const clampedValue = min != null && max != null ? clamp(nextValue, min, max) : nextValue
    const roundedValue = precision ? toPrecision(clampedValue, precision) : nextValue

    if (onChange) {
      onChange(roundedValue)
    }

    tempValue.set(
      Number(
        roundedValue.toLocaleString('fullwide', {
          useGrouping: false,
          minimumFractionDigits: 0,
          maximumFractionDigits: Math.abs(Math.log10(precision || 0)) + 1
        })
      )
    )
    focused.set(focus)
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    let direction: number
    if (event.key === 'ArrowUp') {
      direction = 1
    } else if (event.key === 'ArrowDown') {
      direction = -1
    } else {
      return
    }

    event.preventDefault()
    handleStep(event, direction)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value

    tempValue.set(newValue as any)
    focused.set(true)

    const parsedValue = parseFloat(newValue)

    if (!Number.isNaN(parsedValue)) {
      const clampedValue = min != null && max != null ? clamp(parsedValue, min, max) : parsedValue
      const roundedValue = precision ? toPrecision(clampedValue, precision) : clampedValue
      onChange?.(roundedValue)
    }
  }

  const handleFocus = () => {
    tempValue.set(
      Number(
        value.toLocaleString('fullwide', {
          useGrouping: false,
          minimumFractionDigits: 0,
          maximumFractionDigits: Math.abs(Math.log10(precision || 0)) + 1
        })
      )
    )
    focused.set(true)
  }

  const handleBlur = () => {
    if (!focused.value) return
    focused.set(false)

    if (onRelease) {
      onRelease(Number(tempValue.value!))
    }
  }

  return (
    <div
      className={twMerge(
        prefix ? 'w-24 px-2 py-2' : 'w-full px-5 py-2',
        'flex h-10 items-center justify-between rounded-lg bg-[#1A1A1A]',
        className
      )}
    >
      {prefix}
      <input
        className={twMerge(
          'w-full bg-inherit text-xs font-normal leading-normal text-[#8B8B8D] focus:outline-none',
          inputClassName
        )}
        value={focused.value ? tempValue.value : toPrecisionString(value, displayPrecision)}
        onKeyDown={handleKeyPress}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        type="number"
        {...rest}
      />
      {unit && (
        <Text fontSize="xs" className="text-right text-[#8B8B8D]">
          {unit}
        </Text>
      )}
    </div>
  )
}

NumericInput.defaultProps = {
  value: 0,
  smallStep: 0.025,
  mediumStep: 0.1,
  largeStep: 0.25,
  min: -Infinity,
  max: Infinity,
  displayPrecision: 0.001,
  precision: Number.EPSILON
}

export default NumericInput
