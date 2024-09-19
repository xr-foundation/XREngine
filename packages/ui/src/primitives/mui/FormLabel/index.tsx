
import { FormLabelProps, FormLabel as MuiFormLabel } from '@mui/material'
import React from 'react'

const FormLabel = (props: FormLabelProps) => <MuiFormLabel {...props} />

FormLabel.displayName = 'FormLabel'

FormLabel.defaultProps = { children: null }

export default FormLabel
