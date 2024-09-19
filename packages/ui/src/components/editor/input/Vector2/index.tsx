
import { useHookstate } from '@xrengine/hyperflux'
import React from 'react'
import { Vector2 } from 'three'

import { Vector2_Zero } from '@xrengine/spatial/src/common/constants/MathConstants'
import NumericInput from '../Numeric'
import { Vector3Scrubber } from '../Vector3'

interface Vector2InputProp {
  uniformScaling?: boolean
  smallStep?: number
  mediumStep?: number
  largeStep?: number
  value: Vector2
  hideLabels?: boolean
  onChange: (v: Vector2) => void
  onRelease?: (v: Vector2) => void
  min?: number
  max?: number
}

export const Vector2Input = ({
  uniformScaling,
  smallStep,
  mediumStep,
  largeStep,
  value,
  hideLabels,
  onChange,
  onRelease,
  min,
  max,
  ...rest
}: Vector2InputProp) => {
  const uniformEnabled = useHookstate(uniformScaling)

  const processChange = (field: string, fieldValue: number) => {
    if (uniformEnabled.value) {
      value.set(fieldValue, fieldValue)
    } else {
      let clampedValue = fieldValue
      if (min !== undefined) {
        clampedValue = Math.max(min, clampedValue)
      }
      if (max !== undefined) {
        clampedValue = Math.min(max, clampedValue)
      }
      value[field] = clampedValue
    }
  }

  const onChangeX = (x: number) => {
    processChange('x', x)
    onChange(value)
  }

  const onChangeY = (y: number) => {
    processChange('y', y)
    onChange(value)
  }

  const onReleaseX = (x: number) => {
    processChange('x', x)
    onRelease?.(value)
  }

  const onReleaseY = (y: number) => {
    processChange('y', y)
    onRelease?.(value)
  }

  const vx = value.x
  const vy = value.y

  return (
    <div className="flex flex-row justify-end gap-1.5">
      <NumericInput
        {...rest}
        value={vx}
        onChange={onChangeX}
        onRelease={onReleaseX}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} value={vx} onChange={onChangeX} onPointerUp={onRelease} axis="x" />
          )
        }
      />
      <NumericInput
        {...rest}
        value={vy}
        onChange={onChangeY}
        onRelease={onReleaseY}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} value={vy} onChange={onChangeY} onPointerUp={onRelease} axis="y" />
          )
        }
      />
    </div>
  )
}

Vector2Input.defaultProps = {
  value: Vector2_Zero,
  hideLabels: false,
  onChange: () => {}
}

export default Vector2Input
