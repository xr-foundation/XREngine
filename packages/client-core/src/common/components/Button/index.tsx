import { SxProps, Theme } from '@mui/material/styles'
import React from 'react'

import Text from '@xrengine/client-core/src/common/components/Text'
import Box from '@xrengine/ui/src/primitives/mui/Box'
import { default as MUIButton } from '@xrengine/ui/src/primitives/mui/Button'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'
import IconButton from '@xrengine/ui/src/primitives/mui/IconButton'

import { handleSoundEffect } from '../../utils'
import styles from './index.module.scss'

interface Props {
  autoFocus?: boolean
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  disableRipple?: boolean
  endIcon?: React.ReactNode
  fullWidth?: boolean
  id?: string
  open?: boolean
  size?: 'medium'
  startIcon?: React.ReactNode
  sx?: SxProps<Theme>
  title?: string
  type?: 'outlined' | 'gradient' | 'gradientRounded' | 'solid' | 'solidRounded' | 'expander'
  width?: string
  onClick?: () => void
}

const Button = ({
  autoFocus,
  children,
  className,
  disabled,
  disableRipple,
  endIcon,
  fullWidth,
  id,
  open,
  size,
  startIcon,
  sx,
  title,
  type,
  width,
  onClick
}: Props) => {
  if (type === 'expander') {
    return (
      <Box
        id={id}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', ...sx }}
        onClick={onClick}
        onPointerUp={handleSoundEffect}
        onPointerEnter={handleSoundEffect}
      >
        <Text variant="body2">{children}</Text>
        <IconButton icon={open ? <Icon type="KeyboardArrowUp" /> : <Icon type="KeyboardArrowDown" />} />
      </Box>
    )
  }

  let baseStyle = ''
  if (type === 'outlined') {
    baseStyle = styles.outlinedButton
  } else if (type === 'gradient' || type === 'gradientRounded') {
    baseStyle = styles.gradientButton
  } else if (type === 'solid' || type === 'solidRounded') {
    baseStyle = styles.solidButton
  }

  if (type === 'gradientRounded' || type === 'solidRounded') {
    baseStyle = `${baseStyle} ${styles.roundedButton}`
  }

  let newSx: SxProps<Theme> = { ...sx }
  if (fullWidth) {
    newSx = { width: '100%', ...sx }
  }
  if (size === 'medium') {
    newSx = { width: '100%', maxWidth: '250px', ...sx }
  }
  if (width) {
    newSx = { width: width, ...sx }
  }

  return (
    <MUIButton
      autoFocus={autoFocus}
      className={`${baseStyle} ${className ?? ''}`}
      disabled={disabled}
      disableRipple={disableRipple}
      endIcon={endIcon}
      id={id}
      startIcon={startIcon}
      sx={newSx}
      title={title}
      onClick={onClick}
      onPointerUp={handleSoundEffect}
      onPointerEnter={handleSoundEffect}
    >
      {children}
    </MUIButton>
  )
}

export default Button
