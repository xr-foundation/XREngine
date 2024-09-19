import { hasComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import {
  checkBitflag,
  readUint8,
  readVector3,
  readVector4,
  rewindViewCursor,
  spaceUint8,
  ViewCursor,
  writeVector3,
  writeVector4
} from '@xrengine/network'

import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { TransformComponent } from './components/TransformComponent'

export const readPosition = readVector3(TransformComponent.position)
export const readRotation = readVector4(TransformComponent.rotation) //readCompressedRotation(TransformComponent.rotation) //readVector4(TransformComponent.rotation)

export const readTransform = (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint8(v)
  let b = 0
  if (checkBitflag(changeMask, 1 << b++)) readPosition(v, entity)
  if (checkBitflag(changeMask, 1 << b++)) readRotation(v, entity)
  TransformComponent.dirtyTransforms[entity] = true
}

export const writePosition = writeVector3(TransformComponent.position)
export const writeRotation = writeVector4(TransformComponent.rotation)

export const writeTransform = (v: ViewCursor, entity: Entity) => {
  if (!hasComponent(entity, TransformComponent) || hasComponent(entity, RigidBodyComponent)) return

  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  changeMask |= writePosition(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeRotation(v, entity) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const TransformSerialization = {
  ID: 'xrengine.core.transform' as const,
  readTransform,
  writeTransform
}
