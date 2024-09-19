import { EntityUUID, UUIDComponent, getOptionalComponent } from '@xrengine/ecs'
import { ItemTypes } from '@xrengine/editor/src/constants/AssetTypes'
import { SelectionState } from '@xrengine/editor/src/services/SelectionServices'
import { MaterialSelectionState } from '@xrengine/engine/src/scene/materials/MaterialLibraryState'
import { getMutableState, useHookstate, useMutableState } from '@xrengine/hyperflux'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { MaterialStateComponent } from '@xrengine/spatial/src/renderer/materials/MaterialComponent'
import React from 'react'
import { useDrag } from 'react-dnd'
import { HiOutlineArchiveBox } from 'react-icons/hi2'
import { SiRoundcube } from 'react-icons/si'
import { ListChildComponentProps } from 'react-window'
import { twMerge } from 'tailwind-merge'

const getNodeDisplayName = (uuid: EntityUUID) => {
  const entity = UUIDComponent.getEntityByUUID(uuid)
  return (
    getOptionalComponent(entity, MaterialStateComponent)?.material?.name ||
    getOptionalComponent(entity, NameComponent) ||
    ''
  )
}

export default function MaterialLayerNode(props: ListChildComponentProps<{ nodes: EntityUUID[] }>) {
  const data = props.data
  const node = data.nodes[props.index]
  const materialSelection = useHookstate(getMutableState(MaterialSelectionState).selectedMaterial)
  const selectionState = useMutableState(SelectionState)

  /**@todo use asset source decoupled from uuid to make this less brittle */
  const source = node.includes('/') ? node.split('/')?.pop()?.split('?')[0] : null

  const onClickNode = () => {
    if (!source) {
      materialSelection.set(node)
    }
  }

  const [_dragProps, drag] = useDrag({
    type: ItemTypes.Material,
    item() {
      const selectedEntities = selectionState.selectedEntities.value
      const multiple = selectedEntities.length > 1
      return {
        type: ItemTypes.Material,
        multiple,
        value: node[0]
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  })

  return (
    <li
      style={props.style}
      ref={drag}
      id={node[0]}
      className={twMerge(
        props.index % 2 ? 'bg-theme-surfaceInput' : 'bg-zinc-800',
        materialSelection.value === node ? 'border border-gray-100' : 'border-none'
      )}
      onClick={onClickNode}
    >
      <div ref={drag} id={node[0]} tabIndex={0} onClick={onClickNode}>
        {source ? (
          <div className="flex items-center pl-3.5 pr-2">
            <div className="flex flex-1 items-center bg-inherit py-0.5 pl-0 pr-1">
              <HiOutlineArchiveBox className="h-5 w-5 flex-shrink-0 text-white dark:text-[#A3A3A3]" />
              <div className="flex flex-1 items-center">
                <div className="ml-2 min-w-0 flex-1 text-nowrap rounded bg-transparent px-0.5 py-0 text-inherit text-white dark:text-[#A3A3A3]">
                  <span className="text-nowrap text-sm leading-4">{source}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center pl-9 pr-6">
            <div className="flex flex-1 items-center bg-inherit py-0.5 pl-0 pr-1">
              <SiRoundcube className="h-5 w-5 flex-shrink-0 text-white dark:text-[#A3A3A3]" />
              <div className="flex flex-1 items-center">
                <div className="ml-2 min-w-0 flex-1 text-nowrap rounded bg-transparent px-0.5 py-0 text-inherit text-white dark:text-[#A3A3A3]">
                  <span className="text-nowrap text-sm leading-4">{getNodeDisplayName(node)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
