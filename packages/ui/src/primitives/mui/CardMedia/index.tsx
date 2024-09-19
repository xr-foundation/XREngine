
import { CardMediaProps, CardMedia as MuiCardMedia } from '@mui/material'
import React from 'react'

const CardMedia = (props: CardMediaProps) => <MuiCardMedia {...props} />

CardMedia.displayName = 'CardMedia'

CardMedia.defaultProps = {
  component: 'img',
  height: '194',
  image: 'https://avatars.githubusercontent.com/u/61642798?s=200&v=4',
  alt: 'Car Content'
}

export default CardMedia
