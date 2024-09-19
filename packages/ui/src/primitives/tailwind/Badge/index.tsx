
import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface BadgeProps {
  label: string
  className?: string
  textClassName?: string
  icon?: React.ReactNode
  variant?: 'success' | 'successLight' | 'danger' | 'neutral' | 'warning'
}

const variantMap = {
  success: {
    containerClass: 'bg-theme-tagGreen',
    iconColor: '#15803d',
    textClass: 'text-green-900 dark:text-white'
  },
  successLight: {
    containerClass: 'bg-theme-tagLime',
    iconColor: '#9ACD32',
    textClass: 'text-[#9ACD32]-900 dark:text-white'
  },
  danger: {
    containerClass: 'bg-theme-tagRed',
    iconColor: '#f43f5e',
    textClass: 'text-white'
  },
  neutral: {
    containerClass: 'bg-stone-200 dark:bg-gray-800',
    iconColor: 'black',
    textClass: 'text-black dark:text-white'
  },
  warning: {
    containerClass: 'bg-theme-tagYellow',
    iconColor: '#d6a407',
    textClass: 'text-yellow-900 dark:text-white'
  }
}

const Badge = ({ label, className, textClassName, icon, variant }: BadgeProps) => {
  let twClassName = twMerge('flex h-fit items-center justify-around gap-x-1.5	rounded-full px-2.5 py-0.5', className)

  let twTextClassName = textClassName

  let variantIconColor: null | string = null

  if (variant && variantMap[variant]) {
    const { containerClass, iconColor, textClass } = variantMap[variant]
    twClassName = twMerge(containerClass, twClassName)
    twTextClassName = twMerge(textClass, twTextClassName)
    variantIconColor = iconColor
  }

  return (
    <div className={twClassName}>
      {variantIconColor && React.isValidElement(icon)
        ? React.cloneElement(icon, {
            ...icon.props,
            // @ts-ignore
            color: variantIconColor
          })
        : icon}
      <span className={twTextClassName}>{label}</span>
    </div>
  )
}

export default Badge
