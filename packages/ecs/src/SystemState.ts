import { defineState, isDev, ReactorRoot } from '@xrengine/hyperflux'

import { Query, QueryComponents } from './QueryFunctions'
import { SystemUUID } from './SystemFunctions'

export const SystemState = defineState({
  name: 'xrengine.meta.SystemState',
  initial: () => ({
    performanceProfilingEnabled: isDev,
    activeSystemReactors: new Map<SystemUUID, ReactorRoot>(),
    currentSystemUUID: '__null__' as SystemUUID,
    reactiveQueryStates: new Set<{ query: Query; forceUpdate: () => void; components: QueryComponents }>()
  })
})
