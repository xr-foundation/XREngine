import React from 'react'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { useHookstate } from '@xrengine/hyperflux'

// todo move this to core engine
const ClickawayListener = (props: { children: JSX.Element }) => {
  const childOver = useHookstate(false)
  return (
    <div
      className="fixed inset-0 z-40 bg-gray-800 bg-opacity-50"
      onMouseDown={() => {
        if (childOver.value) return
        PopoverState.hidePopupover()
      }}
    >
      <div
        className="flex h-full w-full items-center justify-center"
        onMouseEnter={() => childOver.set(true)}
        onMouseLeave={() => childOver.set(false)}
      >
        {props.children}
      </div>
    </div>
  )
}

ClickawayListener.displayName = 'ClickawayListener'

ClickawayListener.defaultProps = {
  children: null
}

export default ClickawayListener
