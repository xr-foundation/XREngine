
import React, { Fragment, useState } from 'react'
import { BiSolidComponent } from 'react-icons/bi'
import { HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi'
import { HiMiniXMark } from 'react-icons/hi2'
import Button from '../../../../primitives/tailwind/Button'
import Text from '../../../../primitives/tailwind/Text'

interface Props {
  name?: string
  icon?: any
  description?: string
  onClose?: () => void
  children?: React.ReactNode
  minimizedDefault?: boolean
  rest?: Record<string, unknown>
}

const PropertyGroup = ({ name, icon, description, children, onClose, minimizedDefault, ...rest }: Props) => {
  const [minimized, setMinimized] = useState(minimizedDefault ?? true)

  return (
    <div className="justify-left flex w-full flex-col items-start rounded border-solid bg-[#212226] px-4 py-1.5">
      <div className="flex w-full items-center gap-2 text-theme-gray3">
        <Button
          onClick={() => setMinimized(!minimized)}
          variant="outline"
          startIcon={minimized ? <HiOutlineChevronRight /> : <HiOutlineChevronDown />}
          className="ml-0 h-4 border-0 p-0 text-[#444444]"
        />
        {icon}
        {name && <Text>{name}</Text>}
        <div className="ml-auto mr-0 flex items-center gap-3 text-white">
          {onClose && (
            <button onPointerUp={onClose}>
              <HiMiniXMark />
            </button>
          )}
          {/*<MdDragIndicator className="rotate-90" />*/}
        </div>
      </div>
      {!minimized && description && (
        <Text fontSize="xs" className="ml-8 py-2">
          {description.split('\\n').map((line, idx) => (
            <Fragment key={idx}>
              {line}
              <br />
            </Fragment>
          ))}
        </Text>
      )}
      {!minimized && <div className="flex w-full flex-col py-2">{children}</div>}
    </div>
  )
}

PropertyGroup.defaultProps = {
  name: 'Component name',
  icon: <BiSolidComponent />
}

export default PropertyGroup
