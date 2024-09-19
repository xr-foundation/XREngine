
import { FormControlLabelProps, FormControlLabel as MuiFormControlLabel } from '@mui/material'
import React from 'react'

import Checkbox from '@xrengine/ui/src/primitives/mui/Checkbox'

const FormControlLabel = (props: FormControlLabelProps) => <MuiFormControlLabel {...props} />

FormControlLabel.displayName = 'FormControlLabel'

FormControlLabel.defaultProps = {
  control: <Checkbox />,
  label: 'Label'
}

export default FormControlLabel
