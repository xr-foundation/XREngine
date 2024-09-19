import { BsStars } from 'react-icons/bs'
import { FaRegCircle } from 'react-icons/fa6'
import { FiSun } from 'react-icons/fi'
import { LuWaves } from 'react-icons/lu'
import { PiMountains } from 'react-icons/pi'
import { RxCube } from 'react-icons/rx'
import { TbMaximize, TbRoute } from 'react-icons/tb'

import React from 'react'

export const iconMap: { [key: string]: React.ReactElement } = {
  Model: <RxCube />,
  Material: <FaRegCircle />,
  Texture: <LuWaves />,
  Image: <PiMountains />,
  Lighting: <FiSun />,
  'Particle system': <BsStars />,
  'Visual script': <TbRoute />
}

const defaultIcon = <TbMaximize />

export const AssetIconMap = ({ name }): React.ReactElement => {
  return <div className="flex h-4 w-4 items-center justify-center">{iconMap[name] ?? defaultIcon}</div>
}
