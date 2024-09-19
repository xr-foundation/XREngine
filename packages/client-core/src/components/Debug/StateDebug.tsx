
import React from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { ECSState } from '@xrengine/ecs/src/ECSState'
import { Engine } from '@xrengine/ecs/src/Engine'
import {
  defineState,
  getMutableState,
  NO_PROXY,
  NO_PROXY_STEALTH,
  StateDefinitions,
  syncStateWithLocalStorage,
  useHookstate
} from '@xrengine/hyperflux'
import { NetworkState } from '@xrengine/network'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'

const labelRenderer = (data: Record<string | number, any>) => {
  return (keyPath: (string | number)[], ...args) => {
    const key = keyPath[0]
    if (keyPath.length === 2 && typeof key === 'number') {
      return <Text fontWeight="medium">{Array.isArray(data[key].type) ? data[key].type[0] : data[key].type}</Text>
    }
    if (keyPath.length === 4 && typeof key === 'number') {
      const actions = data[keyPath[2]].actions
      return (
        <Text fontWeight="medium">{Array.isArray(actions[key].type) ? actions[key].type[0] : actions[key].type}</Text>
      )
    }
    return <Text fontWeight="medium">{key}</Text>
  }
}

const StateSearchState = defineState({
  name: 'StateSearchState',
  initial: {
    search: ''
  },
  extension: syncStateWithLocalStorage(['search'])
})

export function StateDebug() {
  useHookstate(getMutableState(ECSState).frameTime).value
  const { t } = useTranslation()

  const stateSearch = useHookstate(getMutableState(StateSearchState).search)

  const state =
    stateSearch.value === ''
      ? Engine.instance.store.stateMap
      : Object.fromEntries(
          Object.entries(Engine.instance.store.stateMap)
            .filter(([key]) => key.toLowerCase().includes(stateSearch.value.toLowerCase()))
            .map(([key, value]) => [key, value.get(NO_PROXY_STEALTH)])
        )

  const actionHistory = [...Engine.instance.store.actions.history].sort((a, b) => a.$time - b.$time)
  const cachedHistory = [...Engine.instance.store.actions.cached].sort((a, b) => a.$time - b.$time)
  const eventSourcedHistory = Object.fromEntries(
    [...StateDefinitions.entries()]
      .filter(([name, state]) => state.receptorActionQueue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [key, value.receptorActionQueue!.instance])
  )
  const networks = useHookstate(getMutableState(NetworkState).networks).get(NO_PROXY)

  return (
    <div className="m-1 bg-neutral-600 p-1">
      <div className="my-0.5">
        <Text>{t('common:debug.state')}</Text>
        <Input
          containerClassName="my-0.5"
          type="text"
          placeholder="Search..."
          value={stateSearch.value}
          onChange={(event) => stateSearch.set(event.target.value)}
        />
        <JSONTree data={state} />
      </div>
      <div className="my-0.5">
        <h1>{t('common:debug.eventSourcedState')}</h1>
        <JSONTree
          data={eventSourcedHistory}
          labelRenderer={labelRenderer(eventSourcedHistory)}
          shouldExpandNodeInitially={() => false}
        />
      </div>
      <div className="my-0.5">
        <h1>{t('common:debug.networks')}</h1>
        <JSONTree data={networks} shouldExpandNodeInitially={() => false} />
      </div>
      <div className="my-0.5">
        <h1>{t('common:debug.actionsHistory')}</h1>
        <JSONTree
          data={actionHistory}
          labelRenderer={labelRenderer(actionHistory)}
          shouldExpandNodeInitially={() => false}
        />
      </div>
      <div className="my-0.5">
        <h1>{t('common:debug.actionsCached')}</h1>
        <JSONTree
          data={cachedHistory}
          labelRenderer={labelRenderer(cachedHistory)}
          shouldExpandNodeInitially={() => false}
        />
      </div>
    </div>
  )
}
