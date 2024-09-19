
import { InputLabelProps, InputLabel as MuiInputLabel } from '@mui/material'
import React from 'react'

const InputLabel = (props: InputLabelProps) => <MuiInputLabel {...props} />

InputLabel.displayName = 'InputLabel'

InputLabel.defaultProps = { children: null }

export default InputLabel
