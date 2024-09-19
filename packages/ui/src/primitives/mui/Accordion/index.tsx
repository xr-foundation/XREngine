
import { AccordionProps, Accordion as MuiAccordion } from '@mui/material'
import React from 'react'

import AccordionDetails from '@xrengine/ui/src/primitives/mui/AccordionDetails'
import AccordionSummary from '@xrengine/ui/src/primitives/mui/AccordionSummary'

const Accordion = (props: AccordionProps) => <MuiAccordion {...props} />

Accordion.displayName = 'Accordion'

Accordion.defaultProps = {
  open: false,
  children: [<AccordionSummary key="1" />, <AccordionDetails key="2" />]
}

export default Accordion
