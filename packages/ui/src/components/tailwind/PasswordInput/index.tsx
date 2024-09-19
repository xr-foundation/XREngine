import React, { forwardRef } from 'react'
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'

import { useHookstate } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input, { InputProps } from '@xrengine/ui/src/primitives/tailwind/Input'

const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  (props: InputProps, ref: React.Ref<HTMLInputElement>) => {
    const show = useHookstate(false)

    const toggleShow = () => {
      show.set(!show.value)
    }

    return (
      <Input
        ref={ref}
        {...props}
        type={show.value ? 'text' : 'password'}
        endComponent={
          <Button onClick={toggleShow} className="bg-transperant pointer-events-auto mr-3.5 px-0">
            {show.value ? (
              <HiOutlineEyeSlash className="text-theme-primary" />
            ) : (
              <HiOutlineEye className="text-theme-primary" />
            )}
          </Button>
        }
      />
    )
  }
)

export default PasswordInput
