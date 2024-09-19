import { ItemTypes } from '@xrengine/editor/src/constants/AssetTypes'
import { AllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import React from 'react'
import FileBrowserInput from '../FileBrowser'
import { StringInputProps } from '../String'

export function FolderInput({ ...rest }: StringInputProps) {
  return <FileBrowserInput acceptFileTypes={AllFileTypes} acceptDropItems={[ItemTypes.Folder]} {...rest} />
}

FolderInput.defaultProps = {}

export default FolderInput
