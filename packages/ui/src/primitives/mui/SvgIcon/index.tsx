import { SvgIcon as MuiSvgIcon, SvgIconProps } from '@mui/material'
import React from 'react'

const SvgIcon = (props: SvgIconProps) => <MuiSvgIcon {...props} />

SvgIcon.displayName = 'SvgIcon'

SvgIcon.defaultProps = { children: null }

export default SvgIcon
