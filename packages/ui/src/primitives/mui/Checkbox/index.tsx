
import { CheckboxProps, Checkbox as MuiCheckbox } from '@mui/material'
import React from 'react'

const Checkbox = (props: CheckboxProps) => <MuiCheckbox {...props} />

Checkbox.displayName = 'Checkbox'

Checkbox.defaultProps = {}

export default Checkbox
