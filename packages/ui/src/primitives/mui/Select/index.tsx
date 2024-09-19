
import { Select as MuiSelect, SelectProps } from '@mui/material'
import React from 'react'

const Select = (props: SelectProps) => <MuiSelect {...props} />

Select.displayName = 'Select'

Select.defaultProps = { children: null }

export default Select
