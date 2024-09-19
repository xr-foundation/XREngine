import { Table, TableBody } from '@mui/material'
import React from 'react'

import TableRow from '@xrengine/ui/src/primitives/mui/TableRow'

import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/TablePagination',
  component: Component,
  parameters: {
    componentSubtitle: 'TablePagination',
    jest: 'TablePagination.test.tsx',
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
