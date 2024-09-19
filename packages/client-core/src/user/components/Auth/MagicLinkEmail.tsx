import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useFind } from '@xrengine/common'
import config from '@xrengine/common/src/config'
import { authenticationSettingPath, UserID } from '@xrengine/common/src/schema.type.module'
import { useHookstate, useMutableState } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/mui/Button'
import Checkbox from '@xrengine/ui/src/primitives/mui/Checkbox'
import Container from '@xrengine/ui/src/primitives/mui/Container'
import FormControlLabel from '@xrengine/ui/src/primitives/mui/FormControlLabel'
import Grid from '@xrengine/ui/src/primitives/mui/Grid'
import TextField from '@xrengine/ui/src/primitives/mui/TextField'
import Typography from '@xrengine/ui/src/primitives/mui/Typography'

import { initialAuthState } from '../../../common/initialAuthState'
import { AuthService, AuthState } from '../../services/AuthService'
import styles from './index.module.scss'

interface Props {
  type?: 'email' | 'sms' | undefined
  isAddConnection?: boolean
}

const defaultState = {
  emailPhone: '',
  isSubmitted: false,
  isAgreedTermsOfService: false,
  label: '',
  descr: ''
}

const termsOfService = config.client.tosAddress ?? '/terms-of-service'

const MagicLinkEmail = ({ type, isAddConnection }: Props): JSX.Element => {
  const auth = useMutableState(AuthState)
  const state = useHookstate(defaultState)
  const { t } = useTranslation()
  const authSetting = useFind(authenticationSettingPath).data.at(0)
  const authState = useHookstate(initialAuthState)

  useEffect(() => {
    if (authSetting) {
      const temp = { ...initialAuthState }
      authSetting?.authStrategies?.forEach((el) => {
        Object.entries(el).forEach(([strategyName, strategy]) => {
          temp[strategyName] = strategy
        })
      })
      authState.set(temp)
    }
  }, [authSetting])

  const handleInput = (e: any): void => {
    state.set({ ...state.value, [e.target.name]: e.target.value })
  }

  const handleCheck = (e: any): void => {
    state.set({ ...state.value, [e.target.name]: e.target.checked })
  }

  const handleSubmit = (e: any): void => {
    e.preventDefault()
    if (!isAddConnection) {
      AuthService.createMagicLink(state.emailPhone.value, authState.value)
      state.set({ ...state.value, isSubmitted: true })
      return
    }

    const user = auth.user
    const userId = user ? user.id.value : ('' as UserID)
    if (type === 'email') {
      AuthService.addConnectionByEmail(state.emailPhone.value, userId)
    } else {
      AuthService.addConnectionBySms(state.emailPhone.value, userId)
    }
  }
  let descr = ''
  let label = ''

  useEffect(() => {
    // Pass in a type
    if (type === 'email') {
      descr = t('user:auth.magiklink.descriptionEmail')
      label = t('user:auth.magiklink.lbl-email')
      return
    } else if (type === 'sms') {
      descr = t('user:auth.magiklink.descriptionSMS')
      label = t('user:auth.magiklink.lbl-phone')
      return
    } else if (!authSetting) {
      descr = t('user:auth.magiklink.descriptionEmail')
      label = t('user:auth.magiklink.lbl-email')
      return
    }
    // Auth config is using Sms and Email, so handle both
    if (authState?.value?.emailMagicLink && authState?.value?.smsMagicLink && !type) {
      descr = t('user:auth.magiklink.descriptionEmailSMS')
      label = t('user:auth.magiklink.lbl-emailPhone')
    } else if (authState?.value?.smsMagicLink) {
      descr = t('user:auth.magiklink.descriptionSMSUS')
      label = t('user:auth.magiklink.lbl-phone')
    } else {
      descr = t('user:auth.magiklink.descriptionEmail')
      label = t('user:auth.magiklink.lbl-email')
    }

    state.set({ ...state.value, label: label, descr: descr })
  }, [])

  return (
    <Container component="main" maxWidth="xs">
      <div>
        <Typography component="h1" variant="h5">
          {t('user:auth.magiklink.header')}
        </Typography>

        <Typography variant="body2" color="textSecondary" align="center">
          {state.descr.value}
        </Typography>

        <form className={styles.form} noValidate onSubmit={(e) => handleSubmit(e)}>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="emailPhone"
                label={state.label.value}
                name="emailPhone"
                // autoComplete="email"
                autoFocus
                onChange={(e) => handleInput(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    value={true}
                    onChange={(e) => handleCheck(e)}
                    color="primary"
                    name="isAgreedTermsOfService"
                  />
                }
                label={
                  <div className={styles.termsLink}>
                    {t('user:auth.magiklink.agree')}
                    <Link to={termsOfService}>{t('user:auth.magiklink.terms')}</Link>
                  </div>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={styles.submit}
                disabled={!state.isAgreedTermsOfService.value}
              >
                {t('user:auth.magiklink.lbl-submit')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  )
}

export default MagicLinkEmail
