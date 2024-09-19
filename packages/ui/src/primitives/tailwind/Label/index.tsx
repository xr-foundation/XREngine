import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface LabelProps extends React.HtmlHTMLAttributes<HTMLLabelElement> {
  className?: string
  htmlFor?: string
}

const Label = ({ className, htmlFor, children, ...props }: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        'inline-block text-sm font-medium leading-none text-theme-secondary peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}

export default Label
