
import { ItemTypes } from '@xrengine/editor/src/constants/AssetTypes'
import { AudioFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import React from 'react'
import { FileBrowserInput } from '../FileBrowser'
import { StringInputProps } from '../String'

export function AudioInput({ ...rest }: StringInputProps) {
  return <FileBrowserInput acceptFileTypes={AudioFileTypes} acceptDropItems={ItemTypes.Audios} {...rest} />
}

export default AudioInput
