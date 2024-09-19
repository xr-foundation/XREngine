import React from 'react'
import { IoAccessibilityOutline } from 'react-icons/io5'
import { MdOutlineAudioFile, MdOutlinePhotoSizeSelectActual, MdOutlineViewInAr } from 'react-icons/md'
import { PiVideoCameraBold } from 'react-icons/pi'
import { twMerge } from 'tailwind-merge'

const FileIconType = {
  gltf: MdOutlineViewInAr,
  'gltf-binary': MdOutlineViewInAr,
  glb: MdOutlineViewInAr,
  vrm: IoAccessibilityOutline,
  usdz: MdOutlineViewInAr,
  fbx: MdOutlineViewInAr,
  png: MdOutlinePhotoSizeSelectActual,
  jpeg: MdOutlinePhotoSizeSelectActual,
  jpg: MdOutlinePhotoSizeSelectActual,
  ktx2: MdOutlinePhotoSizeSelectActual,
  m3u8: PiVideoCameraBold,
  mp4: PiVideoCameraBold,
  mpeg: MdOutlineAudioFile,
  mp3: MdOutlineAudioFile,
  'model/gltf-binary': MdOutlineViewInAr,
  'model/gltf': MdOutlineViewInAr,
  'model/glb': MdOutlineViewInAr,
  'model/vrm': IoAccessibilityOutline,
  'model/usdz': MdOutlineViewInAr,
  'model/fbx': MdOutlineViewInAr,
  'image/png': MdOutlinePhotoSizeSelectActual,
  'image/jpeg': MdOutlinePhotoSizeSelectActual,
  'image/jpg': MdOutlinePhotoSizeSelectActual,
  'application/pdf': null,
  'application/vnd.apple.mpegurl': PiVideoCameraBold,
  'video/mp4': PiVideoCameraBold,
  'audio/mpeg': MdOutlineAudioFile,
  'audio/mp3': MdOutlineAudioFile
}

const FOLDER_ICON_PATH = '/static/editor/folder-icon.png'
const FILE_ICON_PATH = '/static/editor/file-icon.png'

export const FileIcon = ({
  thumbnailURL,
  type,
  isFolder,
  color = 'text-white',
  isMinified = false
}: {
  thumbnailURL?: string
  type: string
  isFolder?: boolean
  color?: string
  isMinified?: boolean
}) => {
  const FallbackIcon = FileIconType[type ?? '']

  return (
    <>
      {isFolder ? (
        <img
          className={twMerge(isMinified ? 'h-4 w-4' : 'h-full w-full', 'object-contain')}
          crossOrigin="anonymous"
          src={FOLDER_ICON_PATH}
          alt="folder-icon"
        />
      ) : thumbnailURL ? (
        <img
          className={twMerge(isMinified ? 'h-4 w-4' : 'h-full w-full', 'object-contain')}
          crossOrigin="anonymous"
          src={thumbnailURL}
          alt="file-thumbnail"
        />
      ) : FallbackIcon ? (
        <FallbackIcon className={twMerge(color, isMinified ? 'h-4 w-4' : 'h-full w-full')} />
      ) : (
        <img
          className={twMerge(isMinified ? 'h-4 w-4' : 'h-full w-full', 'object-contain')}
          crossOrigin="anonymous"
          src={FILE_ICON_PATH}
          alt="file-icon"
        />
      )}
    </>
  )
}
