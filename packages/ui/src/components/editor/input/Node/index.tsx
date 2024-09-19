import { Entity, EntityUUID, UUIDComponent, getComponent } from '@xrengine/ecs'
import { ItemTypes } from '@xrengine/editor/src/constants/AssetTypes'
import React from 'react'
import { useDrop } from 'react-dnd'
import { InputProps } from '../../../../primitives/tailwind/Input'
import { ControlledStringInput } from '../String'

export interface NodeInputProps extends Omit<InputProps, 'onChange'> {
  value: EntityUUID
  onChange?: (value: EntityUUID) => void
  onRelease?: (value: EntityUUID) => void
  inputRef?: React.Ref<any>
}

export function NodeInput({ onRelease, value, ...rest }: NodeInputProps) {
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Node],
    async drop(item: any, monitor) {
      const entity: Entity = item.value as Entity
      const uuid = getComponent(entity, UUIDComponent)
      onRelease?.(uuid)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  return <ControlledStringInput ref={dropRef} value={value} {...rest} />
}

NodeInput.defaultProps = {}

export default NodeInput
