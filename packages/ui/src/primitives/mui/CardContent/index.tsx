
import { CardContentProps, CardContent as MuiCardContent } from '@mui/material'
import React from 'react'

import CardMedia from '@xrengine/ui/src/primitives/mui/CardMedia'
import Typography from '@xrengine/ui/src/primitives/mui/Typography'

const CardContent = (props: CardContentProps) => <MuiCardContent {...props} />

CardContent.displayName = 'CardContent'

CardContent.defaultProps = {
  children: (
    <>
      <Typography />
      <CardMedia />
    </>
  )
}

export default CardContent
