
import { RadioGroup as MuiRadioGroup, RadioGroupProps } from '@mui/material'
import React from 'react'

const RadioGroup = (props: RadioGroupProps) => <MuiRadioGroup {...props} />

RadioGroup.displayName = 'RadioGroup'

RadioGroup.defaultProps = { children: null }

export default RadioGroup
