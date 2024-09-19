import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiXCircle } from 'react-icons/hi2'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'

import { useClickOutside } from '@xrengine/common/src/utils/useClickOutside'
import { useHookstate } from '@xrengine/hyperflux'

import Checkbox from '../Checkbox'
import Input from '../Input'
import Label from '../Label'
import Text from '../Text'

export interface MultiSelectProps<T extends string | number> {
  label?: string
  className?: string
  error?: string
  description?: string
  options: { label: string; value: T; disabled?: boolean }[]
  selectedOptions: T[]
  onChange: (values: T[]) => void
  placeholder?: string
  menuClassName?: string
}

const MultiSelect = <T extends string | number>({
  className,
  label,
  error,
  description,
  options,
  selectedOptions,
  onChange,
  placeholder,
  menuClassName
}: MultiSelectProps<T>) => {
  const { t } = useTranslation()
  const twClassName = twMerge('relative bg-theme-surface-main', className)
  const ref = useRef<HTMLDivElement>(null)

  const showOptions = useHookstate(false)
  const searchInput = useHookstate('')

  const filteredOptions = useHookstate(options)
  useEffect(() => {
    filteredOptions.set(options)
  }, [options])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchInput.set(e.target.value)
    const newOptions: MultiSelectProps<T>['options'] = []
    for (let i = 0; i < options.length; i++) {
      if (options[i].label.toLowerCase().startsWith(e.target.value.toLowerCase())) {
        newOptions.push(options[i])
      }
    }
    filteredOptions.set(newOptions)
  }

  useClickOutside(ref, () => showOptions.set(false))

  return (
    <div className={twClassName} ref={ref}>
      <Label>{label}</Label>
      {description && <p className="self-stretch text-xs text-theme-secondary">{description}</p>}
      {error && (
        <p className="inline-flex items-center gap-2.5 self-start text-sm text-theme-iconRed">
          <HiXCircle /> {error}
        </p>
      )}
      <div
        className="textshadow-sm mt-2 flex min-h-10 w-full flex-auto flex-wrap items-center rounded-lg border border-theme-primary bg-theme-surface-main px-3.5 pr-7"
        onClick={() => showOptions.set((value) => !value)}
      >
        {selectedOptions.length === 0 && (
          <Text theme="secondary" className="text-gray-400">
            {placeholder || t('common:select.selectOptions')}
          </Text>
        )}
        {selectedOptions.map((selectedOption) => (
          <div
            key={selectedOption}
            className="m-1 flex h-7 items-center justify-center gap-1 rounded border border-theme-primary bg-theme-surface-main p-1 font-medium text-theme-primary"
          >
            <Text className="text-theme-primary">{options.find((opt) => opt.value === selectedOption)?.label}</Text>
            <HiXCircle
              className="cursor-pointer"
              onClick={() => onChange(selectedOptions.filter((opt) => opt !== selectedOption))}
            />
          </div>
        ))}
      </div>

      <MdOutlineKeyboardArrowDown
        size="1.5em"
        className={`absolute right-3 top-10 text-theme-primary transition-transform ${
          showOptions.value ? 'rotate-180' : ''
        }`}
        onClick={() => showOptions.set((value) => !value)}
      />

      <div
        className={`absolute z-[1000] mt-2 w-full rounded border border-theme-primary bg-theme-secondary ${
          showOptions.value ? 'visible' : 'hidden'
        }`}
      >
        <Input placeholder={t('common:select.filter')} value={searchInput.value} onChange={handleSearch} />
        <ul className={twMerge('max-h-40 overflow-auto [&>li]:px-4 [&>li]:py-2 [&>li]:text-gray-500 ', menuClassName)}>
          {filteredOptions.value.map((option) => (
            <li
              key={option.value}
              className={twMerge(
                'cursor-pointer px-4 py-2 text-theme-primary',
                option.disabled ? 'cursor-not-allowed' : 'hover:bg-theme-surface-main hover:text-theme-highlight'
              )}
              onClick={() => {
                if (option.disabled) return
                if (!selectedOptions.find((opt) => opt === option.value)) {
                  onChange([...selectedOptions, option.value as T])
                } else {
                  onChange(selectedOptions.filter((opt) => opt && opt !== option.value))
                }
              }}
            >
              {option.disabled ? (
                <Label>{option.label}</Label>
              ) : (
                <Checkbox
                  onChange={(selected) => {
                    if (selected) {
                      onChange([...selectedOptions, option.value as T])
                    } else {
                      onChange(selectedOptions.filter((opt) => opt && opt !== option.value))
                    }
                  }}
                  value={selectedOptions.some((opt) => opt && opt === option.value)}
                  label={option.label}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default MultiSelect
