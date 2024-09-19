import React, { useState } from 'react'

import { InvitationReceived } from './InvitationReceived'
import { InvitationSent } from './InvitationSent'

export const Invitation = () => {
  const [activeButton, setActiveButton] = useState<number>(1)

  const handleButtonClick = (buttonId: number) => {
    setActiveButton(buttonId)
  }

  const [activeComponent, setActiveComponent] = useState<string>('InviteReceived')

  const handleButtonClickComp = (component: string) => {
    setActiveComponent(component)
  }

  return (
    <div className="absolute flex h-[70%] w-[460px] flex-1 flex-wrap bg-[#15171B]">
      <div className="flex h-[70px] w-full flex-wrap gap-3 bg-[#15171B]">
        <button className="m-0">
          <div
            className={`ml-[80px] mr-[50px] ${activeButton === 1 ? 'text-[#935CFF]' : 'text-[#ffff]'}`}
            onClick={() => {
              handleButtonClick(1)
              handleButtonClickComp('InviteReceived')
            }}
          >
            <p className="mr-4 mt-5 w-[30px] font-semibold">RECEIVED</p>
          </div>
        </button>
        <div className="mr-8 mt-7 box-border w-[70px] rotate-90 border-t-[1px] border-solid border-[#f6f7f8]" />
        <button className="m-0">
          <div
            className={`ml-[20px] ${activeButton === 2 ? 'text-[#935CFF]' : 'text-[#ffff]'}`}
            onClick={() => {
              handleButtonClick(2)
              handleButtonClickComp('InviteSent')
            }}
          >
            <p className="mt-5  w-[30px] font-semibold">SENT</p>
          </div>
        </button>
        <div
          className={`mt-4 box-border w-[230px] border-t-[1px] border-solid  border-[#f6f7f8] ${
            activeButton === 1 ? 'ml-[230px]' : 'mr-[230px]'
          }`}
        />
      </div>
      {activeComponent === 'InviteReceived' && <InvitationReceived />}
      {activeComponent === 'InviteSent' && <InvitationSent />}
    </div>
  )
}
