
import { useFind } from '@xrengine/common'
import { staticResourcePath } from '@xrengine/common/src/schema.type.module'
import {
  FilesState,
  FilesViewModeSettings,
  FilesViewModeState,
  SelectedFilesState
} from '@xrengine/editor/src/services/FilesState'
import { getMutableState, useHookstate, useMutableState } from '@xrengine/hyperflux'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'
import React, { MouseEventHandler, useEffect } from 'react'
import { ConnectDragSource, ConnectDropTarget, useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { IoIosArrowForward } from 'react-icons/io'
import { VscBlank } from 'react-icons/vsc'
import { twMerge } from 'tailwind-merge'
import { FileDataType, SupportedFileTypes } from '../../constants/AssetTypes'
import { ClickPlacementState } from '../../systems/ClickPlacementSystem'
import { FileContextMenu } from './contextmenu'
import { FileIcon } from './fileicon'
import {
  FILES_PAGE_LIMIT,
  availableTableColumns,
  canDropOnFileBrowser,
  useCurrentFiles,
  useFileBrowserDrop
} from './helpers'

type DisplayTypeProps = {
  file: FileDataType
  onDoubleClick?: MouseEventHandler
  onClick?: MouseEventHandler
  isSelected: boolean
  drag: ConnectDragSource
  drop: ConnectDropTarget
  isOver: boolean
  onContextMenu: React.MouseEventHandler
}

export function TableWrapper({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const selectedTableColumns = useHookstate(getMutableState(FilesViewModeSettings).list.selectedTableColumns).value

  return (
    <table className="w-full">
      <thead>
        <tr className="h-8 text-left text-[#E7E7E7]">
          {availableTableColumns
            .filter((header) => selectedTableColumns[header])
            .map((header) => (
              <th key={header} className="table-cell text-xs font-normal dark:text-[#A3A3A3]">
                {t(`editor:layout.filebrowser.table-list.headers.${header}`)}
              </th>
            ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

function TableView({ file, onClick, onDoubleClick, drag, drop, isOver, onContextMenu }: DisplayTypeProps) {
  const filesViewModeSettings = useMutableState(FilesViewModeSettings)
  const selectedTableColumns = filesViewModeSettings.list.selectedTableColumns.value
  const fontSize = filesViewModeSettings.list.fontSize.value
  const { files } = useCurrentFiles()
  const { projectName } = useMutableState(FilesState)
  const staticResourceModifiedDates = useHookstate<Record<string, string>>({})

  const staticResourceData = useFind(staticResourcePath, {
    query: {
      key: {
        $in: files.map((file) => file.key)
      },
      project: projectName.value,
      $select: ['key', 'updatedAt'] as any,
      $limit: FILES_PAGE_LIMIT
    }
  })

  useEffect(() => {
    if (staticResourceData.status !== 'success') return
    const modifiedDates: Record<string, string> = {}
    staticResourceData.data.forEach((data) => {
      modifiedDates[data.key] = new Date(data.updatedAt).toLocaleString()
    })
    staticResourceModifiedDates.set(modifiedDates)
  }, [staticResourceData.status])

  const thumbnailURL = file.thumbnailURL

  const tableColumns = {
    name: (
      <span
        className="flex h-7 max-h-7 flex-row items-center gap-2 font-figtree text-[#e7e7e7]"
        style={{ fontSize: `${fontSize}px` }}
      >
        {file.isFolder ? <IoIosArrowForward /> : <VscBlank />}
        <FileIcon isMinified={true} thumbnailURL={thumbnailURL} type={file.type} isFolder={file.isFolder} />
        {file.fullName}
      </span>
    ),
    type: file.type.toUpperCase(),
    dateModified: staticResourceModifiedDates.value[file.key] || '',
    size: file.size
  }
  return (
    <tr
      key={file.key}
      ref={(ref) => drag(drop(ref))}
      className={twMerge('h-9 text-[#a3a3a3] hover:bg-[#191B1F]', isOver && 'border-2 border-gray-400')}
      onContextMenu={onContextMenu}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {availableTableColumns
        .filter((header) => selectedTableColumns[header])
        .map((header, idx) => (
          <td key={idx} style={{ fontSize: `${fontSize}px` }}>
            {tableColumns[header]}
          </td>
        ))}
    </tr>
  )
}

function GridView({ file, onDoubleClick, onClick, isSelected, drag, drop, isOver, onContextMenu }: DisplayTypeProps) {
  const iconSize = useHookstate(getMutableState(FilesViewModeSettings).icons.iconSize).value
  const thumbnailURL = file.thumbnailURL

  return (
    <div
      ref={(ref) => drag(drop(ref))}
      className={twMerge('h-min', isOver && 'border-2 border-gray-400')}
      onContextMenu={onContextMenu}
    >
      <div
        className={twMerge(
          'flex h-auto max-h-32 w-28 cursor-pointer flex-col items-center text-center',
          isSelected && 'rounded bg-[#191B1F]'
        )}
        onDoubleClick={file.isFolder ? onDoubleClick : undefined}
        onClick={onClick}
      >
        <div
          className="mx-4 mt-2 font-figtree"
          style={{
            height: iconSize,
            width: iconSize,
            fontSize: iconSize
          }}
        >
          <FileIcon thumbnailURL={thumbnailURL} type={file.type} isFolder={file.isFolder} color="text-[#375DAF]" />
        </div>

        <Tooltip content={file.fullName}>
          <Text theme="secondary" fontSize="sm" className="mt-2 w-24 overflow-hidden text-ellipsis whitespace-nowrap">
            {file.fullName}
          </Text>
        </Tooltip>
      </div>
    </div>
  )
}

export default function FileItem({ file }: { file: FileDataType }) {
  const filesViewMode = useMutableState(FilesViewModeState).viewMode
  const isListView = filesViewMode.value === 'list'
  const [anchorEvent, setAnchorEvent] = React.useState<undefined | React.MouseEvent>(undefined)
  const filesState = useMutableState(FilesState)
  const { changeDirectoryByPath, files } = useCurrentFiles()
  const dropOnFileBrowser = useFileBrowserDrop()
  const selectedFiles = useMutableState(SelectedFilesState)

  const [_dragProps, drag, preview] = useDrag(() => ({
    type: file.type,
    item: file,
    multiple: false
  }))

  useEffect(() => {
    if (preview) preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  const [{ isOver }, drop] = useDrop({
    accept: [...SupportedFileTypes],
    drop: (dropItem) =>
      dropOnFileBrowser(
        dropItem as any,
        file,
        selectedFiles.map((selectedFile) => selectedFile.key.value)
      ),
    canDrop: (dropItem: Record<string, unknown>) =>
      file.isFolder &&
      ('key' in dropItem || canDropOnFileBrowser(file.key)) &&
      !selectedFiles.find((selectedFile) => selectedFile.key.value === file.key),
    collect: (monitor) => ({
      isOver: monitor.canDrop() && monitor.isOver()
    })
  })

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setAnchorEvent(event)
    if (selectedFiles.length <= 1) selectedFiles.set([file])
  }

  const handleSelectedFiles = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!files) return

    if (event.ctrlKey || event.metaKey) {
      selectedFiles.set((prevSelectedFiles) =>
        prevSelectedFiles.some((file) => file.key === file.key)
          ? prevSelectedFiles.filter((prevFile) => prevFile.key !== file.key)
          : [...prevSelectedFiles, file]
      )
    } else if (event.shiftKey) {
      const lastIndex = files.findIndex((file) => file.key === selectedFiles.value.at(-1)?.key)
      const clickedIndex = files.findIndex((prevFile) => prevFile.key === file.key)
      const newSelectedFiles = files.slice(Math.min(lastIndex, clickedIndex), Math.max(lastIndex, clickedIndex) + 1)
      selectedFiles.merge(
        newSelectedFiles.filter((newFile) => !selectedFiles.value.some((file) => newFile.key === file.key))
      )
    } else {
      if (selectedFiles.value.some((prevFile) => prevFile.key === file.key)) {
        selectedFiles.set([])
      } else {
        selectedFiles.set([file])
      }
    }
  }

  const handleFileClick = (event: React.MouseEvent) => {
    if (file.isFolder && event.detail === 2) {
      const newPath = `${filesState.selectedDirectory.value}${file.name}/`
      changeDirectoryByPath(newPath)
    } else {
      ClickPlacementState.setSelectedAsset(file.url)
    }
  }

  const commonProps: DisplayTypeProps = {
    file,
    onClick: (event: React.MouseEvent) => {
      handleSelectedFiles(event)
      handleFileClick(event)
    },
    onDoubleClick: (event: React.MouseEvent) => {
      selectedFiles.set([])
      handleFileClick(event)
    },
    isSelected: selectedFiles.value.some((selectedFile) => selectedFile.key === file.key),
    drag,
    drop,
    isOver,
    onContextMenu: handleContextMenu
  }

  return (
    <>
      {isListView ? <TableView {...commonProps} /> : <GridView {...commonProps} />}
      <FileContextMenu anchorEvent={anchorEvent} setAnchorEvent={setAnchorEvent} file={file} />
    </>
  )
}
