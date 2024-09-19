import { ItemTypes } from '@xrengine/editor/src/constants/AssetTypes'
import { ImageFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import React from 'react'
import FileBrowserInput from '../FileBrowser'
import { StringInputProps } from '../String'

export function ImageInput({ ...rest }: StringInputProps) {
  return <FileBrowserInput acceptFileTypes={ImageFileTypes} acceptDropItems={ItemTypes.Images} {...rest} />
}

export default ImageInput
