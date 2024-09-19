
import { FormControlProps, FormControl as MuiFormControl } from '@mui/material'
import React from 'react'

const FormControl = (props: FormControlProps) => <MuiFormControl {...props} />

FormControl.displayName = 'FormControl'

FormControl.defaultProps = { children: null }

export default FormControl
