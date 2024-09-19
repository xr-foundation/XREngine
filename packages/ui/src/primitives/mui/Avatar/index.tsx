
import { AvatarProps, Avatar as MuiAvatar } from '@mui/material'
import React from 'react'

const Avatar = (props: AvatarProps) => <MuiAvatar {...props} />

Avatar.displayName = 'Avatar'

Avatar.defaultProps = {}

export default Avatar
