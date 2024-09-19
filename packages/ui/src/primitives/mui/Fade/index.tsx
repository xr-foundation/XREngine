
import { FadeProps, Fade as MuiFade } from '@mui/material'
import React from 'react'

import Typography from '@xrengine/ui/src/primitives/mui/Typography'

const Fade = (props: FadeProps) => <MuiFade {...props} />

Fade.displayName = 'Fade'

Fade.defaultProps = {
  children: (
    <div>
      <Typography />
    </div>
  )
}

export default Fade
