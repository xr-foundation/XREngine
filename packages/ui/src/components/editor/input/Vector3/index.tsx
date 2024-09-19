import { useHookstate } from '@xrengine/hyperflux'
import { Vector3_Zero } from '@xrengine/spatial/src/common/constants/MathConstants'
import React from 'react'
import { LuLock, LuUnlock } from 'react-icons/lu'
import { twMerge } from 'tailwind-merge'
import { Vector3 } from 'three'
import Button from '../../../../primitives/tailwind/Button'
import Scrubber from '../../layout/Scrubber'
import NumericInput from '../Numeric'

interface Vector3ScrubberProps {
  axis?: 'x' | 'y' | 'z' | string
  value: number
  onChange: any
  onPointerUp?: any
  children?: any
  className?: string
}

export const Vector3Scrubber = ({ axis, onChange, onPointerUp, value, children, ...props }: Vector3ScrubberProps) => {
  const color = (() => {
    switch (axis) {
      case 'x':
        return 'red-500'
      case 'y':
        return 'green-400'
      case 'z':
        return 'blue-400'
      default:
        return 'inherit'
    }
  })()

  props.className = twMerge(`w-full text-${color}`)
  const content = children ?? `${axis?.toUpperCase()} - `
  return (
    <Scrubber onChange={onChange} onRelease={onPointerUp} value={value} {...props}>
      {content}
    </Scrubber>
  )
}

export const UniformButtonContainer: React.FC<{ children?: JSX.Element }> = ({ children }) => {
  return (
    <div className="flex w-6 items-center hover:text-[color:var(--blueHover)] [&>*:where(label)]:text-[color:var(--textColor)] [&>*:where(ul)]:w-full">
      {children}
    </div>
  )
}

interface Vector3InputProp {
  uniformScaling?: boolean
  smallStep?: number
  mediumStep?: number
  largeStep?: number
  value: Vector3
  hideLabels?: boolean
  onChange: (v: Vector3) => void
  onRelease?: (v: Vector3) => void
}

export const Vector3Input = ({
  uniformScaling,
  smallStep,
  mediumStep,
  largeStep,
  value,
  hideLabels,
  onChange,
  onRelease,
  ...rest
}: Vector3InputProp) => {
  const uniformEnabled = useHookstate(false)

  const onToggleUniform = () => {
    uniformEnabled.set((v) => !v)
  }

  const processChange = (field: string, fieldValue: number) => {
    if (uniformEnabled.value) {
      value.set(fieldValue, fieldValue, fieldValue)
    } else {
      value[field] = fieldValue
    }
  }

  const onChangeAxis = (axis: 'x' | 'y' | 'z') => (axisValue: number) => {
    processChange(axis, axisValue)
    onChange(value)
  }

  const onReleaseAxis = (axis: 'x' | 'y' | 'z') => (axisValue: number) => {
    processChange(axis, axisValue)
    onRelease?.(value)
  }

  const vx = value.x
  const vy = value.y
  const vz = value.z

  return (
    <div className="flex flex-row flex-wrap justify-end gap-1.5">
      {uniformScaling && (
        <Button
          variant="transparent"
          startIcon={uniformEnabled.value ? <LuLock /> : <LuUnlock />}
          onClick={onToggleUniform}
          className="p-0"
        />
      )}
      <NumericInput
        {...rest}
        value={vx}
        onChange={onChangeAxis('x')}
        onRelease={onReleaseAxis('x')}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} value={vx} onChange={onChangeAxis('x')} onPointerUp={onRelease} axis="x" />
          )
        }
      />
      <NumericInput
        {...rest}
        value={vy}
        onChange={onChangeAxis('y')}
        onRelease={onReleaseAxis('y')}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} value={vy} onChange={onChangeAxis('y')} onPointerUp={onRelease} axis="y" />
          )
        }
      />
      <NumericInput
        {...rest}
        value={vz}
        onChange={onChangeAxis('z')}
        onRelease={onReleaseAxis('z')}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} value={vz} onChange={onChangeAxis('z')} onPointerUp={onRelease} axis="z" />
          )
        }
      />
    </div>
  )
}

Vector3Input.defaultProps = {
  value: Vector3_Zero,
  hideLabels: false,
  onChange: () => {}
}

export default Vector3Input
