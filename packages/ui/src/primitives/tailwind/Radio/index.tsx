
import React, { useId } from 'react'
import { twMerge } from 'tailwind-merge'

export interface RadioProps {
  disabled?: boolean
  label: string
  name?: string
  onChange?: (event: React.FormEvent<HTMLInputElement>) => void
  value?: string
  defaultChecked?: boolean
  description?: string
}

const RadioRoot = ({ disabled, label, name, onChange, value, description, defaultChecked }: RadioProps) => {
  const radioId = useId()
  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-2">
        <div className="mt-1 grid place-items-center">
          <input
            id={radioId}
            type="radio"
            name={name}
            disabled={disabled}
            className="
            focus:ring-primary-blue
            peer col-start-1
            row-start-1 h-4
            w-4 shrink-0 appearance-none rounded-full border-[1.5px]
            border-blue-500 focus:outline-none focus:ring-[0.5px] focus:ring-offset-0
            disabled:border-gray-400
          "
            onChange={onChange}
            defaultChecked={defaultChecked}
            value={value}
          />
          <div
            className={twMerge(
              'pointer-events-none',
              'col-start-1 row-start-1',
              'h-2 w-2 rounded-full peer-checked:bg-blue-500',
              'peer-checked:peer-disabled:bg-gray-400'
            )}
          />
        </div>
        <label htmlFor={radioId} className={twMerge('text-start hover:cursor-pointer', disabled && 'text-gray-400')}>
          {label}
        </label>
      </div>
      {description && <div className="ml-6 text-sm text-gray-400">{description}</div>}
    </div>
  )
}

type OptionType = {
  value: string
  label: string
  description?: string
}
export interface RadioGroupProps<T> {
  value?: T
  disabled?: boolean
  name?: string
  onChange: (value: T) => void
  options: OptionType[]
  horizontal?: boolean
  className?: string
}

type OptionValueType = string | number

const Radio = <T extends OptionValueType>({
  disabled,
  name,
  onChange,
  options,
  horizontal,
  className,
  value
}: RadioGroupProps<T>) => {
  const handleChange = (event: React.FormEvent<HTMLInputElement>) => onChange(event.currentTarget.value as T)
  const defaultName = 'radio-button-group'
  return (
    <div className={twMerge(`grid gap-6 ${horizontal ? 'grid-flow-col' : ''}`, className)}>
      {options.map(({ label: optionLabel, value: valueOption, description }, index) => (
        <div key={valueOption} className="flex items-center gap-2">
          <RadioRoot
            name={name || defaultName}
            disabled={disabled}
            label={optionLabel}
            onChange={handleChange}
            value={valueOption}
            description={description}
            defaultChecked={value === valueOption}
          />
        </div>
      ))}
    </div>
  )
}

export default Radio
