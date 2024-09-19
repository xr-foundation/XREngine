import { Tabs as MuiTabs, TabsProps } from '@mui/material'
import React from 'react'

import Tab from '@xrengine/ui/src/primitives/mui/Tab'

const Tabs = (props: TabsProps) => <MuiTabs {...props} />

Tabs.displayName = 'Tabs'

Tabs.defaultProps = { value: 0, children: <Tab /> }

export default Tabs
