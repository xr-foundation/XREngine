import { Slider as MuiSlider, SliderProps } from '@mui/material'
import React from 'react'

const Slider = (props: SliderProps) => <MuiSlider {...props} />

Slider.displayName = 'Slider'

Slider.defaultProps = { children: null }

export default Slider
