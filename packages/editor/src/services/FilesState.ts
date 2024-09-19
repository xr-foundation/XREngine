
import { defineState, syncStateWithLocalStorage } from '@xrengine/hyperflux'
import { FileDataType } from '../constants/AssetTypes'

export const FilesViewModeState = defineState({
  name: 'FilesViewModeState',
  initial: {
    viewMode: 'icons' as 'icons' | 'list'
  },
  extension: syncStateWithLocalStorage(['viewMode'])
})

export const FilesViewModeSettings = defineState({
  name: 'FilesViewModeSettings',
  initial: {
    icons: {
      iconSize: 90
    },
    list: {
      fontSize: 15,
      selectedTableColumns: {
        name: true,
        type: true,
        dateModified: true,
        size: true
      }
    }
  },
  extension: syncStateWithLocalStorage(['icons', 'list'])
})

export const FilesState = defineState({
  name: 'FilesState',
  initial: () => ({
    selectedDirectory: '',
    projectName: '',
    clipboardFile: null as { isCopy?: boolean; file: FileDataType } | null,
    searchText: ''
  })
})

export const SelectedFilesState = defineState({
  name: 'FilesSelectedFilesState',
  initial: [] as FileDataType[]
})
