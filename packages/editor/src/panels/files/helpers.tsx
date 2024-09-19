
import { ImmutableArray } from '@hookstate/core'
import { FileThumbnailJobState } from '@xrengine/client-core/src/common/services/FileThumbnailJobState'
import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import { useFind, useMutation, useRealtime, useSearch } from '@xrengine/common'
import {
  StaticResourceType,
  UserID,
  fileBrowserPath,
  staticResourcePath
} from '@xrengine/common/src/schema.type.module'
import { CommonKnownContentTypes } from '@xrengine/common/src/utils/CommonKnownContentTypes'
import { bytesToSize } from '@xrengine/common/src/utils/btyesToSize'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { NO_PROXY, useMutableState } from '@xrengine/hyperflux'
import React, { ReactNode, createContext, useContext } from 'react'
import { DnDFileType, FileDataType } from '../../constants/AssetTypes'
import { handleUploadFiles } from '../../functions/assetFunctions'
import { FilesState } from '../../services/FilesState'

/* CONSTANTS */

export const FILES_PAGE_LIMIT = 100 as const

export const availableTableColumns = ['name', 'type', 'dateModified', 'size'] as const

/* HOOKS */

const FilesQueryContext = createContext({
  filesQuery: null as null | ReturnType<typeof useFind<'file-browser'>>,
  files: [] as FileDataType[],
  changeDirectoryByPath: (_path: string) => {},
  backDirectory: () => {},
  refreshDirectory: async () => {},
  createNewFolder: () => {}
})

export const CurrentFilesQueryProvider = ({ children }: { children?: ReactNode }) => {
  const filesState = useMutableState(FilesState)

  const filesQuery = useFind(fileBrowserPath, {
    query: {
      $limit: FILES_PAGE_LIMIT,
      directory: filesState.selectedDirectory.value
    }
  })

  const fileService = useMutation(fileBrowserPath)

  useSearch(
    filesQuery,
    {
      key: {
        $like: `%${filesState.searchText.value}%`
      }
    },
    filesState.searchText.value
  )

  const changeDirectoryByPath = (path: string) => {
    filesState.merge({ selectedDirectory: path })
    filesQuery.setPage(0)
  }

  const backDirectory = () => {
    const pattern = /([^/]+)/g
    const result = filesState.selectedDirectory.value.match(pattern)
    if (!result || result.length === 1) return
    let newPath = '/'
    for (let i = 0; i < result.length - 1; i++) {
      newPath += result[i] + '/'
    }
    changeDirectoryByPath(newPath)
  }

  const refreshDirectory = async () => {
    await filesQuery.refetch()
  }

  const createNewFolder = () => fileService.create(`${filesState.selectedDirectory.value}New-Folder`)

  const files = filesQuery.data.map((file) => {
    const isFolder = file.type === 'folder'
    const fullName = isFolder ? file.name : file.name + '.' + file.type

    return {
      ...file,
      size: file.size ? bytesToSize(file.size) : '0',
      path: isFolder ? file.key.split(file.name)[0] : file.key.split(fullName)[0],
      fullName,
      isFolder
    }
  })

  useRealtime(staticResourcePath, filesQuery.refetch)
  FileThumbnailJobState.useGenerateThumbnails(filesQuery.data)

  return (
    <FilesQueryContext.Provider
      value={{ filesQuery, files, changeDirectoryByPath, backDirectory, refreshDirectory, createNewFolder }}
    >
      {children}
    </FilesQueryContext.Provider>
  )
}

export const useCurrentFiles = () => useContext(FilesQueryContext)

function isFileDataType(value: any): value is FileDataType {
  return value && value.key
}

