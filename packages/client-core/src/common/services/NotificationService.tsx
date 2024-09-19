
import { SnackbarKey, SnackbarProvider, VariantType, closeSnackbar } from 'notistack'
import React, { CSSProperties, Fragment, useEffect, useRef } from 'react'

import multiLogger from '@xrengine/common/src/logger'
import { defineState, getState, useMutableState } from '@xrengine/hyperflux'

import { MdClose } from 'react-icons/md'

const logger = multiLogger.child({ component: 'client-core:Notification' })

export const NotificationState = defineState({
  name: 'xrengine.client.NotificationState',
  initial: {
    snackbar: null as SnackbarProvider | null | undefined
  }
})

export type NotificationOptions = {
  variant: VariantType // 'default' | 'error' | 'success' | 'warning' | 'info'
  actionType?: keyof typeof NotificationActions
  persist?: boolean
  style?: CSSProperties
  hideIconVariant?: boolean
}

export const defaultAction = (key: SnackbarKey, content?: React.ReactNode) => {
  return (
    <Fragment>
      {content}
      <button onClick={() => closeSnackbar(key)}>
        <MdClose size="1.2rem" />
      </button>
    </Fragment>
  )
}

export const NotificationActions = {
  default: defaultAction
}

export const NotificationService = {
  dispatchNotify(message: React.ReactNode, options: NotificationOptions) {
    if (options?.variant === 'error') {
      logger.error(new Error(message!.toString()))
    }

    const state = getState(NotificationState)
    return state.snackbar?.enqueueSnackbar(message, {
      variant: options.variant,
      action: NotificationActions[options.actionType ?? 'default'],
      persist: options.persist,
      style: options.style,
      hideIconVariant: options.hideIconVariant
    })
  },
  closeNotification(key: SnackbarKey) {
    const state = getState(NotificationState)
    state.snackbar?.closeSnackbar(key)
  }
}

export const NotificationSnackbar = (props: { style?: CSSProperties }) => {
  const notistackRef = useRef<SnackbarProvider>()
  const notificationstate = useMutableState(NotificationState)

  useEffect(() => {
    notificationstate.snackbar.set(notistackRef.current)
  }, [notistackRef.current])

  return (
    <SnackbarProvider
      ref={notistackRef as any}
      maxSnack={7}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      action={defaultAction}
      style={props.style}
    />
  )
}
