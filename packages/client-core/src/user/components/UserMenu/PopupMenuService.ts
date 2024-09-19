import { defineState, getMutableState, none } from '@xrengine/hyperflux'

export const PopupMenuState = defineState({
  name: 'PopupMenuState',
  initial: () => ({
    openMenu: null as string | null,
    params: null as object | null,
    menus: {} as { [id: string]: UserMenuPanelType },
    hotbar: {} as { [id: string]: { icon: React.ReactNode; tooltip: string } }
  })
})

type UserMenuPanelType = (...props: any & { setActiveMenu: (menu: string) => void }) => JSX.Element

export const PopupMenuServices = {
  showPopupMenu: (id?: string, params?: any) => {
    getMutableState(PopupMenuState).merge({ openMenu: id ?? null, params: params ?? null })
  },

  registerPopupMenu: (
    id: string,
    menu?: UserMenuPanelType,
    tooltip?: string,
    icon?: React.ReactNode,
    unregister?: boolean
  ) => {
    const s = getMutableState(PopupMenuState)
    if (unregister) {
      s.menus.merge({ [id]: none })
      s.hotbar.merge({ [id]: none })
    } else {
      if (menu) s.menus.merge({ [id]: menu })
      if (icon) s.hotbar.merge({ [id]: { icon: icon!, tooltip: tooltip! } })
    }
  }
}
