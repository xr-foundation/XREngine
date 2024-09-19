import React from 'react'
import { HiCheck } from 'react-icons/hi'

import { twMerge } from 'tailwind-merge'
import { v4 as uuidv4 } from 'uuid'

import Label from '../Label'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: boolean
  label?: React.ReactNode
  className?: string
  containerClassName?: string
  onChange: (value: boolean) => void
  disabled?: boolean
}

const Checkbox = ({ className, containerClassName, label, value, onChange, disabled }: CheckboxProps) => {
  const handleChange = () => {
    if (!disabled) {
      onChange(!value)
    }
  }

  const id = uuidv4()

  return (
    <div className={twMerge('relative flex cursor-pointer items-end', containerClassName)}>
      <input
        type="checkbox"
        checked={value}
        onChange={handleChange}
        id={id}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleChange()
          }
        }}
        className={twMerge(
          'peer relative appearance-none',
          'grid h-4 w-4 place-items-center rounded border border-theme-primary focus:border-2 focus:border-theme-focus focus:outline-none',
          value ? 'bg-blue-primary' : 'bg-theme-surfaceInput',
          disabled ? 'cursor-not-allowed opacity-50' : '',
          className
        )}
      />
      <HiCheck onClick={handleChange} className="absolute m-0.5 hidden h-3 w-3 text-white peer-checked:block" />

      {label && (
        <Label className="ml-2 cursor-pointer self-stretch leading-[1.15]" htmlFor={id}>
          {label}
        </Label>
      )}
    </div>
  )
}
export default Checkbox
