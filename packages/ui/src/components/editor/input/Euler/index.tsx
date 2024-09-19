
import { useHookstate } from '@xrengine/hyperflux'
import { Q_IDENTITY } from '@xrengine/spatial/src/common/constants/MathConstants'
import React, { useEffect } from 'react'
import { Euler, Quaternion, MathUtils as _Math } from 'three'
import NumericInput from '../Numeric'
import { Vector3Scrubber } from '../Vector3'

const { RAD2DEG, DEG2RAD } = _Math
/**
 * Type aliase created EulerInputProps.
 *
 * @type {Object}
 */
type EulerInputProps = {
  quaternion: Quaternion
  onChange?: (quat: Quaternion) => any
  onRelease?: (euler: Euler) => void
  unit?: string
}

const tempEuler = new Euler() // we need the persistance, the hookstate doesnt register the dynamically allocated euler and quat value otherwise, thus we cannot assign new variable to the same
const tempQuat = new Quaternion()
export const EulerInput = (props: EulerInputProps) => {
  const quaternion = useHookstate(props.quaternion)
  const euler = useHookstate(tempEuler.setFromQuaternion(props.quaternion, 'YXZ'))

  useEffect(() => {
    euler.set(tempEuler.setFromQuaternion(quaternion.value, 'YXZ'))
  }, [props.quaternion])

  const onSetEuler = (component: keyof typeof euler) => (value: number) => {
    const radVal = value * DEG2RAD
    euler[component].value !== radVal &&
      (euler[component].set(radVal),
      quaternion.set(tempQuat.setFromEuler(euler.value)),
      props.onChange?.(quaternion.value))
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <NumericInput
        value={euler.value.x * RAD2DEG}
        onChange={onSetEuler('x')}
        onRelease={() => props.onRelease?.(euler.value)}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            value={euler.value.x * RAD2DEG}
            onChange={onSetEuler('x')}
            axis="x"
            onPointerUp={() => props.onRelease?.(euler.value)}
          />
        }
      />
      <NumericInput
        value={euler.value.y * RAD2DEG}
        onChange={onSetEuler('y')}
        onRelease={() => props.onRelease?.(euler.value)}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            value={euler.value.y * RAD2DEG}
            onChange={onSetEuler('y')}
            axis="y"
            onPointerUp={() => props.onRelease?.(euler.value)}
          />
        }
      />
      <NumericInput
        value={euler.value.z * RAD2DEG}
        onChange={onSetEuler('z')}
        onRelease={() => props.onRelease?.(euler.value)}
        unit={props.unit}
        prefix={
          <Vector3Scrubber
            value={euler.value.z * RAD2DEG}
            onChange={onSetEuler('z')}
            axis="z"
            onPointerUp={() => props.onRelease?.(euler.value)}
          />
        }
      />
    </div>
  )
}

EulerInput.defaultProps = {
  quaternion: Q_IDENTITY
}
export default EulerInput
