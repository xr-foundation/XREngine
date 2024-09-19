import { LogParamsObject } from '@xrengine/common/src/logger'
import { defineState, getMutableState, getState, none } from '@xrengine/hyperflux'
import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const ClientContextState = defineState({
  name: 'xrengine.client-core.ClientContextState',
  initial: {},
  useValue: (key: string, value: any) => {
    useEffect(() => {
      getMutableState(ClientContextState).merge({ [key]: value })
      return () => {
        getMutableState(ClientContextState)[key].set(none)
      }
    }, [key, value])
  }
})

/**
 * @function clientContextParams
 * @description This function will collect contextual parameters
 * from url's query params
 */
export function clientContextParams(params: LogParamsObject) {
  const contextState = getState(ClientContextState)
  return {
    ...params,
    event_id: uuidv4(),
    ...contextState
  }
}
