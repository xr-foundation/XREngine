
import { CircularProgressProps, CircularProgress as MuiCircularProgress } from '@mui/material'
import React from 'react'

const CircularProgress = (props: CircularProgressProps & any) => <MuiCircularProgress {...props} />

CircularProgress.displayName = 'CircularProgress'

CircularProgress.defaultProps = {}

export default CircularProgress
