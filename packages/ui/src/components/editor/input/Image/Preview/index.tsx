
import React from 'react'

import ImageInput from '..'
import InputGroup from '../../Group'
import { StringInputProps } from '../../String'

export const ImageContainer = ({ children }) => {
  return <div className="flex h-auto flex-col items-center justify-start gap-2">{children}</div>
}

export default function ImagePreviewInput({
  value,
  onRelease,
  label,
  previewOnly,
  ...rest
}: StringInputProps & { label?: string; previewOnly?: boolean }) {
  return (
    <ImageContainer>
      {label && <div className="self-stretch text-[8px] font-normal leading-3 text-neutral-200">{label}</div>}
      <div className="flex flex-col items-start justify-start gap-1 rounded-t-md bg-[#1A1A1A] p-1">
        <div className="h-[274px] w-[305px]">
          <div className="flex h-[274px] w-[305px] justify-center rounded-t-md">
            <div className="h-auto w-auto rounded">
              <img
                src={value}
                alt="No Image"
                crossOrigin="anonymous"
                className="h-full w-full rounded object-contain text-white"
              />
            </div>
          </div>
        </div>
        {(previewOnly === undefined || previewOnly === false) && (
          <div className="inline-flex w-[305px] items-center justify-center gap-2.5 self-stretch rounded-b-md bg-[#1A1A1A] px-2 py-1">
            <ImageInput className="bg-[#242424]" containerClassName="w-full" value={value} onRelease={onRelease} />
          </div>
        )}
      </div>
    </ImageContainer>
  )
}

ImagePreviewInput.defaultProps = {
  value: 'https://fastly.picsum.photos/id/1065/200/300.jpg?hmac=WvioY_uR2xNPKNxQoR9y1HhWkuV6_v7rB23clZYh0Ks',
  onRelease: () => {}
}

export function ImagePreviewInputGroup({ name, label, value, onRelease, ...rest }) {
  return (
    <InputGroup name={name} label={label} {...rest}>
      <ImagePreviewInput value={value} onRelease={onRelease} />
    </InputGroup>
  )
}
