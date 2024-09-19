import React, { ReactNode } from 'react'
import Text from '../../../primitives/tailwind/Text'

export const PanelTitle = ({ children }: { children: ReactNode }) => {
  return (
    <Text fontSize="sm" className="leading-none">
      {children}
    </Text>
  )
}

export const PanelDragContainer = ({ children }: { children: ReactNode }) => {
  return <div className="flex h-7 cursor-pointer rounded-t-md px-4 py-2">{children}</div>
}
