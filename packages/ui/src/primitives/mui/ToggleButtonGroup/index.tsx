import { ToggleButtonGroup as MuiToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material'
import React from 'react'

import ToggleButton from '@xrengine/ui/src/primitives/mui/ToggleButton'

const ToggleButtonGroup = (props: ToggleButtonGroupProps) => <MuiToggleButtonGroup {...props} />

ToggleButtonGroup.displayName = 'ToggleButtonGroup'

ToggleButtonGroup.defaultProps = {
  value: 'default',
  children: <ToggleButton />
}

export default ToggleButtonGroup
