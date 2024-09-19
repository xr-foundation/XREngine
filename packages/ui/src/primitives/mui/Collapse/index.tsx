
import { CollapseProps, Collapse as MuiCollapse } from '@mui/material'
import React from 'react'

import Card from '@xrengine/ui/src/primitives/mui/Card'

const Collapse = (props: CollapseProps) => <MuiCollapse {...props} />

Collapse.displayName = 'Collapse'

Collapse.defaultProps = {
  in: false,
  collapsedSize: 100,
  children: <Card />
}

export default Collapse
