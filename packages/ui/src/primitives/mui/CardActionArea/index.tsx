import { CardActionAreaProps, CardActionArea as MuiCardActionArea } from '@mui/material'
import React from 'react'

const CardActionArea = (props: CardActionAreaProps) => <MuiCardActionArea {...props} />

CardActionArea.displayName = 'CardActionArea'

CardActionArea.defaultProps = {}

export default CardActionArea
