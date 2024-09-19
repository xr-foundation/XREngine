import { CardProps, Card as MuiCard } from '@mui/material'
import React from 'react'

import CardContent from '@xrengine/ui/src/primitives/mui/CardContent'

// import Typography from '@xrengine/ui/src/primitives/mui/Typography'

const Card = (props: CardProps) => <MuiCard {...props} />

Card.displayName = 'Card'

Card.defaultProps = {
  sx: { minWidth: 275 },
  children: (
    <>
      <CardContent />
    </>
  )
}

export default Card
