
import React from 'react'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { getMutableState, NO_PROXY, useHookstate } from '@xrengine/hyperflux'

import ClickawayListener from '../ClickawayListener'

const PopupMenu = () => {
  const popoverElement = useHookstate(getMutableState(PopoverState).elements)
  return (
    <>
      {popoverElement.get(NO_PROXY).map((element, idx) => {
        return (
          <div key={idx} className="block">
            <ClickawayListener>{element ?? undefined}</ClickawayListener>
          </div>
        )
      })}
    </>
  )
}
PopupMenu.displayName = 'PopupMenu'

PopupMenu.defaultProps = {}

export default PopupMenu
