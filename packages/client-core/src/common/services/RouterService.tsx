
import { createBrowserHistory, History } from 'history'
import i18n from 'i18next'
import React, { lazy, useEffect, useLayoutEffect } from 'react'
import { BrowserRouterProps as NativeBrowserRouterProps, Router, useSearchParams } from 'react-router-dom'

import { API } from '@xrengine/common'
import { routePath, RouteType } from '@xrengine/common/src/schema.type.module'
import { defineState, getMutableState, NO_PROXY, startReactor, useHookstate } from '@xrengine/hyperflux'
import { loadRoute } from '@xrengine/projects/loadRoute'

type SearchParamsType = { [key: string]: string }

export const history = createBrowserHistory()

export interface BrowserRouterProps extends Omit<NativeBrowserRouterProps, 'window'> {
  history: History
}

export const BrowserRouter: React.FC<BrowserRouterProps> = React.memo((props) => {
  const { history, ...restProps } = props
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location
  })

  useLayoutEffect(() => history.listen(setState), [history])

  return <Router {...restProps} location={state.location} navigationType={state.action} navigator={history} />
})

export const RouterState = defineState({
  name: 'RouterState',
  initial: {},
  navigate: (pathname: string, searchParams: SearchParamsType | { redirectUrl: string } = {}) => {
    const urlSearchParams = new URLSearchParams(searchParams)

    if (urlSearchParams.toString().length > 0) {
      history.push(`${pathname}?${urlSearchParams}`)
    } else {
      history.push(pathname)
    }
  }
})

export const SearchParamState = defineState({
  name: 'SearchParamState',
  initial: {} as SearchParamsType,
  set: (key: string, value: string) => {
    getMutableState(SearchParamState)[key].set(value)
  }
})

/** This hook wraps useSearchParams in a hyperflux state such that we can reactively change params in reactors */
export const useSearchParamState = () => {
  const [search, setSearchParams] = useSearchParams()

  useEffect(() => {
    const searchParams = Object.fromEntries(search)
    getMutableState(SearchParamState).set(searchParams)
  }, [search])

  /** Create a nested reactor to react to state changes */
  useEffect(() => {
    const SubReactor = (props: { keyID: string }) => {
      const value = useHookstate(getMutableState(SearchParamState)[props.keyID]).value

      useEffect(() => {
        const location = new URL(window.location as any)
        const params = new URLSearchParams(location.search)
        const current = Object.fromEntries([...params.entries()])

        if (current[props.keyID] === value) return

        setSearchParams({ ...current, [props.keyID]: value })

        return () => {
          const current = Object.fromEntries([...params.entries()])
          delete current[props.keyID]
          setSearchParams(current)
        }
      }, [value])

      return null
    }

    const reactor = startReactor(() => {
      const keys = useHookstate(getMutableState(SearchParamState)).keys
      return (
        <>
          {keys.map((key) => (
            <SubReactor keyID={key} key={key} />
          ))}
        </>
      )
    })

    return () => {
      reactor.stop()
    }
  }, [])
}

export type CustomRoute = {
  route: string
  component: ReturnType<typeof lazy>
  componentProps?: {
    [x: string]: any
  }
  props?: {
    [x: string]: any
    exact?: boolean
  }
}

/**
 * getCustomRoutes used to get the routes created by the user.
 */
export const getCustomRoutes = async (): Promise<CustomRoute[]> => {
  const routes = (await API.instance.service(routePath).find({ query: { paginate: false } })) as any as RouteType[]

  const elements: CustomRoute[] = []

  if (!Array.isArray(routes) || routes == null) {
    throw new Error(i18n.t('editor:errors.fetchingRouteError', { error: i18n.t('editor:errors.unknownError') }))
  } else {
    await Promise.all(
      routes.map(async (project) => {
        const routeLazyLoad = await loadRoute(project.project, project.route)
        if (routeLazyLoad)
          elements.push({
            route: project.route,
            ...routeLazyLoad
          })
      })
    )
  }

  return elements.filter((c) => !!c)
}

export const useCustomRoutes = () => {
  const customRoutes = useHookstate([] as CustomRoute[])

  useEffect(() => {
    getCustomRoutes().then((routes) => {
      customRoutes.set(routes)
    })
  }, [])

  return customRoutes.get(NO_PROXY) as CustomRoute[]
}
