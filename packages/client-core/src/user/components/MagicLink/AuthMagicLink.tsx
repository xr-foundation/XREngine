
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { InstanceID } from '@xrengine/common/src/schema.type.module'
import Box from '@xrengine/ui/src/primitives/mui/Box'
import Container from '@xrengine/ui/src/primitives/mui/Container'
import Typography from '@xrengine/ui/src/primitives/mui/Typography'

import { AuthService } from '../../services/AuthService'

interface Props {
  //auth: any
  type: string
  token: string
  instanceId: InstanceID
  path: string
}

const AuthMagicLink = ({ token, type, instanceId, path }: Props): JSX.Element => {
  const { t } = useTranslation()
  useEffect(() => {
    if (type === 'login') {
      let redirectSuccess = path ? `${path}` : null
      if (redirectSuccess && instanceId != null)
        redirectSuccess += redirectSuccess.indexOf('?') > -1 ? `&instanceId=${instanceId}` : `?instanceId=${instanceId}`
      AuthService.loginUserByJwt(token, redirectSuccess || '/', '/')
    } else if (type === 'connection') {
      AuthService.loginUserMagicLink(token, '/', '/')
    }
  }, [])

  return (
    <Container component="main" maxWidth="md">
      <Box mt={3}>
        <Typography variant="body2" color="textSecondary" align="center">
          {t('user:magikLink.wait')}
        </Typography>
      </Box>
    </Container>
  )
}

const AuthMagicLinkWrapper = (props: any): JSX.Element => {
  const search = new URLSearchParams(useLocation().search)
  const token = search.get('token') as string
  const type = search.get('type') as string
  const path = search.get('path') as string
  const instanceId = search.get('instanceId') as InstanceID

  return <AuthMagicLink {...props} token={token} type={type} instanceId={instanceId} path={path} />
}

export default AuthMagicLinkWrapper
