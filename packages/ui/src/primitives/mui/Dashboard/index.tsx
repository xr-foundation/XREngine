import { useTheme } from '@mui/material/styles'
import React from 'react'

import { PopupMenuInline } from '@xrengine/client-core/src/user/components/UserMenu/PopupMenuInline'
import { PopupMenuServices } from '@xrengine/client-core/src/user/components/UserMenu/PopupMenuService'
import { AuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { UserMenus } from '@xrengine/client-core/src/user/UserUISystem'
import { useMutableState } from '@xrengine/hyperflux'
import AppBar from '@xrengine/ui/src/primitives/mui/AppBar'
import DashboardMenuItem from '@xrengine/ui/src/primitives/mui/DashboardMenuItem'
import Drawer from '@xrengine/ui/src/primitives/mui/Drawer'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'
import IconButton from '@xrengine/ui/src/primitives/mui/IconButton'
import Typography from '@xrengine/ui/src/primitives/mui/Typography'

import styles from './index.module.scss'

/**@deprecated */
function _clsx(...classes: any[]) {
  return classes
    .filter(Boolean)
    .reduce((acc, className) => {
      if (typeof className === 'object') {
        return acc.concat(
          Object.entries(className)
            .filter(([_, value]) => value)
            .map(([key]) => key)
        )
      }
      return acc.concat(className)
    }, [])
    .join(' ')
}

/**
 * Function for admin dashboard
 *
 * @param param0 children props
 * @returns @ReactDomElements
 */

const Dashboard = ({ children }) => {
  const authState = useMutableState(AuthState)
  const theme = useTheme()
  const [open, setOpen] = React.useState(false)
  const { user } = authState

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    PopupMenuServices.showPopupMenu(UserMenus.Profile)
  }

  const handleDrawerOpen = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setOpen(open)
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <PopupMenuInline />
      <AppBar position="fixed" className={styles.appBar}>
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen(true)}
              edge="start"
              className={_clsx(styles.menuButton, {
                [styles.hide]: open
              })}
              size="large"
              icon={<Icon type="Menu" />}
            />
            <div className={styles.appBarHeadingContainer}>
              <Typography variant="h6">Dashboard</Typography>

              <IconButton
                onClick={handleClick}
                className={styles.profileButton}
                disableRipple
                icon={
                  <>
                    <span>{user.name.value}</span>
                    <Icon type="Person" />
                  </>
                }
              />
            </div>
          </div>
        </nav>
      </AppBar>
      <Drawer
        variant={open ? 'temporary' : 'permanent'}
        className={_clsx(styles.drawer, {
          [styles.drawerOpen]: open,
          [styles.drawerClose]: !open
        })}
        classes={{
          paper: _clsx({
            [styles.drawerOpen]: open,
            [styles.drawerClose]: !open
          })
        }}
        open={open}
        onClose={handleDrawerOpen(false)}
      >
        <div className={styles.toolbar}>
          <IconButton
            onClick={handleDrawerOpen(false)}
            style={{ color: 'var(--iconButtonColor)' }}
            size="large"
            icon={<Icon type={theme.direction === 'rtl' ? 'ChevronRight' : 'ChevronLeft'} />}
          />
        </div>
        <DashboardMenuItem />
      </Drawer>
      <main
        className={_clsx(styles.content, {
          [styles.contentWidthDrawerOpen]: open,
          [styles.contentWidthDrawerClosed]: !open
        })}
      >
        {children}
      </main>
    </div>
  )
}

Dashboard.displayName = 'Dashboard'

Dashboard.defaultProps = {
  children: <div>hello</div>,
  user: {
    name: {
      value: 'default name'
    }
  }
}

export default Dashboard
