import React from 'react'

import { RouterState } from '@xrengine/client-core/src/common/services/RouterService'

import { useFind } from '@xrengine/common'
import { clientSettingPath } from '@xrengine/common/src/schema.type.module'
import { EditorNavbarProfile } from './EditorNavbarProfile'
import styles from './styles.module.scss'

export const EditorNavbar = () => {
  const clientSettingQuery = useFind(clientSettingPath)
  const clientSettings = clientSettingQuery.data[0]

  const routeHome = () => {
    RouterState.navigate('/')
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div
          className={styles.logoBlock}
          style={{ backgroundImage: `url(${clientSettings?.appTitle})` }}
          onClick={routeHome}
        ></div>
        <EditorNavbarProfile />
      </div>
    </nav>
  )
}
