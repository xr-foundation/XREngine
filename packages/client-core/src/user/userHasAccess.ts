import { getState, useMutableState } from '@xrengine/hyperflux'

import { AuthState } from './services/AuthService'

export const useUserHasAccessHook = (scope: string) => {
  const authState = useMutableState(AuthState)
  const hasScope = authState.value.user?.scopes?.find((r) => r.type === scope)
  return Boolean(hasScope)
}

export const userHasAccess = (scope: string) => {
  const authState = getState(AuthState)
  const hasScope = authState.user?.scopes?.find((r) => r.type === scope)
  return Boolean(hasScope)
}
