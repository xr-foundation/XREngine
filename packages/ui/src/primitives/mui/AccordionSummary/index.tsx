
import { AccordionSummaryProps, AccordionSummary as MuiAccordionSummary } from '@mui/material'
import React from 'react'

const AccordionSummary = (props: AccordionSummaryProps) => <MuiAccordionSummary {...props} />

AccordionSummary.displayName = 'AccordionSummary'

AccordionSummary.defaultProps = {
  children: <div>hello, I'm an Accordian Summary</div>
}

export default AccordionSummary
