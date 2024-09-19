import React, { createContext, useEffect, useMemo } from 'react'

import { AppThemeState, getAppTheme, useAppThemeName } from '@xrengine/client-core/src/common/services/AppThemeState'
import { AuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useFind } from '@xrengine/common'
import { ClientThemeOptionsType, clientSettingPath } from '@xrengine/common/src/schema.type.module'
import { useHookstate, useMutableState } from '@xrengine/hyperflux'

export interface ThemeContextProps {
  theme: string
  setTheme: (theme: string) => void
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: 'dark',
  setTheme: () => {}
})

export const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const authState = useMutableState(AuthState)
  const selfUser = authState.user

  const clientSettingQuery = useFind(clientSettingPath)
  const clientSetting = clientSettingQuery.data[0]
  const appTheme = useMutableState(AppThemeState)

  const clientThemeSettings = useHookstate({} as Record<string, ClientThemeOptionsType>)

  const currentThemeName = useAppThemeName()

  useEffect(() => {
    const html = document.querySelector('html')
    if (html) {
      html.dataset.theme = currentThemeName
      updateTheme()
    }
  }, [selfUser?.userSetting?.value])

  useEffect(() => {
    if (clientSetting) {
      clientThemeSettings.set(clientSetting?.themeSettings)
    }
  }, [clientSetting])

  useEffect(() => {
    updateTheme()
  }, [clientThemeSettings, appTheme.customTheme, appTheme.customThemeName])

  const updateTheme = () => {
    const theme = getAppTheme()
    if (theme)
      for (const variable of Object.keys(theme)) {
        ;(document.querySelector(`[data-theme=${currentThemeName}]`) as any)?.style.setProperty(
          '--' + variable,
          theme[variable]
        )
      }
  }

  const val = useMemo(
    () => ({
      theme: currentThemeName,
      setTheme: (theme: string) => {
        // todo - set theme
      }
    }),
    [currentThemeName]
  )

  return <ThemeContext.Provider value={val}>{children}</ThemeContext.Provider>
}
