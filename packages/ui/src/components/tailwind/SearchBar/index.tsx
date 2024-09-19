import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { State } from '@xrengine/hyperflux'

import Input, { InputProps } from '@xrengine/ui/src/primitives/tailwind/Input'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'

const variants = {
  small: 'px-1 py-0.5 ps-8',
  medium: 'p-2 ps-8',
  large: 'px-2 py-5 ps-10'
}

export default function SearchBar({
  search,
  size = 'large',
  inputProps = {},
  debounceTime = 100
}: {
  search: State<{
    local: string
    query: string
  }>
  size?: 'small' | 'medium' | 'large'
  inputProps?: Partial<InputProps>
  debounceTime?: number
}) {
  const { t } = useTranslation()
  const debouncedSearchQueryRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => clearTimeout(debouncedSearchQueryRef.current), [])

  return (
    <Input
      placeholder={t('common:components.search')}
      value={search?.value.local ?? ''}
      onChange={(event) => {
        search.local.set(event.target.value)

        if (debouncedSearchQueryRef) {
          clearTimeout(debouncedSearchQueryRef.current)
        }

        debouncedSearchQueryRef.current = setTimeout(() => {
          search.query.set(event.target.value)
        }, debounceTime)
      }}
      className={twMerge('bg-theme-surface-main', variants[size])}
      containerClassName="w-1/5 block"
      startComponent={<HiMagnifyingGlass />}
      {...inputProps}
    />
  )
}
