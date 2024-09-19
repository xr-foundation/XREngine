import { FormHelperTextProps, FormHelperText as MuiFormHelperText } from '@mui/material'
import React from 'react'

const FormHelperText = (props: FormHelperTextProps) => <MuiFormHelperText {...props} />

FormHelperText.displayName = 'FormHelperText'

FormHelperText.defaultProps = { children: null }

export default FormHelperText
