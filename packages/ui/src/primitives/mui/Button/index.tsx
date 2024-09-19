
import { ButtonProps, Button as MuiButton } from '@mui/material'
import React from 'react'

const Button = ({ children, ...props }: ButtonProps & { component?: string }) => (
  <MuiButton {...props}>{children}</MuiButton>
)

Button.displayName = 'Button'

Button.defaultProps = {
  children: "I'm a button"
}

export default Button
