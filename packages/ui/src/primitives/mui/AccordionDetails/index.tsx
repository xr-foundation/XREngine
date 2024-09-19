
import { AccordionDetailsProps, AccordionDetails as MuiAccordionDetails } from '@mui/material'
import React from 'react'

const AccordionDetails = (props: AccordionDetailsProps) => <MuiAccordionDetails {...props} />

AccordionDetails.displayName = 'AccordionDetails'

AccordionDetails.defaultProps = {
  children: <div>Hello, I'm an Accordian Details!</div>
}

export default AccordionDetails
