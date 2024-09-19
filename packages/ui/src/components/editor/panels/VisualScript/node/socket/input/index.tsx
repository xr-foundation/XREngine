import React from 'react'
import { FaCaretRight } from 'react-icons/fa6'
import { Connection, Handle, Position, useReactFlow } from 'reactflow'

import {
  NodeSpecGenerator,
  isValidConnection
} from '@xrengine/editor/src/components/visualScript/VisualScriptUIModule'
import { InputSocketSpecJSON } from '@xrengine/visual-script'
import { twMerge } from 'tailwind-merge'
import { AutoSizeInput } from '../../../autoSizeInput'
import { colors, valueTypeColorMap } from '../../../util/colors'

export type InputSocketProps = {
  connected: boolean
  value: any | undefined
  onChange: (key: string, value: any) => void
  specGenerator: NodeSpecGenerator
  collapsed: boolean
  offset: any
} & InputSocketSpecJSON

const InputFieldForValue = ({
  choices,
  value,
  defaultValue,
  onChange,
  name,
  valueType
}: Pick<InputSocketProps, 'choices' | 'value' | 'defaultValue' | 'name' | 'onChange' | 'valueType'>) => {
  const showChoices = choices?.length
  const inputVal = String(value) // ?? defaultValue ?? ''
  const inputSocketStyle = {
    userDrag: 'none',
    WebkitUserDrag: 'none',
    MozUserDrag: 'none'
  }
  const inputSocketClassName = 'cursor-pointer p-.5 mr-2 m-0 bg-neutral-800'
  if (showChoices)
    return (
      <select
        className={twMerge('socket-input choice', inputSocketClassName)}
        style={inputSocketStyle as any}
        value={value ?? defaultValue ?? ''}
        onChange={(e) => onChange(name, e.currentTarget.value)}
      >
        <>
          {choices.map((choice) => (
            <option key={choice.text} value={choice.value}>
              {choice.text}
            </option>
          ))}
        </>
      </select>
    )

  return (
    <>
      {valueType === 'string' && (
        <AutoSizeInput
          type="text"
          className={twMerge('socket-input string', inputSocketClassName)}
          style={inputSocketStyle as any}
          value={inputVal}
          onChange={(e) => onChange(name, e.currentTarget.value)}
        />
      )}
      {valueType === 'number' && (
        <AutoSizeInput
          type="number"
          className={twMerge('socket-input number', inputSocketClassName)}
          style={inputSocketStyle as any}
          value={inputVal}
          onChange={(e) => onChange(name, e.currentTarget.value)}
        />
      )}
      {valueType === 'float' && (
        <AutoSizeInput
          type="number"
          className={twMerge('socket-input float', inputSocketClassName)}
          style={inputSocketStyle as any}
          value={inputVal}
          onChange={(e) => onChange(name, e.currentTarget.value)}
        />
      )}
      {valueType === 'integer' && (
        <AutoSizeInput
          type="number"
          className={twMerge('socket-input integer', inputSocketClassName)}
          style={inputSocketStyle as any}
          value={inputVal}
          onChange={(e) => onChange(name, e.currentTarget.value)}
        />
      )}
      {valueType === 'boolean' && (
        <input
          type="checkbox"
          className={twMerge('socket-input boolean', inputSocketClassName)}
          style={inputSocketStyle as any}
          value={inputVal}
          checked={value}
          onChange={(e) => onChange(name, e.currentTarget.checked)}
        />
      )}
    </>
  )
}

const InputSocket: React.FC<InputSocketProps> = ({ connected, specGenerator, ...rest }) => {
  const { name, valueType, collapsed, offset } = rest
  const instance = useReactFlow()
  const isFlowSocket = valueType === 'flow'

  let colorName = valueTypeColorMap[valueType]
  if (colorName === undefined) {
    colorName = 'red'
  }

  // @ts-ignore
  const [backgroundColor, borderColor] = colors[colorName]
  const showName = isFlowSocket === false || name !== 'flow'

  const position = {} as any
  if (offset?.x !== undefined) position['left'] = `${offset.x}%`
  if (offset?.y !== undefined) position['top'] = `${offset.y}%`

  return (
    <div
      className={twMerge('flex-start relative flex h-4 grow items-center justify-start', collapsed ? 'absolute' : '')}
      style={position as any}
    >
      {isFlowSocket && <FaCaretRight color="#ffffff" size="1.25rem" />}
      {showName && !collapsed && <div className="ml-2 mr-4 capitalize">{name}</div>}
      {!isFlowSocket && !connected && !collapsed && <InputFieldForValue {...rest} />}

      <Handle
        id={name}
        type="target"
        position={Position.Left}
        className={twMerge(
          'socket-input-handle',
          'ml-auto',
          connected ? backgroundColor : 'bg-white',
          borderColor,
          'h-2.5 w-2.5',
          collapsed ? '' : 'left-[-12px]'
        )}
        isValidConnection={(connection: Connection) => isValidConnection(connection, instance, specGenerator)}
      />
    </div>
  )
}

export default InputSocket
