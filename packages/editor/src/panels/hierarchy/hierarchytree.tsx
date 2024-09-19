import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import ElementList from '@xrengine/ui/src/components/editor/panels/Properties/elementList'
import { Popup } from '@xrengine/ui/src/components/tailwind/Popup'
import SearchBar from '@xrengine/ui/src/components/tailwind/SearchBar'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import React, { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlinePlusCircle } from 'react-icons/hi2'
import { FixedSizeList, ListChildComponentProps } from 'react-window'
import { twMerge } from 'tailwind-merge'
import { HierarchyTreeState } from '../../services/HierarchyNodeState'
import HierarchyTreeNode from './hierarchynode'
import { useHierarchyNodes, useHierarchyTreeDrop, useHierarchyTreeHotkeys } from './hooks'

export function Topbar() {
  const { t } = useTranslation()
  const search = useHookstate(getMutableState(HierarchyTreeState).search)
  const isAddEntityMenuOpen = useHookstate(false)

  return (
    <div className="flex items-center gap-2 bg-theme-surface-main">
      <SearchBar
        search={search}
        inputProps={{ containerClassName: 'bg-theme-primary text-[#A3A3A3]', className: 'm-1 rounded' }}
      />
      <Popup
        keepInside
        open={isAddEntityMenuOpen.value}
        onClose={() => isAddEntityMenuOpen.set(false)}
        trigger={
          <Button
            startIcon={<HiOutlinePlusCircle />}
            variant="transparent"
            rounded="none"
            className="ml-auto w-32 text-nowrap bg-theme-highlight px-2 py-3 text-white"
            size="small"
            textContainerClassName="mx-0"
            onClick={() => isAddEntityMenuOpen.set(true)}
          >
            {t('editor:hierarchy.lbl-addEntity')}
          </Button>
        }
      >
        <div className="h-full w-96 overflow-y-auto">
          <ElementList type="prefabs" onSelect={() => isAddEntityMenuOpen.set(false)} />
        </div>
      </Popup>
    </div>
  )
}

export function Contents() {
  const listDimensions = useHookstate({
    height: 0,
    width: 0
  })
  const nodes = useHierarchyNodes()
  const ref = useRef<HTMLDivElement>(null)

  const { canDrop, isOver, dropTarget: treeContainerDropTarget } = useHierarchyTreeDrop()

  /**an explicit callback is required to rerender changed nodes inside FixedSizeList */
  const MemoTreeNode = useCallback(
    (props: ListChildComponentProps<undefined>) => <HierarchyTreeNode {...props} />,
    [nodes]
  )

  useEffect(() => {
    if (!ref.current) return
    const handleResize = () => {
      if (!ref.current) return
      const { height, width } = ref.current.getBoundingClientRect()
      listDimensions.set({ height, width })
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(ref.current)
    return () => resizeObserver.disconnect()
  }, [])

  useHierarchyTreeHotkeys()

  return (
    <div ref={ref} className={twMerge('h-5/6 overflow-hidden', isOver && canDrop && 'border border-dotted')}>
      <FixedSizeList
        height={listDimensions.height.value}
        width={listDimensions.width.value}
        itemSize={40}
        itemData={{ nodes }}
        itemCount={nodes.length}
        itemKey={(index: number) => index}
        outerRef={treeContainerDropTarget}
        innerElementType="ul"
      >
        {MemoTreeNode}
      </FixedSizeList>
    </div>
  )
}
