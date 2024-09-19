
import { ECSState } from '@xrengine/ecs/src/ECSState'
import {
  defineState,
  getMutableState,
  syncStateWithLocalStorage,
  useHookstate,
  useMutableState
} from '@xrengine/hyperflux'
import Tabs, { TabProps } from '@xrengine/ui/src/primitives/tailwind/Tabs'
import React, { useEffect } from 'react'
import DebugButtons from './DebugButtons'
import { EntityDebug } from './EntityDebug'
import { StateDebug } from './StateDebug'
import { StatsPanel } from './StatsPanel'
import { SystemDebug } from './SystemDebug'

export const DebugState = defineState({
  name: 'DebugState',
  initial: {
    enabled: false,
    activeTabIndex: 0
  },
  extension: syncStateWithLocalStorage(['enabled', 'activeTabIndex'])
})

const DebugTabs = {
  None: <></>,
  All: (
    <>
      <EntityDebug />
      <SystemDebug />
      <StateDebug />
    </>
  ),
  Entities: <EntityDebug />,
  Systems: <SystemDebug />,
  State: <StateDebug />
}

const tabsData: TabProps['tabsData'] = Object.keys(DebugTabs).map((tabLabel) => ({
  tabLabel,
  bottomComponent: DebugTabs[tabLabel]
}))

const Debug = () => {
  useHookstate(getMutableState(ECSState).frameTime).value
  const activeTabIndex = useMutableState(DebugState).activeTabIndex

  return (
    <div className="pointer-events-auto fixed top-0 z-[1000] m-1 max-h-[95vh] overflow-y-auto rounded bg-neutral-700 p-0.5">
      <DebugButtons />
      <StatsPanel show />
      <Tabs
        tabsData={tabsData}
        currentTabIndex={activeTabIndex.value}
        onTabChange={(tabIndex) => activeTabIndex.set(tabIndex)}
      />
    </div>
  )
}

export const DebugToggle = () => {
  const isShowing = useHookstate(getMutableState(DebugState).enabled)

  useEffect(() => {
    function downHandler({ keyCode }) {
      if (keyCode === 192) {
        isShowing.set(!isShowing.value)
      }
    }
    window.addEventListener('keydown', downHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [])

  return isShowing.value ? <Debug /> : <></>
}

export default DebugToggle
