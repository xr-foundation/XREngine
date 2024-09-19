import React from 'react'
import { twMerge } from 'tailwind-merge'

import Label from '../Label'

export interface ToggleProps {
  value: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
  labelClassName?: string
  containerClassName?: string
  className?: string
  onChange: (value: boolean) => void
  disabled?: boolean
}

const sizeMap = {
  sm: 'w-8 h-5 after:w-4 after:h-4 after:top-[2px] after:start-[2px]',
  md: 'w-11 h-6 after:w-5 after:h-5 after:top-[2px] after:start-[2px]',
  lg: 'w-16 h-9 after:w-7 after:h-7 after:top-[4px] after:start-[5px]'
}

const Toggle = ({
  containerClassName,
  className,
  labelClassName,
  size,
  label,
  value,
  onChange,
  disabled
}: ToggleProps) => {
  const twClassName = twMerge(
    "peer relative cursor-pointer rounded-full bg-gray-200 after:absolute after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']",
    'peer-checked:bg-blue-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:bg-blue-primary peer-focus:ring-4 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:bg-blue-primary',
    'peer-disabled:pointer-events-none peer-disabled:opacity-50',
    className,
    sizeMap[size ?? 'md']
  )
  const containerTwClassName = twMerge('flex items-center gap-4', containerClassName)

  return (
    <div className={containerTwClassName}>
      <input
        disabled={disabled}
        type="checkbox"
        className="peer sr-only"
        checked={value}
        onChange={() => onChange(!value)}
      />
      <div className={twClassName} onClick={() => onChange(!value)} />
      {label && <Label className={labelClassName}>{label}</Label>}
    </div>
  )
}

export default Toggle
