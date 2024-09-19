import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'

import { calculateAndApplyYOffset } from '@xrengine/common/src/utils/offsets'
import { useClickOutside } from '@xrengine/common/src/utils/useClickOutside'
import { useHookstate } from '@xrengine/hyperflux'

import Input from '../Input'

export type OptionValueType = string | number

export type SelectOptionsType = { label: string; value: any; disabled?: boolean }

export interface SelectProps<T extends OptionValueType> {
  label?: string
  className?: string
  error?: string
  description?: string
  options: SelectOptionsType[]
  currentValue: T
  onChange: (value: T) => void
  placeholder?: string
  disabled?: boolean
  menuClassname?: string
  menuItemClassName?: string
  labelClassName?: string
  inputVariant?: 'outlined' | 'underlined' | 'onboarding'
  inputClassName?: string
  errorBorder?: boolean
  searchDisabled?: boolean
  inputContainerClassName?: string
  endComponent?: JSX.Element
}

const Select = <T extends OptionValueType>({
  className,
  label,
  error,
  description,
  options,
  currentValue,
  onChange,
  placeholder,
  disabled,
  menuClassname,
  menuItemClassName,
  labelClassName,
  inputVariant,
  inputClassName,
  errorBorder,
  searchDisabled,
  inputContainerClassName,
  endComponent
}: SelectProps<T>) => {
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const showOptions = useHookstate(false)
  const filteredOptions = useHookstate(JSON.parse(JSON.stringify(options)) as SelectOptionsType[])
  const selectLabel = useHookstate('')

  useClickOutside(ref, () => showOptions.set(false))

  useEffect(() => {
    const handleResize = () => {
      calculateAndApplyYOffset(menuRef.current, -50)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const labelName = options.find((option) => option.value === currentValue)?.label
    if (labelName) selectLabel.set(labelName || '')
  }, [currentValue, options])

  useEffect(() => {
    filteredOptions.set(JSON.parse(JSON.stringify(options)))
  }, [options])

  const toggleDropdown = () => {
    if (options.length === 0) return
    showOptions.set((v) => !v)
  }

  // Prevent the input field from receiving focus with Mouse click when it is searchDisabled
  const handleMouseDown = (e: React.MouseEvent) => {
    if (searchDisabled) {
      e.preventDefault()
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (searchDisabled) {
      return
    }
    const newOptions = options.filter((item) => item.label.toLowerCase().startsWith(e.target.value.toLowerCase()))
    if (newOptions.length > 0) {
      filteredOptions.set(newOptions)
      selectLabel.set(e.target.value)
    }

    const optionFound = options.find((item) => item.label === e.target.value)
    if (optionFound) {
      onChange(newOptions[0].value as T)
    }
  }

  const handleOptionItem = (option: SelectOptionsType) => {
    if (option.disabled) return

    showOptions.set(false)
    onChange(option.value as T)
  }

  return (
    <div className={twMerge('relative w-full', className)} ref={ref}>
      <Input
        disabled={disabled}
        label={label}
        labelClassname={labelClassName}
        variant={inputVariant}
        description={description}
        error={error}
        errorBorder={errorBorder}
        className={twMerge('cursor-pointer', inputClassName)}
        placeholder={placeholder || t('common:select.selectOption')}
        value={selectLabel.value}
        onChange={handleSearch}
        onClick={toggleDropdown}
        onMouseDown={handleMouseDown}
        endComponent={
          endComponent ?? (
            <MdOutlineKeyboardArrowDown
              size="1.5em"
              className={`mr-2 transition-transform ${showOptions.value ? 'rotate-180' : ''} ${
                disabled ? 'opacity-50' : ''
              }`}
              onClick={() => {
                if (!disabled) {
                  toggleDropdown()
                }
              }}
            />
          )
        }
        containerClassName={inputContainerClassName}
      />
      <div
        className={`absolute z-30 mt-2 w-full rounded border border-theme-primary bg-theme-surface-main ${
          showOptions.value ? 'visible' : 'hidden'
        }`}
        ref={menuRef}
      >
        <ul className={twMerge('max-h-40 overflow-auto [&>li]:px-4 [&>li]:py-2', menuClassname)}>
          {filteredOptions.value.map((option) => (
            <li
              key={option.label + option.value}
              value={option.value}
              className={twMerge(
                'cursor-pointer px-4 py-2 text-theme-secondary',
                option.disabled ? 'cursor-not-allowed' : 'hover:bg-theme-highlight hover:text-theme-highlight',
                menuItemClassName
              )}
              onClick={() => handleOptionItem(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Select
