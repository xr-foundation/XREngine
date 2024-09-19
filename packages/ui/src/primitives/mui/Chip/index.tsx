import { ChipProps, Chip as MuiChip } from '@mui/material'
import React from 'react'

const Chip = (props: ChipProps) => <MuiChip {...props} />

Chip.displayName = 'Chip'

Chip.defaultProps = {
  label: "I'm a Chip"
}

export default Chip
