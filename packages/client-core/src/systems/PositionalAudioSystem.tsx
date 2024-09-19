
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { Not } from 'bitecs'
import React, { useEffect } from 'react'
import { Vector3 } from 'three'

import { ComponentType, getComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { QueryReactor, defineQuery } from '@xrengine/ecs/src/QueryFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { MediaSettingsState } from '@xrengine/engine/src/audio/MediaSettingsState'
import { getMutableState, getState, useHookstate } from '@xrengine/hyperflux'
import { NetworkObjectComponent, NetworkObjectOwnedTag, NetworkState } from '@xrengine/network'
import { TransformComponent } from '@xrengine/spatial/src/transform/components/TransformComponent'

import { AudioState } from '@xrengine/engine/src/audio/AudioState'
import {
  addPannerNode,
  removePannerNode,
  updateAudioPanner
} from '@xrengine/engine/src/audio/PositionalAudioFunctions'
import { PositionalAudioComponent } from '@xrengine/engine/src/audio/components/PositionalAudioComponent'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { getAvatarBoneWorldPosition } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
import {
  AudioNodeGroups,
  MediaElementComponent,
  createAudioNodeGroup
} from '@xrengine/engine/src/scene/components/MediaComponent'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import { PeerMediaChannelState } from '../media/PeerMediaChannelState'

const _vec3 = new Vector3()
const _rot = new Vector3()

/**
 * Scene Objects
 */
const positionalAudioQuery = defineQuery([PositionalAudioComponent, MediaElementComponent, TransformComponent])

/**
 * Avatars
 */
const networkedAvatarAudioQuery = defineQuery([AvatarComponent, NetworkObjectComponent, Not(NetworkObjectOwnedTag)])

/** Weak map entry is automatically GC'd when network object is removed */
const avatarAudioStreams: WeakMap<ComponentType<typeof NetworkObjectComponent>, MediaStream> = new WeakMap()

const execute = () => {
  const audioState = getState(AudioState)
  const audioContext = audioState.audioContext
  if (!audioContext) return

  const network = NetworkState.mediaNetwork
  const mediaSettings = getState(MediaSettingsState)
  const immersiveMedia = mediaSettings.immersiveMedia

  /**
   * Scene Objects
   */

  /**
   * No need to update pose of positional audio objects if the audio context is not running
   */
  if (audioContext.state !== 'running') return

  const peerMediaState = getState(PeerMediaChannelState)

  /**
   * Avatars
   * lazily detect when consumers are created and destroyed
   */
  const networkedAvatarAudioEntities = networkedAvatarAudioQuery()
  for (const entity of networkedAvatarAudioEntities) {
    if (!network) continue

    const networkObject = getComponent(entity, NetworkObjectComponent)
    const ownerID = networkObject.ownerId
    const peers = Object.values(network.peers).filter((peer) => peer.userId === ownerID)

    const peer = peers.find((peer) => Object.keys(peerMediaState).includes(peer.peerID))
    if (!peer) {
      if (avatarAudioStreams.has(networkObject)) avatarAudioStreams.delete(networkObject)
      continue
    }

    const videoMediaStream = peerMediaState[peer.peerID].cam.videoMediaStream
    if (!videoMediaStream) {
      if (avatarAudioStreams.has(networkObject)) avatarAudioStreams.delete(networkObject)
      continue
    }
    const track = videoMediaStream.getVideoTracks()[0]

    // avatar still exists but audio stream does not
    if (!track) {
      if (avatarAudioStreams.has(networkObject)) avatarAudioStreams.delete(networkObject)
      continue
    }

    const existingAudioObj = avatarAudioStreams.get(networkObject)

    if (existingAudioObj) {
      // only force positional audio for avatar media streams in XR
      const audioNodes = AudioNodeGroups.get(existingAudioObj)!
      if (audioNodes.panner && !immersiveMedia) removePannerNode(audioNodes)
      else if (!audioNodes.panner && immersiveMedia) addPannerNode(audioNodes, mediaSettings)

      // audio stream exists and has already been handled
      continue
    }

    // get existing stream - need to wait for UserWindowMedia to populate
    /** @todo we need to properly handle this */
    const existingAudioObject = document.getElementById(`${ownerID}_audio`)! as HTMLAudioElement
    if (!existingAudioObject) continue

    // mute existing stream
    existingAudioObject.muted = true
    // todo, refactor this out of event listener
    existingAudioObject.addEventListener('volumechange', () => {
      audioNodes.gain.gain.setTargetAtTime(existingAudioObject.volume, audioContext.currentTime, 0.01)
    })

    // audio streams exists but has not been handled
    const stream = new MediaStream([track.clone()])

    const audioNodes = createAudioNodeGroup(
      stream,
      audioContext.createMediaStreamSource(stream),
      audioState.gainNodeMixBuses.mediaStreams
    )
    audioNodes.gain.gain.setTargetAtTime(existingAudioObject.volume, audioContext.currentTime, 0.01)

    if (immersiveMedia) addPannerNode(audioNodes, mediaSettings)

    avatarAudioStreams.set(networkObject, stream)
  }

  const endTime = audioContext.currentTime + getState(ECSState).deltaSeconds

  /**
   * Update panner nodes
   */
  for (const entity of positionalAudioQuery()) {
    const element = getComponent(entity, MediaElementComponent).element
    const { position, rotation } = getComponent(entity, TransformComponent)
    const positionalAudio = getComponent(entity, PositionalAudioComponent)
    const audioObject = AudioNodeGroups.get(element)!
    audioObject.panner && updateAudioPanner(audioObject.panner, position, rotation, endTime, positionalAudio)
  }

  /** @todo, only apply this to closest 8 (configurable) avatars #7261 */

  for (const entity of networkedAvatarAudioEntities) {
    const networkObject = getComponent(entity, NetworkObjectComponent)

    const audioObj = avatarAudioStreams.get(networkObject)!
    if (!audioObj) continue

    const panner = AudioNodeGroups.get(audioObj)?.panner
    if (!panner) continue

    getAvatarBoneWorldPosition(entity, VRMHumanBoneName.Head, _vec3)
    const { rotation } = getComponent(entity, TransformComponent)

    updateAudioPanner(panner, _vec3, rotation, endTime, mediaSettings)
  }

  const viewerEntity = getState(EngineState).viewerEntity
  if (!viewerEntity) return

  /**
   * Update camera listener position
   */
  const { position, rotation } = getComponent(viewerEntity, TransformComponent)
  if (isNaN(position.x)) return
  _rot.set(0, 0, -1).applyQuaternion(rotation)
  if (isNaN(_rot.x)) return
  // firefox only supports the deprecated API
  if (!audioContext.listener.positionX) {
    audioContext.listener.setPosition(position.x, position.y, position.z)
    audioContext.listener.setOrientation(_rot.x, _rot.y, _rot.z, 0, 1, 0)
    return
  }
  audioContext.listener.positionX.linearRampToValueAtTime(position.x, endTime)
  audioContext.listener.positionY.linearRampToValueAtTime(position.y, endTime)
  audioContext.listener.positionZ.linearRampToValueAtTime(position.z, endTime)
  audioContext.listener.forwardX.linearRampToValueAtTime(_rot.x, endTime)
  audioContext.listener.forwardY.linearRampToValueAtTime(_rot.y, endTime)
  audioContext.listener.forwardZ.linearRampToValueAtTime(_rot.z, endTime)

  /** @todo support different world ups */
  // audioContext.listener.upX.linearRampToValueAtTime(camera.up.x, endTime)
  // audioContext.listener.upY.linearRampToValueAtTime(camera.up.y, endTime)
  // audioContext.listener.upZ.linearRampToValueAtTime(camera.up.z, endTime)
}

function PositionalAudioPannerReactor() {
  const entity = useEntityContext()
  const mediaElement = useComponent(entity, MediaElementComponent)
  const positionalAudio = useComponent(entity, PositionalAudioComponent)

  useEffect(() => {
    const audioGroup = AudioNodeGroups.get(mediaElement.element.value as HTMLMediaElement)! // is it safe to assume this?
    addPannerNode(audioGroup, positionalAudio.value)
    return () => removePannerNode(audioGroup)
  }, [mediaElement, positionalAudio])

  return null
}

const reactor = () => {
  const mediaStreamVolume = useHookstate(getMutableState(AudioState).mediaStreamVolume)

  /**
   * Update avatar volume when the value is changed
   */
  useEffect(() => {
    const audioContext = getState(AudioState).audioContext

    for (const entity of networkedAvatarAudioQuery()) {
      const networkObject = getComponent(entity, NetworkObjectComponent)
      const audioObj = avatarAudioStreams.get(networkObject)!
      if (!audioObj) continue
      const gain = AudioNodeGroups.get(audioObj)?.gain
      if (gain) gain.gain.setTargetAtTime(mediaStreamVolume.value, audioContext.currentTime, 0.01)
    }
  }, [mediaStreamVolume])

  return (
    <QueryReactor
      Components={[PositionalAudioComponent, TransformComponent]}
      ChildEntityReactor={PositionalAudioPannerReactor}
    />
  )
}

export const PositionalAudioSystem = defineSystem({
  uuid: 'xrengine.engine.PositionalAudioSystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor
})
