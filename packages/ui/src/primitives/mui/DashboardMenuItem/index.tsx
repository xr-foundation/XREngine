
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { AllowedAdminRoutesState } from '@xrengine/client-core/src/admin/AllowedAdminRoutesState'
import { getMutableState, NO_PROXY, useHookstate } from '@xrengine/hyperflux'
import Divider from '@xrengine/ui/src/primitives/mui/Divider'
import List from '@xrengine/ui/src/primitives/mui/List'
import ListItem from '@xrengine/ui/src/primitives/mui/ListItem'
import ListItemIcon from '@xrengine/ui/src/primitives/mui/ListItemIcon'
import ListItemText from '@xrengine/ui/src/primitives/mui/ListItemText'

import styles from './index.module.scss'

const DashboardMenuItem = () => {
  const location = useLocation()
  const { pathname } = location

  const { t } = useTranslation()

  const allowedRoutes = useHookstate(getMutableState(AllowedAdminRoutesState)).get(NO_PROXY)

  return (
    <>
      <Divider />
      <List>
        {Object.entries(allowedRoutes)
          .filter(([path, sidebarItem]) => sidebarItem.access)
          .map(([path, sidebarItem], index) => {
            return (
              <Link key={index} to={path} className={styles.textLink} title={t(sidebarItem.name)}>
                <ListItem
                  classes={{ selected: styles.selected }}
                  style={{ color: 'var(--iconButtonColor)' }}
                  selected={path === pathname}
                  button
                >
                  <ListItemIcon className={styles.drawerIconColor}>{sidebarItem.icon}</ListItemIcon>
                  <ListItemText primary={t(sidebarItem.name)} />
                </ListItem>
              </Link>
            )
          })}
      </List>
    </>
  )
}

export default DashboardMenuItem
