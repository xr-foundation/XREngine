
import React from 'react'
import { useDrop } from 'react-dnd'

import config from '@xrengine/common/src/config'
//import useUpload from '../assets/useUpload'
import useUpload from '@xrengine/editor/src/components/assets/useUpload'
import { ItemTypes } from '@xrengine/editor/src/constants/AssetTypes'
import { AllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { ControlledStringInput, StringInputProps } from '../String'

export type FileBrowserInputProps = StringInputProps & { acceptFileTypes: string[]; acceptDropItems: string[] }

/**
 * Function component used for rendering FileBrowserInput.
 */
export function FileBrowserInput({
  onRelease,
  value,
  acceptFileTypes,
  acceptDropItems,
  ...rest
}: FileBrowserInputProps) {
  const uploadOptions = {
    multiple: false,
    accepts: acceptFileTypes
  }
  const onUpload = useUpload(uploadOptions)

  // todo fix for invalid URLs
  const assetIsExternal = value && !value?.includes(config.client.fileServer) && !value.includes('blob:https://')
  const uploadExternalAsset = () => {
    onUpload([
      {
        isFile: true,
        name: value?.split('/').pop(),
        file: async (onSuccess, onFail) => {
          try {
            const asset = await fetch(value!)
            const blob = await asset.blob()
            const file = new File([blob], value!.split('/').pop()!)
            onSuccess(file)
          } catch (error) {
            if (onFail) onFail(error)
            else throw error
          }
        }
      } as Partial<FileSystemFileEntry>
    ] as any).then((assets) => {
      if (assets) {
        onRelease?.(assets[0])
      }
    })
  }

  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: [...acceptDropItems, ItemTypes.File],
    async drop(item: any, monitor) {
      const isDropType = acceptDropItems.find((element) => element === item.type)
      if (isDropType) {
        onRelease?.(item.url)
      } else {
        // https://github.com/react-dnd/react-dnd/issues/1345#issuecomment-538728576
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        onUpload(entries).then((assets) => {
          if (assets) {
            onRelease?.(assets[0])
          }
        })
      }
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    })
  })

  return (
    <>
      <ControlledStringInput ref={dropRef} value={value} onRelease={onRelease} {...rest} />
      {/*assetIsExternal && (
        <IconButton
          disableRipple
          style={{
            padding: 0
          }}
          onClick={uploadExternalAsset}
        >
          <Icon type="Download" style={{ color: 'var(--textColor)' }} />
        </IconButton>
      )*/}
    </>
  )
}

FileBrowserInput.defaultProps = {
  acceptFileTypes: AllFileTypes,
  acceptDropItems: AllFileTypes
}

export default FileBrowserInput
