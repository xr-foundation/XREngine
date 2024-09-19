
import React, { ReactNode } from 'react'
import Popup from 'reactjs-popup'
import { PopupProps } from 'reactjs-popup/dist/types'
import { twMerge } from 'tailwind-merge'
import './tooltip.css'

export type TooltipProps = {
  title?: ReactNode
  titleClassName?: string
  content: ReactNode
  children: React.ReactElement
} & PopupProps

const Tooltip = ({ title, titleClassName, content, children, className, ...rest }: TooltipProps) => {
  return (
    <Popup
      trigger={<div style={{ all: 'unset' }}>{children}</div>}
      on="hover"
      keepTooltipInside
      repositionOnResize
      arrow={false}
      contentStyle={{
        animation: 'expandFromCenter 0.3s cubic-bezier(0.38, 0.1, 0.36, 0.9) forwards',
        transformOrigin: 'center'
      }}
      {...rest}
    >
      <div className="-mt-1 grid text-wrap shadow-lg transition-all">
        {title && (
          <span
            className={twMerge(
              'block rounded-t border-b border-b-[#212226] bg-[#141619] px-3 py-1.5 text-sm text-[#F5F5F5]',
              titleClassName
            )}
          >
            {title}
          </span>
        )}
        <div
          className={twMerge(
            'bg-theme-studio-surface px-3 py-2 text-sm text-[#F5F5F5]',
            title ? 'rounded-b' : 'rounded',
            className
          )}
        >
          {content}
        </div>
      </div>
    </Popup>
  )
}

export default Tooltip
