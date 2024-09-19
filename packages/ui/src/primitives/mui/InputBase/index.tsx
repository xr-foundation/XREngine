
import { InputBaseProps, InputBase as MuiInputBase } from '@mui/material'
import React from 'react'

const InputBase = (props: InputBaseProps) => <MuiInputBase {...props} />

InputBase.displayName = 'InputBase'

InputBase.defaultProps = {}

export default InputBase
