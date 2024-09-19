
import * as bitECS from 'bitecs'
import React, { ErrorInfo, FC, memo, Suspense, useLayoutEffect, useMemo } from 'react'

import { getState, HyperFlux, startReactor, useForceUpdate, useImmediateEffect } from '@xrengine/hyperflux'

import { Component, useOptionalComponent } from './ComponentFunctions'
import { Entity } from './Entity'
import { EntityContext } from './EntityFunctions'
import { defineSystem } from './SystemFunctions'
import { PresentationSystemGroup } from './SystemGroups'
import { SystemState } from './SystemState'

export function defineQuery(components: (bitECS.Component | bitECS.QueryModifier)[]) {
  const query = bitECS.defineQuery(components) as bitECS.Query
  const enterQuery = bitECS.enterQuery(query)
  const exitQuery = bitECS.exitQuery(query)

  const wrappedQuery = () => {
    return query(HyperFlux.store) as Entity[]
  }
  wrappedQuery.enter = () => {
    return enterQuery(HyperFlux.store) as Entity[]
  }
  wrappedQuery.exit = () => {
    return exitQuery(HyperFlux.store) as Entity[]
  }

  wrappedQuery._query = query
  wrappedQuery._enterQuery = enterQuery
  wrappedQuery._exitQuery = exitQuery
  return wrappedQuery
}

export function removeQuery(query: ReturnType<typeof defineQuery>) {
  bitECS.removeQuery(HyperFlux.store, query._query)
  bitECS.removeQuery(HyperFlux.store, query._enterQuery)
  bitECS.removeQuery(HyperFlux.store, query._exitQuery)
}

export type QueryComponents = (Component<any> | bitECS.QueryModifier | bitECS.Component)[]

export const ReactiveQuerySystem = defineSystem({
  uuid: 'xrengine.hyperflux.ReactiveQuerySystem',
  insert: { after: PresentationSystemGroup },
  execute: () => {
    for (const { query, forceUpdate } of getState(SystemState).reactiveQueryStates) {
      const entitiesAdded = query.enter().length
      const entitiesRemoved = query.exit().length
      if (entitiesAdded || entitiesRemoved) forceUpdate()
    }
  }
})

/**
 * Use a query in a reactive context (a React component)
 * - "components" argument must not change
 */
export function useQuery(components: QueryComponents) {
  const query = defineQuery(components)
  const eids = query()
  removeQuery(query)

  const forceUpdate = useForceUpdate()

  // Use a layout effect to ensure that `queryResult`
  // is deleted from the `reactiveQueryStates` map immediately when the current
  // component is unmounted, before any other code attempts to set it
  // (component state can't be modified after a component is unmounted)
  useLayoutEffect(() => {
    const query = defineQuery(components)
    const queryState = { query, forceUpdate, components }
    getState(SystemState).reactiveQueryStates.add(queryState)
    return () => {
      removeQuery(query)
      getState(SystemState).reactiveQueryStates.delete(queryState)
    }
  }, [])

  // create an effect that forces an update when any components in the query change
  // use an immediate effect to ensure that the reactor is initialized even if this component becomes suspended during this render
  useImmediateEffect(() => {
    function UseQueryEntityReactor({ entity }: { entity: Entity }) {
      return (
        <>
          {components.map((C) => {
            const Component = ('isComponent' in C ? C : (C as any)()[0]) as Component
            return (
              <UseQueryComponentReactor
                entity={entity}
                key={Component.name}
                Component={Component}
              ></UseQueryComponentReactor>
            )
          })}
        </>
      )
    }

    function UseQueryComponentReactor(props: { entity: Entity; Component: Component }) {
      useOptionalComponent(props.entity, props.Component)
      forceUpdate()
      return null
    }

    const root = startReactor(function UseQueryReactor() {
      return (
        <>
          {eids.map((entity) => (
            <UseQueryEntityReactor key={entity} entity={entity}></UseQueryEntityReactor>
          ))}
        </>
      )
    })

    return () => {
      root.stop()
    }
  }, [JSON.stringify(eids)])

  return eids
}

export type Query = ReturnType<typeof defineQuery>

const QuerySubReactor = memo((props: { entity: Entity; ChildEntityReactor: FC; props?: any }) => {
  return (
    <>
      <QueryReactorErrorBoundary>
        <Suspense fallback={null}>
          <EntityContext.Provider value={props.entity}>
            <props.ChildEntityReactor {...props.props} />
          </EntityContext.Provider>
        </Suspense>
      </QueryReactorErrorBoundary>
    </>
  )
})

export const QueryReactor = memo((props: { Components: QueryComponents; ChildEntityReactor: FC; props?: any }) => {
  const entities = useQuery(props.Components)
  const MemoChildEntityReactor = useMemo(() => memo(props.ChildEntityReactor), [props.ChildEntityReactor])
  return (
    <>
      {entities.map((entity) => (
        <QuerySubReactor key={entity} entity={entity} ChildEntityReactor={MemoChildEntityReactor} props={props.props} />
      ))}
    </>
  )
})

interface ErrorState {
  error: Error | null
}

class QueryReactorErrorBoundary extends React.Component<any, ErrorState> {
  public state: ErrorState = {
    error: null
  }

  public static getDerivedStateFromError(error: Error): ErrorState {
    // Update state so the next render will show the fallback UI.
    return { error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    return this.state.error ? null : this.props.children
  }
}