export function useFileBrowserDrop() {
  const filesState = useMutableState(FilesState)
  const currentFiles = useCurrentFiles()
  const fileService = useMutation(fileBrowserPath)
  const isLoading = currentFiles.filesQuery?.status === 'pending'

  const moveContent = async (
    oldName: string,
    newName: string,
    oldPath: string,
    newPath: string,
    isCopy = false
  ): Promise<void> => {
    if (isLoading) return
    try {
      await fileService.update(null, {
        oldProject: filesState.projectName.value,
        newProject: filesState.projectName.value,
        oldName,
        newName,
        oldPath,
        newPath,
        isCopy
      })

      await currentFiles.refreshDirectory()
    } catch (error) {
      console.error('Error moving file:', error)
      NotificationService.dispatchNotify((error as Error).message, { variant: 'error' })
    }
  }

  const dropItemsOnFileBrowser = async (
    data: FileDataType | DnDFileType,
    dropOn?: FileDataType,
    selectedFileKeys?: string[]
  ) => {
    const destinationPath = dropOn?.isFolder ? `${dropOn.key}/` : filesState.selectedDirectory.value

    if (isFileDataType(data)) {
      if (dropOn?.isFolder) {
        const newName = data.isFolder ? data.name : `${data.name}${data.type ? '.' + data.type : ''}`
        await moveContent(data.fullName, newName, data.path, destinationPath, false)
      }
    } else if (selectedFileKeys && selectedFileKeys.length > 0) {
      await Promise.all(
        selectedFileKeys.map(async (fileKey) => {
          const file = currentFiles.files.find((f) => f.key === fileKey)
          if (file) {
            const newName = file.isFolder ? file.name : `${file.name}${file.type ? '.' + file.type : ''}`
            await moveContent(file.fullName, newName, file.path, destinationPath, false)
          }
        })
      )
    } else {
      const path = filesState.selectedDirectory.get(NO_PROXY).slice(1)
      const filesToUpload = [] as File[]

      await Promise.all(
        data.files.map(async (file) => {
          const assetType = !file.type || file.type.length === 0 ? AssetLoader.getAssetType(file.name) : file.type
          if (!assetType || assetType === file.name) {
            await fileService.create(`${destinationPath}${file.name}`)
          } else {
            filesToUpload.push(file)
          }
        })
      )

      if (filesToUpload.length) {
        try {
          await handleUploadFiles(filesState.projectName.value, path, filesToUpload)
        } catch (err) {
          NotificationService.dispatchNotify(err.message, { variant: 'error' })
        }
      }
    }

    await currentFiles.refreshDirectory()
  }

  return dropItemsOnFileBrowser
}

/* UTILITIES */

export const createFileDigest = (files: ImmutableArray<FileDataType>): FileDataType => {
  const digest: FileDataType = {
    key: '',
    path: '',
    name: '',
    fullName: '',
    url: '',
    type: '',
    isFolder: false
  }
  for (const key in digest) {
    const allValues = new Set(files.map((file) => file[key]))
    if (allValues.size === 1) {
      digest[key] = Array.from(allValues).pop()
    }
  }
  return digest
}

export const createStaticResourceDigest = (staticResources: ImmutableArray<StaticResourceType>): StaticResourceType => {
  const digest: StaticResourceType = {
    id: '',
    key: '',
    mimeType: '',
    hash: '',
    type: '',
    project: '',
    // dependencies: '',
    attribution: '',
    licensing: '',
    description: '',
    // stats: '',
    thumbnailKey: '',
    thumbnailMode: '',
    updatedBy: '' as UserID,
    createdAt: '',
    updatedAt: '',

    url: '',
    userId: '' as UserID
  }
  for (const key in digest) {
    const allValues = new Set(staticResources.map((resource) => resource[key]))
    if (allValues.size === 1) {
      digest[key] = Array.from(allValues).pop()
    }
  }
  const allTags: string[] = Array.from(new Set(staticResources.flatMap((resource) => resource.tags))).filter(
    (tag) => tag != null
  ) as string[]
  const commonTags = allTags.filter((tag) => staticResources.every((resource) => resource.tags?.includes(tag)))
  digest.tags = commonTags
  return digest
}

export function fileConsistsOfContentType(files: readonly FileDataType[], contentType: string): boolean {
  return files.every((file) => {
    if (file.isFolder) {
      return contentType.startsWith('image')
    } else {
      const guessedType: string = CommonKnownContentTypes[file.type]
      return guessedType?.startsWith(contentType)
    }
  })
}

export const canDropOnFileBrowser = (folderName: string) =>
  folderName.endsWith('/assets') ||
  folderName.indexOf('/assets/') !== -1 ||
  folderName.endsWith('/public') ||
  folderName.indexOf('/public/') !== -1
