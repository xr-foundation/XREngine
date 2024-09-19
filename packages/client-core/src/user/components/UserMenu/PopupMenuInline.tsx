import ClickAwayListener from '@mui/material/ClickAwayListener'
import React from 'react'

import { getMutableState, getState, useHookstate } from '@xrengine/hyperflux'

import { PopupMenuServices, PopupMenuState } from './PopupMenuService'

export const PopupMenuInline = () => {
  const openMenu = useHookstate(getMutableState(PopupMenuState).openMenu)
  const popupMenu = getState(PopupMenuState)
  const Panel = openMenu.value ? popupMenu.menus[openMenu.value] : null

  return (
    <ClickAwayListener onClickAway={() => PopupMenuServices.showPopupMenu()} mouseEvent="onMouseDown">
      <>
        {Panel && (
          <div style={{ pointerEvents: 'auto' }}>
            <Panel {...popupMenu.params} />
          </div>
        )}
      </>
    </ClickAwayListener>
  )
}
