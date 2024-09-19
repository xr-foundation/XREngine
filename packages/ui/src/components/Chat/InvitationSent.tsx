import React from 'react'

import { UserName } from '@xrengine/common/src/schema.type.module'

import UserIcon from './assets/user.svg'

export const InvitationSent = () => {
  const InviteSent: { name: UserName; date: string }[] = [
    { name: 'John Laouireen' as UserName, date: '12 Aug 2021' },
    { name: 'John Laouireen' as UserName, date: '12 Aug 2021' },
    { name: 'John Laouireen' as UserName, date: '12 Aug 2021' },
    { name: 'John Laouireen' as UserName, date: '12 Aug 2021' }
  ]
  return (
    <div className="h-[86%] w-[460px] bg-[#15171B]">
      <div className="mt-2 flex flex-wrap gap-1">
        {InviteSent.map((item) => {
          return (
            <div className="ml-4 mt-1 flex h-[45px] w-[450px] flex-wrap rounded-[10px] bg-[#15171B]">
              <div className="my-2 ml-4 h-[30px] w-[30px] justify-between rounded-full bg-[#26282B]">
                <img className="mx-2 h-[28.64px] w-[13.64px] max-w-full overflow-hidden" alt="" src={UserIcon} />
              </div>
              <div className="ml-1 justify-items-start">
                <p className="mt-[9px] w-[120px] justify-items-start text-[12px] font-bold text-white">{item.name}</p>
                <p className="w-[80px] justify-items-start text-[8px] font-normal text-white">{item.date}</p>
              </div>
              <div className="ml-[144px] mt-2 flex flex-wrap gap-3">
                <button className="m-0 h-7 w-[98px] cursor-pointer rounded-[20px] bg-[#3C3230] p-0">
                  <div className="font-segoe-ui rounded-2xl text-left text-[11px] text-sm text-[#DD3333] [text-align-last:center]">
                    UNINVITE
                  </div>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
