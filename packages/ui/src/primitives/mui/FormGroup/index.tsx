
import { FormGroupProps, FormGroup as MuiFormGroup } from '@mui/material'
import React from 'react'

const FormGroup = (props: FormGroupProps) => <MuiFormGroup {...props} />

FormGroup.displayName = 'FormGroup'

FormGroup.defaultProps = { children: null }

export default FormGroup
