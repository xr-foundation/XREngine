
import React, { useEffect } from 'react'

import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { defineState, getMutableState, getState, NetworkID, none, useHookstate, UserID } from '@xrengine/hyperflux'

import { NetworkTopics } from './Network'
import { NetworkState } from './NetworkState'

/**
 * NetworkUserState is a state that tracks which users are in which instances
 */
export const NetworkWorldUserState = defineState({
  name: 'xrengine.engine.network.NetworkWorldUserState',
  initial: {} as Record<UserID, NetworkID[]>,

  userJoined: (userID: UserID, instanceID: NetworkID) => {
    if (!getState(NetworkWorldUserState)[userID]) getMutableState(NetworkWorldUserState)[userID].set([])
    if (!getState(NetworkWorldUserState)[userID].includes(instanceID))
      getMutableState(NetworkWorldUserState)[userID].merge([instanceID])
  },

  userLeft: (userID: UserID, instanceID: NetworkID) => {
    if (!getState(NetworkWorldUserState)[userID]) return
    getMutableState(NetworkWorldUserState)[userID].set((ids) => ids.filter((id) => id !== instanceID))
    if (getState(NetworkWorldUserState)[userID].length === 0) getMutableState(NetworkWorldUserState)[userID].set(none)
  }
})

const NetworkUserReactor = (props: { networkID: NetworkID; userID: UserID }) => {
  useEffect(() => {
    NetworkWorldUserState.userJoined(props.userID, props.networkID)
    return () => NetworkWorldUserState.userLeft(props.userID, props.networkID)
  }, [])
  return null
}

const NetworkReactor = (props: { networkID: NetworkID }) => {
  const networkUsers = useHookstate(getMutableState(NetworkState).networks[props.networkID].users)

  return (
    <>
      {networkUsers.keys.map((userID: UserID) => (
        <NetworkUserReactor networkID={props.networkID} userID={userID} key={userID} />
      ))}
    </>
  )
}

const reactor = () => {
  const worldNetworkIDs = Object.entries(useHookstate(getMutableState(NetworkState).networks).value)
    .filter(([id, network]) => network.topic === NetworkTopics.world)
    .map(([id]) => id as NetworkID)
  return (
    <>
      {worldNetworkIDs.map((networkID) => (
        <NetworkReactor networkID={networkID} key={networkID} />
      ))}
    </>
  )
}

export const NetworkWorldUserStateSystem = defineSystem({
  uuid: 'xrengine.networking.NetworkWorldUserStateSystem',
  reactor,
  insert: { with: SimulationSystemGroup }
})
