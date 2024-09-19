import React, { ReactNode } from 'react'

import { twMerge } from 'tailwind-merge'

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  startIcon?: ReactNode
  endIcon?: ReactNode
  children?: ReactNode
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'transparent'
  disabled?: boolean
  fullWidth?: boolean
  rounded?: 'partial' | 'full' | 'none'
  className?: string
  iconContainerClassName?: string
  textContainerClassName?: string
}

const roundedTypes = {
  partial: 'rounded-md',
  full: 'rounded-full',
  none: 'rounded-none'
}

const sizes = {
  small: 'text-sm px-3 py-2',
  medium: 'text-base px-4 py-2',
  large: 'text-lg px-7 py-3'
}

const variants = {
  primary: 'bg-blue-primary',
  secondary: 'bg-theme-blue-secondary',
  outline: 'border border-solid border-theme-primary bg-theme-surface-main dark:bg-theme-highlight text-theme-primary',
  danger: 'bg-red-500',
  success: 'bg-teal-700',
  transparent: 'bg-transparent dark:bg-transparent'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      startIcon: StartIcon,
      children,
      endIcon: EndIcon,
      size = 'medium',
      fullWidth,
      rounded = 'partial',
      variant = 'primary',
      disabled = false,
      className,
      iconContainerClassName,
      textContainerClassName,
      ...props
    },
    ref
  ) => {
    const twClassName = twMerge(
      'flex items-center',
      'font-medium text-white',
      'transition ease-in-out',
      'disabled:cursor-not-allowed',
      (StartIcon || EndIcon) && 'justify-center',
      sizes[size],
      fullWidth ? 'w-full' : 'w-fit',
      roundedTypes[rounded],
      disabled ? 'bg-[#F3F4F6] text-[#9CA3AF] dark:bg-[#5F7DBF] dark:text-[#FFFFFF]' : '',
      variants[variant],
      className
    )

    return (
      <button ref={ref} role="button" disabled={disabled} className={twClassName} {...props}>
        {StartIcon && <span className={twMerge('mx-1', iconContainerClassName)}>{StartIcon}</span>}
        {children && (
          <span className={twMerge('mx-1', fullWidth ? 'mx-1 w-full' : '', textContainerClassName)}>{children}</span>
        )}
        {EndIcon && <span className={twMerge('mx-1', iconContainerClassName)}>{EndIcon}</span>}
      </button>
    )
  }
)

export default Button
