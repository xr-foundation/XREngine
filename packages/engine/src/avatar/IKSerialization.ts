
import { hasComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { Entity } from '@xrengine/ecs/src/Entity'
import { getState } from '@xrengine/hyperflux'
import {
  checkBitflag,
  NetworkObjectSendPeriodicUpdatesTag,
  readComponentProp,
  readUint8,
  rewindViewCursor,
  spaceUint8,
  ViewCursor,
  writePropIfChanged
} from '@xrengine/network'

import { AvatarIKTargetComponent } from './components/AvatarIKComponents'

export const readBlendWeight = (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint8(v)
  let b = 0
  if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, AvatarIKTargetComponent.blendWeight, entity)
}

export const writeBlendWeight = (v: ViewCursor, entity: Entity) => {
  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  const ignoreHasChanged =
    hasComponent(entity, NetworkObjectSendPeriodicUpdatesTag) &&
    Math.round(getState(ECSState).simulationTime % getState(ECSState).periodicUpdateFrequency) === 0

  changeMask |= writePropIfChanged(v, AvatarIKTargetComponent.blendWeight, entity, ignoreHasChanged)
    ? 1 << b++
    : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const IKSerialization = {
  ID: 'xrengine.engine.avatar.ik' as const,
  readBlendWeight,
  writeBlendWeight
}
