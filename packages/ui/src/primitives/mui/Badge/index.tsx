
import MailIcon from '@mui/icons-material/Mail'
import { BadgeProps, Badge as MuiBadge } from '@mui/material'
import React from 'react'

const Badge = (props: BadgeProps) => <MuiBadge {...props} />

Badge.displayName = 'Badge'

Badge.defaultProps = {
  badgeContent: 4,
  children: <MailIcon color="action" />
}

export default Badge
