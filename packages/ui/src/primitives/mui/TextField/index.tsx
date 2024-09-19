
import { TextField as MuiTextField, TextFieldProps } from '@mui/material'
import React from 'react'

const TextField = ({ children, ...props }: TextFieldProps) => <MuiTextField {...props}>{children}</MuiTextField>

TextField.displayName = 'TextField'

TextField.defaultProps = {
  children: 'hello'
}

export default TextField
