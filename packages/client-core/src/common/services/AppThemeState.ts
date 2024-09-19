import { defaultThemeSettings, getCurrentTheme } from '@xrengine/common/src/constants/DefaultThemeSettings'
import { ClientThemeOptionsType } from '@xrengine/common/src/schema.type.module'
import { defineState, getMutableState, getState, useMutableState } from '@xrengine/hyperflux'

import { AuthState } from '../../user/services/AuthService'

/** @deprected this is the thene for mui pages, it will be replaced with ThemeService / ThemeState */
export const AppThemeState = defineState({
  name: 'AppThemeState',
  initial: () => ({
    mode: 'auto' as 'auto' | 'profile' | 'custom',
    customTheme: null as ClientThemeOptionsType | null,
    customThemeName: null as string | null
  }),
  setTheme: (theme?: ClientThemeOptionsType, themeName?: string) => {
    const themeState = getMutableState(AppThemeState)
    themeState.customTheme.set(theme ?? null)
    themeState.customThemeName.set(themeName ?? null)
    themeState.mode.set(themeName ? 'custom' : 'auto')
  }
})

export const useAppThemeName = (): string => {
  const themeState = useMutableState(AppThemeState)
  const authState = useMutableState(AuthState)

  if (themeState.mode.value === 'custom' && themeState.customThemeName.value) return themeState.customThemeName.value

  return getCurrentTheme(authState.user?.userSetting?.value?.themeModes)
}

export const getAppThemeName = (): string => {
  const themeState = getMutableState(AppThemeState)
  const authState = getMutableState(AuthState)

  if (themeState.mode.value === 'custom' && themeState.customThemeName.value) return themeState.customThemeName.value

  return getCurrentTheme(authState.user?.userSetting?.value?.themeModes)
}

export const getAppTheme = () => {
  const themeState = getState(AppThemeState)
  if (themeState.mode === 'custom' && themeState.customTheme) return themeState.customTheme

  const authState = getState(AuthState)
  const theme = getCurrentTheme(authState.user?.userSetting?.themeModes)
  return defaultThemeSettings[theme]
}
