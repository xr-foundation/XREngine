
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import React from 'react'

import { PopupMenuServices } from '@xrengine/client-core/src/user/components/UserMenu/PopupMenuService'
import { AuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { UserMenus } from '@xrengine/client-core/src/user/UserUISystem'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import { MdPerson } from 'react-icons/md'

export const EditorNavbarProfile = () => {
  const name = useHookstate(getMutableState(AuthState).user.name)

  const handleClick = () => {
    PopupMenuServices.showPopupMenu(UserMenus.Profile)
  }

  return (
    <>
      <Button
        onClick={handleClick}
        className="flex items-center"
        endIcon={<MdPerson className="text-2xl" />}
        variant="transparent"
      >
        <span>{name.value}</span>
      </Button>
    </>
  )
}
