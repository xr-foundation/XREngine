import { ToggleButton as MuiToggleButton, ToggleButtonProps } from '@mui/material'
import React from 'react'

const ToggleButton = (props: ToggleButtonProps) => <MuiToggleButton {...props} />

ToggleButton.displayName = 'ToggleButton'

ToggleButton.defaultProps = {
  value: 'default'
}

export default ToggleButton
