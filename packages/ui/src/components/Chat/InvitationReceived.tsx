
import React from 'react'
import { ImCross } from 'react-icons/im'
import { TiTick } from 'react-icons/ti'

import { UserName } from '@xrengine/common/src/schema.type.module'

import UserIcon from './assets/user.svg'

export const InvitationReceived = () => {
  const InviteReceived: { name: UserName; date: string }[] = [
    { name: 'John Laouireen' as UserName, date: '12 Aug 2021' },
    { name: 'John Laouireen' as UserName, date: '12 Aug 2021' },
    { name: 'John Laouireen' as UserName, date: '12 Aug 2021' },
    { name: 'John Laouireen' as UserName, date: '12 Aug 2021' }
  ]

  return (
    <div className="h-[86%] w-[460px] bg-[#15171B]">
      <div className="mt-2 flex flex-wrap gap-1">
        {InviteReceived.map((item) => {
          return (
            <div className="ml-4 mt-1 flex h-[45px] w-[450px] flex-wrap rounded-[10px] bg-[#15171B]">
              <div className="my-2 ml-4 h-[30px] w-[30px] justify-between rounded-full bg-[#26282B]">
                <img className="mx-2 h-[28.64px] w-[13.64px] max-w-full overflow-hidden" alt="" src={UserIcon} />
              </div>
              <div className="ml-1 justify-items-start">
                <p className="mt-[9px] w-[120px] justify-items-start text-[12px] font-bold text-white">{item.name}</p>
                <p className="w-[80px] justify-items-start  text-[8px] font-normal text-white">{item.date}</p>
              </div>
              <div className="ml-[175px] mt-1 flex flex-wrap gap-3">
                <div className="my-2  h-[24px] w-[24px] justify-between rounded-full bg-[#26282B]">
                  <button className="m-0 w-[30px] ">
                    <ImCross className="mx-1 ml-[6.1px] mt-[6px] h-[12px] w-[13px] overflow-hidden fill-[#DD3333]" />
                  </button>
                </div>
                <div className="my-2  h-[24px] w-[24px] justify-between rounded-full bg-[#26282B]">
                  <button className="m-0 w-[30px] ">
                    <TiTick className="mx-1 ml-[0px] h-[24px] w-[24px]  overflow-hidden fill-[#57C290]" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
