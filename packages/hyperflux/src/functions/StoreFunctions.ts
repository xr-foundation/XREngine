import { State } from '@hookstate/core'
import { v4 as uuidv4 } from 'uuid'

import { PeerID, UserID } from '../types/Types'
import { ActionQueueHandle, ActionQueueInstance, ResolvedActionType, Topic } from './ActionFunctions'
import { ReactorReconciler, ReactorRoot } from './ReactorFunctions'

export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never
export interface HyperStore {
  /**
   * The topic to dispatch to when none are supplied
   */
  defaultTopic: Topic
  /**
   *  Topics that should forward their incoming actions to the outgoing queue.
   */
  forwardingTopics: Set<Topic>
  /**
   * The agent id
   */
  peerID: PeerID
  /**
   * The uuid of the logged-in user
   */
  userID: UserID
  /**
   * A function which returns the current dispatch time (units are arbitrary)
   */
  getDispatchTime: () => number
  /**
   * A function which returns the current reactor root context
   **/
  getCurrentReactorRoot: () => ReactorRoot | undefined
  /**
   * The default dispatch delay (default is 0)
   */
  defaultDispatchDelay: () => number
  /**
   * State dictionary
   */
  stateMap: Record<string, State<any>>

  stateReactors: Record<string, ReactorRoot>

  actions: {
    /** All queues that have been created */
    queues: Map<ActionQueueHandle, ActionQueueInstance>
    /** Cached actions */
    cached: Array<Required<ResolvedActionType>>
    /** Incoming actions */
    incoming: Array<Required<ResolvedActionType>>
    /** All actions that have been applied, in the order they were processed */
    history: Array<ResolvedActionType>
    /** All action UUIDs that have been processed and should not be processed again */
    knownUUIDs: Set<string>
    /** Outgoing actions */
    outgoing: Record<
      Topic,
      {
        /** All actions that are waiting to be sent */
        queue: Array<Required<ResolvedActionType>>
        /** All actions that have been sent */
        history: Array<Required<ResolvedActionType>>
        /** All incoming action UUIDs that have been processed */
        forwardedUUIDs: Set<string>
      }
    >
  }

  receptors: Record<string, () => void>

  /** active reactors */
  activeReactors: Set<ReactorRoot>

  logger: (component: string) => {
    debug: (...message: any[]) => void
    info: (...message: any[]) => void
    warn: (...message: any[]) => void
    error: (...message: any[]) => void
    fatal: (...message: any[]) => void
  }
}

export class HyperFlux {
  static store: HyperStore
}

export function createHyperStore(options?: {
  getDispatchTime?: () => number
  defaultDispatchDelay?: () => number
  getCurrentReactorRoot?: () => ReactorRoot | undefined
}) {
  const store: HyperStore = {
    defaultTopic: 'default' as Topic,
    forwardingTopics: new Set<Topic>(),
    getDispatchTime: options?.getDispatchTime ?? (() => 0),
    defaultDispatchDelay: options?.defaultDispatchDelay ?? (() => 0),
    getCurrentReactorRoot: options?.getCurrentReactorRoot ?? (() => undefined),
    userID: '' as UserID,
    peerID: uuidv4() as PeerID,
    stateMap: {},
    stateReactors: {},
    actions: {
      queues: new Map(),
      cached: [],
      incoming: [],
      history: [],
      knownUUIDs: new Set(),
      outgoing: {}
    },
    receptors: {},
    activeReactors: new Set(),
    logger: (component: string) => ({
      debug: (...message: string[]) => console.debug(`[${component}]`, ...message),
      info: (...message: string[]) => console.info(`[${component}]`, ...message),
      warn: (...message: string[]) => console.warn(`[${component}]`, ...message),
      error: (...message: string[]) => console.error(`[${component}]`, ...message),
      fatal: (...message: string[]) => console.error(`[${component}]`, ...message)
    })
  }
  HyperFlux.store = store
  return store
}

export const disposeStore = (store = HyperFlux.store) => {
  for (const reactor of store.activeReactors) {
    ReactorReconciler.flushSync(() => reactor.stop())
  }
}
