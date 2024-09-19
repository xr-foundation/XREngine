
import React, { ReactNode, forwardRef, useEffect } from 'react'

import { useHookstate } from '@xrengine/hyperflux'
import { twMerge } from 'tailwind-merge'
import Text from '../Text'

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  expandIcon: ReactNode
  shrinkIcon: ReactNode
  prefixIcon?: ReactNode
  children?: ReactNode
  titleClassName?: string
  titleFontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  className?: string
  open?: boolean
}

const Accordion = forwardRef(
  (
    {
      title,
      subtitle,
      expandIcon,
      shrinkIcon,
      prefixIcon,
      children,
      className,
      titleClassName,
      titleFontSize = 'xl',
      open,
      ...props
    }: AccordionProps,
    ref: React.MutableRefObject<HTMLDivElement>
  ): JSX.Element => {
    const twClassName = twMerge('w-full rounded-2xl bg-theme-surface-main p-6 ', className)
    const twClassNameTitle = twMerge('flex flex-row items-center', titleClassName)
    const openState = useHookstate(false)

    useEffect(() => {
      openState.set(!!open)
    }, [open])

    return (
      <div className={twClassName} {...props} ref={ref}>
        <div
          className="flex w-full cursor-pointer items-center justify-between hover:bg-theme-highlight"
          onClick={() => {
            openState.set((v) => !v)
          }}
        >
          <div className={twClassNameTitle}>
            {prefixIcon && <div className="mr-2">{prefixIcon}</div>}
            <Text component="h2" fontSize={titleFontSize!} fontWeight="semibold">
              {title}
            </Text>
          </div>

          {openState.value ? shrinkIcon : expandIcon}
        </div>

        {!openState.value && subtitle && (
          <Text component="h3" fontSize="base" fontWeight="light" className="mt-2 w-full dark:text-[#A3A3A3]">
            {subtitle}
          </Text>
        )}

        {openState.value && children}
      </div>
    )
  }
)

export default Accordion
