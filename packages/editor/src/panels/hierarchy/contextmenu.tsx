import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { ContextMenu } from '@xrengine/ui/src/components/tailwind/ContextMenu'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import React from 'react'
import { useTranslation } from 'react-i18next'
import CreatePrefabPanel from '../../components/dialogs/CreatePrefabPanelDialog'
import { cmdOrCtrlString } from '../../functions/utils'
import { copyNodes, deleteNode, duplicateNode, groupNodes, pasteNodes } from './helpers'
import { useHierarchyNodes, useHierarchyTreeContextMenu, useNodeCollapseExpand, useRenamingNode } from './hooks'

export default function HierarchyTreeContextMenu() {
  const { t } = useTranslation()
  const { anchorEvent, setMenu, entity } = useHierarchyTreeContextMenu()
  const renamingNode = useRenamingNode()
  const { expandChildren, collapseChildren } = useNodeCollapseExpand()
  const nodes = useHierarchyNodes()
  const node = nodes.find((n) => n.entity === entity)

  const onDuplicateNode = () => {
    setMenu()
    duplicateNode(entity)
  }

  const onGroupNodes = () => {
    setMenu()
    groupNodes(entity)
  }

  const onCopyNode = () => {
    setMenu()
    copyNodes(entity)
  }

  const onPasteNode = () => {
    setMenu()
    pasteNodes(entity)
  }

  const onDeleteNode = () => {
    setMenu()
    deleteNode(entity)
  }

  return (
    <ContextMenu anchorEvent={anchorEvent} open={!!entity} onClose={() => setMenu()}>
      <div className="flex w-fit min-w-44 flex-col gap-1 truncate rounded-lg bg-neutral-900 shadow-lg">
        <Button
          fullWidth
          size="small"
          variant="transparent"
          className="text-left text-xs"
          onClick={() => {
            setMenu()
            renamingNode.set(entity)
          }}
          endIcon={cmdOrCtrlString + ' + r'}
        >
          {t('editor:hierarchy.lbl-rename')}
        </Button>
        <Button
          fullWidth
          size="small"
          variant="transparent"
          className="text-left text-xs"
          onClick={onDuplicateNode}
          endIcon={cmdOrCtrlString + ' + d'}
        >
          {t('editor:hierarchy.lbl-duplicate')}
        </Button>
        <Button
          fullWidth
          size="small"
          variant="transparent"
          className="text-left text-xs"
          onClick={onGroupNodes}
          endIcon={cmdOrCtrlString + ' + g'}
        >
          {t('editor:hierarchy.lbl-group')}
        </Button>
        <Button
          fullWidth
          size="small"
          variant="transparent"
          className="text-left text-xs"
          onClick={onCopyNode}
          endIcon={cmdOrCtrlString + ' + c'}
        >
          {t('editor:hierarchy.lbl-copy')}
        </Button>
        <Button
          fullWidth
          size="small"
          variant="transparent"
          className="text-left text-xs"
          onClick={onPasteNode}
          endIcon={cmdOrCtrlString + ' + v'}
        >
          {t('editor:hierarchy.lbl-paste')}
        </Button>
        <Button fullWidth size="small" variant="transparent" className="text-left text-xs" onClick={onDeleteNode}>
          {t('editor:hierarchy.lbl-delete')}
        </Button>
        {!node?.isLeaf && (
          <>
            <Button
              fullWidth
              size="small"
              variant="transparent"
              className="text-left text-xs"
              onClick={() => {
                setMenu()
                expandChildren(entity)
              }}
            >
              {t('editor:hierarchy.lbl-expandAll')}
            </Button>
            <Button
              fullWidth
              size="small"
              variant="transparent"
              className="text-left text-xs"
              onClick={() => {
                setMenu()
                collapseChildren(entity)
              }}
            >
              {t('editor:hierarchy.lbl-collapseAll')}
            </Button>
          </>
        )}
        <Button
          fullWidth
          size="small"
          variant="transparent"
          className="text-left text-xs"
          onClick={() => {
            setMenu()
            PopoverState.showPopupover(<CreatePrefabPanel entity={entity} />)
          }}
        >
          {t('editor:hierarchy.lbl-createPrefab')}
        </Button>
      </div>
    </ContextMenu>
  )
}
