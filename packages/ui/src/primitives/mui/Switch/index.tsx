
import { Switch as MuiSwitch, SwitchProps } from '@mui/material'
import React from 'react'

const Switch = (props: SwitchProps) => <MuiSwitch {...props} />

Switch.displayName = 'Switch'

Switch.defaultProps = {}

export default Switch
