
import { InputAdornmentProps, InputAdornment as MuiInputAdornment } from '@mui/material'
import React from 'react'

import Icon from '@xrengine/ui/src/primitives/mui/Icon'

const InputAdornment = (props: InputAdornmentProps & { position?: any }) => <MuiInputAdornment {...props} />

InputAdornment.displayName = 'InputAdornment'

InputAdornment.defaultProps = {
  position: 'end',
  children: <Icon type="AccountCircle" />
}

export default InputAdornment
