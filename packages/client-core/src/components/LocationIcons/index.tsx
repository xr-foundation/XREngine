
import React from 'react'

import { TouchGamepad } from '@xrengine/client-core/src/common/components/TouchGamepad'
import { UserMenu } from '@xrengine/client-core/src/user/components/UserMenu'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import { iOS } from '@xrengine/spatial/src/common/functions/isMobile'

import { LoadingSystemState } from '../../systems/state/LoadingState'
import { ARPlacement } from '../ARPlacement'
import { Fullscreen } from '../Fullscreen'
import { InstanceChatWrapper } from '../InstanceChat'
import { MediaIconsBox } from '../MediaIconsBox'
import { Shelves } from '../Shelves'
import { UserMediaWindows } from '../UserMediaWindows'
import { XRLoading } from '../XRLoading'
import styles from './index.module.scss'

export const LocationIcons = () => {
  const loadingScreenOpacity = useHookstate(getMutableState(LoadingSystemState).loadingScreenOpacity)
  return (
    <>
      <UserMenu />
      {/** Container for fading most stuff in and out depending on if the location is loaded or not  */}
      <div style={{ opacity: 1 - loadingScreenOpacity.value }}>
        <div className={`${styles.rightSidebar}`}>
          <UserMediaWindows />
          <InstanceChatWrapper />
        </div>
        <Shelves />
        <ARPlacement />
        <XRLoading />
        <MediaIconsBox />
        <TouchGamepad />
        {!iOS && <Fullscreen />}
      </div>
    </>
  )
}
