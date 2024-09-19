/* eslint-disable no-case-declarations */

import React, { useImperativeHandle } from 'react'

import { AssetExt } from '@xrengine/engine/src/assets/constants/AssetType'
import { NO_PROXY, useHookstate } from '@xrengine/hyperflux'
import createReadableTexture from '@xrengine/spatial/src/renderer/functions/createReadableTexture'

import { getTextureAsync } from '@xrengine/engine/src/assets/functions/resourceLoaderHooks'
import { AudioPreviewPanel } from './AssetPreviewPanels/AudioPreviewPanel'
import { ImagePreviewPanel } from './AssetPreviewPanels/ImagePreviewPanel'
import { JsonPreviewPanel } from './AssetPreviewPanels/JsonPreviewPanel'
import { ModelPreviewPanel } from './AssetPreviewPanels/ModelPreviewPanel'
import { PreviewUnavailable } from './AssetPreviewPanels/PreviewUnavailable'
import { TxtPreviewPanel } from './AssetPreviewPanels/TxtPreviewPanel'
import { VideoPreviewPanel } from './AssetPreviewPanels/VideoPreviewPanel'

const assetHeadingStyles = {
  textAlign: 'center',
  fontSize: '0.9rem',
  paddingBottom: '10px',
  color: '#f1f1f1'
}

interface Props {
  hideHeading?: boolean
  previewPanelProps?: any
}

type ResourceProps = {
  resourceUrl: string
  name: string
  size: string | undefined
}

export type AssetSelectionChangePropsType = ResourceProps & {
  contentType: string
}

/**
 * Used to see the Preview of the Asset in the FileBrowser Panel
 */
export const AssetsPreviewPanel = React.forwardRef(({ hideHeading, previewPanelProps, ...props }: Props, ref) => {
  useImperativeHandle(ref, () => ({ onSelectionChanged }))
  const previewPanel = useHookstate({
    PreviewSource: null as ((props: { resourceProps: ResourceProps }) => JSX.Element) | null,
    resourceProps: { resourceUrl: '', name: '', size: '' }
  })

  const thumbnail = useHookstate('')

  const onSelectionChanged = async (props: AssetSelectionChangePropsType) => {
    thumbnail.value && URL.revokeObjectURL(thumbnail.value)
    if (/ktx2$/.test(props.resourceUrl)) {
      const [texture, unload] = await getTextureAsync(props.resourceUrl)
      if (texture) {
        thumbnail.set((await createReadableTexture(texture, { url: true })) as string)
        unload()
      }
    } else {
      thumbnail.set('')
    }
    renderPreview(props)
  }

  const renderPreview = (props) => {
    console.log('props, contentType: ', props.contentType)
    switch (props.contentType) {
      case 'model/gltf':
      case 'model/gltf-binary':
      case 'model/glb':
      case AssetExt.VRM:
      case 'model/vrm':
      case AssetExt.GLB:
      case AssetExt.GLTF:
      case 'gltf-binary':
      case AssetExt.USDZ:
      case AssetExt.FBX:
        const modelPreviewPanel = {
          PreviewSource: ModelPreviewPanel,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name, size: props.size }
        }
        previewPanel.set(modelPreviewPanel)
        break
      case 'image/png':
      case 'image/jpeg':
      case 'png':
      case 'jpeg':
      case 'jpg':
        const imagePreviewPanel = {
          PreviewSource: ImagePreviewPanel,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name, size: props.size }
        }
        previewPanel.set(imagePreviewPanel)
        break
      case 'ktx2':
      case 'image/ktx2':
        const compImgPreviewPanel = {
          PreviewSource: ImagePreviewPanel,
          resourceProps: { resourceUrl: thumbnail.value, name: props.name, size: props.size }
        }
        previewPanel.set(compImgPreviewPanel)
        break

      case 'video/mp4':
      case 'mp4':
      case 'm3u8':
        const videoPreviewPanel = {
          PreviewSource: VideoPreviewPanel,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name, size: props.size }
        }
        previewPanel.set(videoPreviewPanel)
        break
      case 'audio/mpeg':
      case 'mpeg':
      case 'mp3':
        const audioPreviewPanel = {
          PreviewSource: AudioPreviewPanel,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name, size: props.size }
        }
        previewPanel.set(audioPreviewPanel)
        break
      case 'md':
      case 'ts':
      case 'js':
        const txtPreviewPanel = {
          PreviewSource: TxtPreviewPanel,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name, size: props.size }
        }
        previewPanel.set(txtPreviewPanel)
        break
      case 'json':
        const jsonPreviewPanel = {
          PreviewSource: JsonPreviewPanel,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name, size: props.size }
        }
        previewPanel.set(jsonPreviewPanel)
        break

      default:
        const unavailable = {
          PreviewSource: PreviewUnavailable,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name, size: props.size }
        }
        previewPanel.set(unavailable)
        break
    }
  }

  const PreviewSource = previewPanel.get(NO_PROXY).PreviewSource

  return (
    <>
      {!hideHeading && (
        <div style={assetHeadingStyles as React.CSSProperties}>
          {previewPanel.resourceProps.name.value &&
            previewPanel.resourceProps.size.value &&
            `${previewPanel.resourceProps.name.value} (${previewPanel.resourceProps.size.value})`}
        </div>
      )}
      {PreviewSource && <PreviewSource resourceProps={previewPanel.resourceProps.value} {...previewPanelProps} />}
    </>
  )
})
