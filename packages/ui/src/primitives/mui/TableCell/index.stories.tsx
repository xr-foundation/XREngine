
import React from 'react'

import Table from '@xrengine/ui/src/primitives/mui/Table'
import TableBody from '@xrengine/ui/src/primitives/mui/TableBody'
import TableRow from '@xrengine/ui/src/primitives/mui/TableRow'

import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/TableCell',
  component: Component,
  parameters: {
    componentSubtitle: 'TableCell',
    jest: 'TableCell.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  decorators: [
    (Story) => (
      <Table>
        <TableBody>
          <TableRow>
            <Story />
          </TableRow>
        </TableBody>
      </Table>
    )
  ],
  argTypes
}

export const Default = { args: Component.defaultProps }
