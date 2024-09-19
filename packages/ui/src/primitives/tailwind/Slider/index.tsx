import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface SliderProps {
  className?: string
  value: number
  min?: number
  max?: number
  step?: number
  width?: number
  onChange: (value: number) => void
  onRelease: (value: number) => void
}

/**
 * @param props.width width of the slider in pixels
 */
const Slider = ({ value, min = 0, max = 100, step = 1, width = 200, onChange, onRelease, className }: SliderProps) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseFloat(event.target.value)
    if (isNaN(newValue)) {
      newValue = min
    } else {
      newValue = Math.min(Math.max(newValue, min), max)
    }
    onChange(newValue)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value)
    onChange(newValue)
  }

  const gradientPercent = Math.round(((value - min) / (max - min)) * 100)

  const sliderStyle = {
    background: `linear-gradient(to right, #214AA6 ${gradientPercent}%, #191B1F ${gradientPercent}%)`
  }

  return (
    <div className="flex flex-nowrap items-center gap-2">
      <input
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        onBlur={() => onRelease && onRelease(value)}
        className="h-8 w-14 rounded bg-neutral-900 text-center text-sm font-normal leading-[21px] text-neutral-400"
      />
      <input
        id="slider"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        onPointerUp={() => onRelease && onRelease(value)}
        step={step}
        type="range"
        style={sliderStyle}
        className={twMerge(
          `w-[${width}px] h-8 cursor-pointer appearance-none overflow-hidden rounded bg-[#111113] focus:outline-none
          disabled:pointer-events-none disabled:opacity-50
          [&::-moz-range-progress]:bg-[#214AA6]
          [&::-moz-range-thumb]:h-full
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:rounded
          [&::-moz-range-thumb]:bg-[#849ED6]
          [&::-moz-range-thumb]:transition-all
          [&::-moz-range-thumb]:duration-150
          [&::-moz-range-thumb]:ease-in-out
          [&::-moz-range-track]:h-full
          [&::-moz-range-track]:w-full
          [&::-moz-range-track]:rounded
          [&::-moz-range-track]:bg-[#111113]
          [&::-webkit-slider-runnable-track]:h-full
          [&::-webkit-slider-runnable-track]:w-full
          [&::-webkit-slider-runnable-track]:rounded
          [&::-webkit-slider-thumb]:h-full
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded
          [&::-webkit-slider-thumb]:bg-[#849ED6]
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:duration-150
          [&::-webkit-slider-thumb]:ease-in-out`,
          className
        )}
      />
    </div>
  )
}

Slider.defaultProps = {
  min: 0,
  max: 100,
  step: 1,
  value: 60
}

export default Slider
