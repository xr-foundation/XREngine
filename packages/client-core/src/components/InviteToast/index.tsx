import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { UserName } from '@xrengine/common/src/schema.type.module'
import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'
import { Button } from '@xrengine/editor/src/components/inputs/Button'
import { useMutableState } from '@xrengine/hyperflux'

import { InviteService, InviteState } from '../../social/services/InviteService'
import { AuthState } from '../../user/services/AuthService'
import styles from './index.module.scss'

const InviteToast = () => {
  const inviteState = useMutableState(InviteState)
  const authState = useMutableState(AuthState)
  const newestInvite =
    inviteState.receivedInvites.total.value > 0 ? inviteState.receivedInvites.invites[0].value : ({} as any)
  const { t } = useTranslation()

  useEffect(() => {
    if (inviteState.receivedUpdateNeeded.value && authState.isLoggedIn.value)
      InviteService.retrieveReceivedInvites(undefined, undefined, 'createdAt', 'desc')
  }, [inviteState.receivedUpdateNeeded.value, authState.isLoggedIn.value])

  const acceptInvite = (invite) => {
    InviteService.acceptInvite(invite)
  }

  const declineInvite = (invite) => {
    InviteService.declineInvite(invite)
  }
  return (
    <div
      className={`${styles.inviteToast} ${
        inviteState.receivedInvites.total.value > 0 ? styles.animateLeft : styles.fadeOutLeft
      }`}
    >
      <div className={`${styles.toastContainer} `}>
        {newestInvite?.inviteType && (
          <span>
            {capitalizeFirstLetter(newestInvite?.inviteType).replace('-', ' ')} invite from{' '}
            {newestInvite.user?.name as UserName}
          </span>
        )}
        <div className={`${styles.btnContainer}`}>
          <Button style={{ color: 'primary' }} className={styles.acceptBtn} onClick={() => acceptInvite(newestInvite)}>
            {t('social:invite.accept')}
          </Button>
          <Button
            style={{ color: 'primary' }}
            className={styles.declineBtn}
            onClick={() => declineInvite(newestInvite)}
          >
            {t('social:invite.decline')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InviteToast
