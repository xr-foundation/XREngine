
import config from '@xrengine/common/src/config'
import { useGLTF } from '@xrengine/engine/src/assets/functions/resourceLoaderHooks'
import { defineState, getMutableState, useHookstate } from '@xrengine/hyperflux'
import React, { ReactNode } from 'react'

import CameraIcon from './icons/camera.svg'
import ColliderIcon from './icons/collider.svg'
import AddIcon from './icons/empty.svg'
import GeoIcon from './icons/geo.svg'
import ImageIcon from './icons/image.svg'
import LightingIcon from './icons/lighting.svg'
import LookDevIcon from './icons/lookdev.svg'
import TextIcon from './icons/text.svg'
import VideoIcon from './icons/video.svg'

export type PrefabShelfItem = {
  name: string
  url: string
  category: string
  detail?: string
}

export const PrefabIcons: Record<string, ReactNode> = {
  Geo: <img src={GeoIcon} />,
  Lighting: <img src={LightingIcon} />,
  Collider: <img src={ColliderIcon} />,
  Text: <img src={TextIcon} />,
  Image: <img src={ImageIcon} />,
  Video: <img src={VideoIcon} />,
  Lookdev: <img src={LookDevIcon} />,
  Camera: <img src={CameraIcon} />,
  default: <img src={AddIcon} />
}

export const PrefabShelfState = defineState({
  name: 'xrengine.editor.PrefabShelfItem',
  initial: () =>
    [
      {
        name: '3D Model',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/3d-model.prefab.gltf`,
        category: 'Geo',
        detail: 'Blank 3D model ready for your own assets'
      },
      {
        name: 'Primitive Geometry',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/geo.prefab.gltf`,
        category: 'Geo'
      },
      {
        name: 'Ground Plane',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/ground-plane.prefab.gltf`,
        category: 'Geo'
      },
      {
        name: 'Point Light',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/point-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Spot Light',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/spot-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Directional Light',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/directional-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Ambient Light',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/ambient-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Hemisphere Light',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/hemisphere-light.prefab.gltf`,
        category: 'Lighting'
      },
      {
        name: 'Box Collider',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/box-collider.prefab.gltf`,
        category: 'Collider',
        detail: 'Simple box collider'
      },
      {
        name: 'Sphere Collider',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/sphere-collider.prefab.gltf`,
        category: 'Collider',
        detail: 'Simple sphere collider'
      },
      {
        name: 'Cylinder Collider',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/cylinder-collider.prefab.gltf`,
        category: 'Collider',
        detail: 'Simple cylinder collider'
      },
      {
        name: 'Text',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/text.prefab.gltf`,
        category: 'Text'
      },
      {
        name: 'Title',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/title.prefab.gltf`,
        category: 'Text'
      },
      {
        name: 'Body',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/body.prefab.gltf`,
        category: 'Text'
      },
      {
        name: 'Image',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/image.prefab.gltf`,
        category: 'Image'
      },
      {
        name: 'Video',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/video.prefab.gltf`,
        category: 'Video'
      },
      {
        name: 'Skybox',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/skybox.prefab.gltf`,
        category: 'Lookdev'
      },
      {
        name: 'Postprocessing',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/postprocessing.prefab.gltf`,
        category: 'Lookdev'
      },
      {
        name: 'Fog',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/fog.prefab.gltf`,
        category: 'Lookdev'
      },
      {
        name: 'Camera',
        url: `${config.client.fileServer}/projects/xrengine/default-project/assets/prefabs/camera.prefab.gltf`,
        category: 'Camera'
      }
    ] as PrefabShelfItem[],
  reactor: () => {
    const shelfState = useHookstate(getMutableState(PrefabShelfState))
    return shelfState.value.map((shelfItem) => <ShelfItemReactor key={shelfItem.url} url={shelfItem.url} />)
  }
})

const ShelfItemReactor = (props: { key: string; url: string }): JSX.Element | null => {
  useGLTF(props.url)
  return null
}
