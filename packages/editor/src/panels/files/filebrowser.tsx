
import { useMutableState } from '@xrengine/hyperflux'
import React, { useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'
import { twMerge } from 'tailwind-merge'
import { SupportedFileTypes } from '../../constants/AssetTypes'
import { EditorState } from '../../services/EditorServices'
import { FilesState, FilesViewModeState, SelectedFilesState } from '../../services/FilesState'
import { ClickPlacementState } from '../../systems/ClickPlacementSystem'
import { BrowserContextMenu } from './contextmenu'
import FileItem, { TableWrapper } from './fileitem'
import { CurrentFilesQueryProvider, canDropOnFileBrowser, useCurrentFiles, useFileBrowserDrop } from './helpers'
import FilesLoaders from './loaders'
import FilesToolbar from './toolbar'

function Browser() {
  const [anchorEvent, setAnchorEvent] = useState<undefined | React.MouseEvent>(undefined)
  const dropOnFileBrowser = useFileBrowserDrop()
  const filesState = useMutableState(FilesState)
  const [{ isFileDropOver }, fileDropRef] = useDrop({
    accept: [...SupportedFileTypes],
    drop: (dropItem) => dropOnFileBrowser(dropItem as any),
    canDrop: () => canDropOnFileBrowser(filesState.selectedDirectory.value),
    collect: (monitor) => ({ isFileDropOver: monitor.canDrop() && monitor.isOver() })
  })
  const isListView = useMutableState(FilesViewModeState).viewMode.value === 'list'
  const selectedFiles = useMutableState(SelectedFilesState)
  const { files } = useCurrentFiles()

  const FileItems = () => (
    <>
      {files.map((file) => (
        <FileItem file={file} key={file.key} />
      ))}
    </>
  )

  return (
    <div
      className={twMerge('h-full', isFileDropOver ? 'border-2 border-gray-300' : '')}
      ref={fileDropRef}
      onContextMenu={(event) => {
        event.preventDefault()
        event.stopPropagation()
        setAnchorEvent(event)
      }}
    >
      <div
        className={twMerge('mb-2 h-auto px-3 pb-6 text-gray-400 ', !isListView && 'flex py-8')}
        onClick={(event) => {
          event.stopPropagation()
          selectedFiles.set([])
          ClickPlacementState.resetSelectedAsset()
        }}
      >
        <div className={twMerge(!isListView && 'flex flex-wrap gap-2')}>
          {isListView ? (
            <TableWrapper>
              <FileItems />
            </TableWrapper>
          ) : (
            <FileItems />
          )}
        </div>
      </div>
      <BrowserContextMenu anchorEvent={anchorEvent} setAnchorEvent={setAnchorEvent} />
    </div>
  )
}

export default function FileBrowser() {
  const filesState = useMutableState(FilesState)

  const projectName = useMutableState(EditorState).projectName.value
  useEffect(() => {
    if (projectName) {
      filesState.merge({ selectedDirectory: `/projects/${projectName}/`, projectName: projectName })
    }
  }, [projectName])

  return (
    <CurrentFilesQueryProvider>
      <FilesToolbar />
      <FilesLoaders />
      <Browser />
    </CurrentFilesQueryProvider>
  )
}
