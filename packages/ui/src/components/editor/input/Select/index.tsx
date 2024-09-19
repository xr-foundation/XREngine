import React from 'react'
import { MdOutlineHeatPump, MdOutlineWatch, MdOutlineWindPower } from 'react-icons/md'
import Select, { SelectProps } from '../../../../primitives/tailwind/Select'

/**Tailwind `Select` styled for studio */
const SelectInput = ({
  value,
  ...rest
}: Omit<SelectProps<string | number>, 'currentValue'> & { value: string | number }) => {
  return (
    <Select
      currentValue={value}
      inputContainerClassName="rounded-lg overflow-hidden"
      inputClassName="text-[#8B8B8D] text-xs bg-[#1A1A1A] border-none"
      {...rest}
    />
  )
}

SelectInput.displayName = 'SelectInput'
SelectInput.defaultProps = {
  options: [
    { label: 'Cuboid', value: 'a', icon: <MdOutlineWatch /> },
    { label: 'Cylinder', value: 'b', icon: <MdOutlineHeatPump /> },
    { label: 'Cube', value: 'c', icon: <MdOutlineWindPower /> }
  ],
  value: 'a',
  onChange: () => {}
}

export default SelectInput
